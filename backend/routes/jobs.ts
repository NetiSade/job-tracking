import express, { Request, Response } from 'express';
import { createSupabaseClient } from '../config/supabase';
import { CreateJobInput, UpdateJobInput } from '../types';

const router = express.Router();

// Middleware to extract auth token and create authenticated Supabase client
const getAuthenticatedClient = (req: Request) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  return createSupabaseClient(token);
};

// Get all jobs (filtered by user via RLS)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Get single job (must belong to user via RLS)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Create job (user_id automatically set via auth.uid() in RLS)
router.post('/', async (req: Request<{}, {}, CreateJobInput>, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);
    const { company, position, status, priority, comments } = req.body;
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        company,
        position,
        status: status || 'wishlist',
        priority: priority || 'medium',
        comments: comments || ''
      })
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Update job (must belong to user via RLS)
router.put('/:id', async (req: Request<{ id: string }, {}, UpdateJobInput>, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);
    const { company, position, status, priority, comments } = req.body;
    
    const { data, error } = await supabase
      .from('jobs')
      .update({
        company,
        position,
        status,
        priority,
        comments,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// Delete job (must belong to user via RLS)
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getAuthenticatedClient(req);
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;

