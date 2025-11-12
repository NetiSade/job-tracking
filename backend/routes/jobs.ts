import express, { Request, Response } from "express";
import { createSupabaseClient } from "../config/supabase";
import { CreateJobInput, UpdateJobInput } from "../types";

const router = express.Router();

// Middleware to extract auth token and create authenticated Supabase client
const getAuthenticatedClient = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  return createSupabaseClient(token);
};

const transformJob = (job: any) => {
  if (!job) return job;
  const comments = Array.isArray(job.job_comments)
    ? [...job.job_comments].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [];

  const { job_comments, comments: _legacyComments, ...rest } = job;
  return {
    ...rest,
    comments,
  };
};

// Get all jobs (filtered by user via RLS)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);

    // First, get jobs
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (jobsError) {
      console.error("Supabase error fetching jobs:", jobsError);
      throw jobsError;
    }

    if (!jobsData || jobsData.length === 0) {
      res.json([]);
      return;
    }

    // Then, get comments for all jobs
    const jobIds = jobsData.map((job) => job.id);
    const { data: commentsData, error: commentsError } = await supabase
      .from("job_comments")
      .select("*")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("Supabase error fetching comments:", commentsError);
      // Don't fail completely if comments fail, just log and continue
      console.warn("Continuing without comments due to error");
    }

    // Group comments by job_id
    const commentsByJobId = new Map<string, any[]>();
    (commentsData || []).forEach((comment) => {
      if (!commentsByJobId.has(comment.job_id)) {
        commentsByJobId.set(comment.job_id, []);
      }
      commentsByJobId.get(comment.job_id)!.push(comment);
    });

    // Combine jobs with their comments
    const jobs = jobsData.map((job) => {
      const comments = commentsByJobId.get(job.id) || [];
      return transformJob({ ...job, job_comments: comments });
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error in GET /api/jobs:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Get single job (must belong to user via RLS)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);

    // Get the job
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (jobError) {
      console.error("Supabase error fetching job:", jobError);
      throw jobError;
    }

    if (!jobData) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    // Get comments for this job
    const { data: commentsData, error: commentsError } = await supabase
      .from("job_comments")
      .select("*")
      .eq("job_id", req.params.id)
      .order("created_at", { ascending: false });

    if (commentsError) {
      console.error("Supabase error fetching comments:", commentsError);
      // Don't fail completely, just use empty array
    }

    const job = transformJob({
      ...jobData,
      job_comments: commentsData || [],
    });

    res.json(job);
  } catch (error) {
    console.error("Error in GET /api/jobs/:id:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// Create job (user_id automatically set via auth.uid() in RLS)
router.post(
  "/",
  async (
    req: Request<{}, {}, CreateJobInput>,
    res: Response
  ): Promise<void> => {
    try {
      const supabase = getAuthenticatedClient(req);
      const { company, position, status, salary_expectations } = req.body;

      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from("jobs")
        .select("sort_order")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxOrderError && maxOrderError.code !== "PGRST116") {
        console.error("Supabase error fetching sort order:", maxOrderError);
        throw maxOrderError;
      }

      const nextSortOrder =
        typeof maxOrderData?.sort_order === "number"
          ? maxOrderData.sort_order + 1
          : 0;

      const requestedSortOrder =
        typeof req.body.sort_order === "number" ? req.body.sort_order : null;

      const initialSortOrder =
        requestedSortOrder !== null && requestedSortOrder >= 0
          ? requestedSortOrder
          : nextSortOrder;

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          company,
          position,
          status: status || "wishlist",
          sort_order: initialSortOrder,
          salary_expectations:
            salary_expectations !== undefined ? salary_expectations : null,
        })
        .select("*")
        .single();

      if (jobError) {
        console.error("Supabase error creating job:", jobError);
        throw jobError;
      }

      if (!jobData) {
        throw new Error("Failed to create job");
      }

      // New job has no comments yet
      const createdJob = transformJob({
        ...jobData,
        job_comments: [],
      });

      res.status(201).json(createdJob);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);

// Reorder jobs (must be before /:id route)
router.put(
  "/reorder",
  async (
    req: Request<{}, {}, { orders: { id: string; sort_order: number }[] }>,
    res: Response
  ): Promise<void> => {
    try {
      const supabase = getAuthenticatedClient(req);
      const { orders } = req.body || {};

      if (!Array.isArray(orders) || orders.length === 0) {
        res.status(400).json({ error: "orders must be a non-empty array" });
        return;
      }

      const normalizedOrders: { id: string; sort_order: number }[] = [];
      const seenIds = new Set<string>();
      for (const entry of orders) {
        if (
          !entry ||
          typeof entry.id !== "string" ||
          !entry.id ||
          typeof entry.sort_order !== "number" ||
          !Number.isFinite(entry.sort_order)
        ) {
          continue;
        }
        if (seenIds.has(entry.id)) {
          continue;
        }
        normalizedOrders.push({
          id: entry.id,
          sort_order: Math.max(0, Math.floor(entry.sort_order)),
        });
        seenIds.add(entry.id);
      }

      if (normalizedOrders.length === 0) {
        res.status(400).json({ error: "No valid order entries provided" });
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const jobIds = normalizedOrders.map((item) => item.id);

      const { data: existingJobs, error: fetchJobsError } = await supabase
        .from("jobs")
        .select("id")
        .eq("user_id", user.id)
        .in("id", jobIds);

      if (fetchJobsError) {
        console.error(
          "Supabase error validating jobs for reorder:",
          fetchJobsError
        );
        throw fetchJobsError;
      }

      if (!existingJobs || existingJobs.length !== normalizedOrders.length) {
        res
          .status(403)
          .json({ error: "One or more jobs are invalid or inaccessible" });
        return;
      }

      // Two-phase update to avoid unique constraint violations:
      // 1. First, set all jobs to unique temporary negative values
      // 2. Then, set them to their final values
      const tempOffset = -1000000;

      // Phase 1: Set unique temporary values
      for (let i = 0; i < normalizedOrders.length; i++) {
        const { id } = normalizedOrders[i];
        const tempValue = tempOffset - i; // Unique temp value for each job
        const { error: tempError } = await supabase
          .from("jobs")
          .update({ sort_order: tempValue })
          .eq("id", id);

        if (tempError) {
          console.error(
            "Supabase error setting temporary sort order:",
            tempError
          );
          throw tempError;
        }
      }

      // Phase 2: Set final values
      for (const { id, sort_order } of normalizedOrders) {
        const { error: updateError } = await supabase
          .from("jobs")
          .update({ sort_order })
          .eq("id", id);

        if (updateError) {
          console.error("Supabase error updating job order:", updateError);
          throw updateError;
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in PUT /api/jobs/reorder:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);

// Update job (must belong to user via RLS)
router.put(
  "/:id",
  async (
    req: Request<{ id: string }, {}, UpdateJobInput>,
    res: Response
  ): Promise<void> => {
    try {
      const supabase = getAuthenticatedClient(req);
      const { company, position, status, salary_expectations, sort_order } =
        req.body;

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (company !== undefined) updateData.company = company;
      if (position !== undefined) updateData.position = position;
      if (status !== undefined) updateData.status = status;
      if (salary_expectations !== undefined)
        updateData.salary_expectations = salary_expectations;
      if (sort_order !== undefined) updateData.sort_order = sort_order;

      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", req.params.id)
        .select("*")
        .single();

      if (jobError) {
        console.error("Supabase error updating job:", jobError);
        throw jobError;
      }

      if (!jobData) {
        throw new Error("Job not found");
      }

      // Get comments for this job
      const { data: commentsData, error: commentsError } = await supabase
        .from("job_comments")
        .select("*")
        .eq("job_id", req.params.id)
        .order("created_at", { ascending: false });

      if (commentsError) {
        console.error("Supabase error fetching comments:", commentsError);
        // Don't fail, just use empty array
      }

      const updatedJob = transformJob({
        ...jobData,
        job_comments: commentsData || [],
      });

      res.json(updatedJob);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);

// Delete job (must belong to user via RLS)
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
