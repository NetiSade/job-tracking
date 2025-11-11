import express, { Request, Response } from "express";
import supabase from "../config/supabase";

const router = express.Router();

// Create anonymous user and return token
router.post("/anonymous", async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log("Creating anonymous user...");

    // Create anonymous user via Supabase
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      console.error("Supabase auth error:", error);
      res.status(500).json({ error: error.message });
      return;
    }

    if (!data.session) {
      res.status(500).json({ error: "No session created" });
      return;
    }

    console.log("✅ Anonymous user created:", data.user?.id);

    // Return the access token and refresh token to the client
    res.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user?.id,
      expires_at: data.session.expires_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating anonymous user:", message);
    res.status(500).json({ error: message });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    // Refresh the session using the refresh token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      console.error("Supabase refresh error:", error);
      res.status(401).json({ error: error.message });
      return;
    }

    if (!data.session) {
      res.status(500).json({ error: "No session created" });
      return;
    }

    res.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error refreshing token:", message);
    res.status(500).json({ error: message });
  }
});

export default router;

