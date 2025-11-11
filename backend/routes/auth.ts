import express, { Request, Response } from 'express';
import supabase from '../config/supabase';

const router = express.Router();

// Create anonymous user and return token
router.post('/anonymous', async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating anonymous user...');
    
    // Create anonymous user via Supabase
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Supabase auth error:', error);
      res.status(500).json({ error: error.message });
      return;
    }
    
    if (!data.session) {
      res.status(500).json({ error: 'No session created' });
      return;
    }
    
    console.log('✅ Anonymous user created:', data.user?.id);
    
    // Return the access token to the client
    res.json({
      token: data.session.access_token,
      user_id: data.user?.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating anonymous user:', message);
    res.status(500).json({ error: message });
  }
});

export default router;

