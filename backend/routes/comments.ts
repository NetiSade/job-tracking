import express, { Request, Response } from "express";
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from "../config/supabase";
import { CreateCommentInput, UpdateCommentInput } from "../types";

const router = express.Router();

const getAuthenticatedClient = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  return createSupabaseClient(token);
};

const ensureJobOwnership = async (
  supabase: SupabaseClient,
  jobId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .single();

  if (error || !data) {
    return false;
  }
  return true;
};

// Create comment for a job
router.post(
  "/jobs/:jobId/comments",
  async (
    req: Request<{ jobId: string }, {}, CreateCommentInput>,
    res: Response
  ): Promise<void> => {
    try {
      const supabase = getAuthenticatedClient(req);
      const { jobId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ error: 'Comment content is required' });
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

      const ownsJob = await ensureJobOwnership(supabase, jobId);
      if (!ownsJob) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const { data, error } = await supabase
        .from("job_comments")
        .insert({
          job_id: jobId,
          user_id: user.id,
          content,
        })
        .select("*")
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);

// Update existing comment
router.put(
  "/comments/:commentId",
  async (
    req: Request<{ commentId: string }, {}, UpdateCommentInput>,
    res: Response
  ): Promise<void> => {
    try {
      const supabase = getAuthenticatedClient(req);
      const { commentId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ error: 'Comment content is required' });
        return;
      }

      const { data, error } = await supabase
        .from("job_comments")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .select("*")
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);

// Delete comment
router.delete(
  "/comments/:commentId",
  async (req: Request<{ commentId: string }>, res: Response): Promise<void> => {
    try {
      const supabase = getAuthenticatedClient(req);
      const { commentId } = req.params;

      const { error } = await supabase
        .from("job_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
);

export default router;
