import request from 'supertest';
import { app } from '../server';
import { createSupabaseClient } from '../config/supabase';

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock config/supabase
jest.mock('../config/supabase', () => ({
  createSupabaseClient: jest.fn(),
  default: {},
}));

describe('Jobs API', () => {
  const mockSelect = jest.fn();
  const mockOrder = jest.fn();
  const mockIn = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();
  const mockInsert = jest.fn();
  const mockLimit = jest.fn();
  const mockMaybeSingle = jest.fn();
  const mockGetUser = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  // Helper to create a chainable and thenable mock object
  const createChainable = (data: any = { data: [], error: null }) => {
    const chainable: any = {
      then: (onfulfilled?: (value: any) => any) => Promise.resolve(data).then(onfulfilled),
    };
    
    // Attach methods to the chainable object
    chainable.select = mockSelect;
    chainable.order = mockOrder;
    chainable.eq = mockEq;
    chainable.in = mockIn;
    chainable.single = mockSingle;
    chainable.limit = mockLimit;
    chainable.maybeSingle = mockMaybeSingle;
    chainable.insert = mockInsert;
    chainable.update = mockUpdate;
    chainable.delete = mockDelete;
    
    return chainable;
  };

  const mockSupabase = {
    from: jest.fn(() => createChainable()),
    auth: {
      getUser: mockGetUser,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default implementations to return chainable objects
    mockSelect.mockImplementation(() => createChainable());
    mockOrder.mockImplementation(() => createChainable());
    mockIn.mockImplementation(() => createChainable());
    mockEq.mockImplementation(() => createChainable());
    mockSingle.mockImplementation(() => createChainable({ data: null, error: null }));
    mockInsert.mockImplementation(() => createChainable());
    mockLimit.mockImplementation(() => createChainable());
    mockMaybeSingle.mockImplementation(() => createChainable({ data: null, error: null }));
    mockUpdate.mockImplementation(() => createChainable());
    mockDelete.mockImplementation(() => createChainable());

    // Setup the module mock
    (createSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Default auth
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
  });

  describe('GET /api/jobs', () => {
    it('should return empty list when no jobs exist', async () => {
      // mockOrder is the final call in GET /api/jobs
      mockOrder.mockImplementation(() => createChainable({ data: [], error: null }));
      
      const res = await request(app).get('/api/jobs');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return jobs with comments', async () => {
      const mockJobs = [
        { id: '1', company: 'Test Co', position: 'Dev', status: 'wishlist', sort_order: 0 }
      ];
      const mockComments = [
        { id: 'c1', job_id: '1', content: 'Test comment', created_at: new Date().toISOString() }
      ];

      // We need to distinguish between the two calls to mockOrder (jobs vs comments)
      // First call is for jobs, second is for comments
      mockOrder
        .mockImplementationOnce(() => createChainable({ data: mockJobs, error: null }))
        .mockImplementationOnce(() => createChainable({ data: mockComments, error: null }));

      const res = await request(app).get('/api/jobs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].company).toBe('Test Co');
      expect(res.body[0].comments).toHaveLength(1);
    });
  });

  describe('POST /api/jobs', () => {
    it('should create a new job', async () => {
      const newJob = {
        company: 'New Co',
        position: 'Senior Dev',
        status: 'wishlist',
        salary_expectations: '150k'
      };

      const createdJob = {
        id: '2',
        user_id: 'test-user-id',
        ...newJob,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. mockMaybeSingle for sort_order check
      mockMaybeSingle.mockImplementationOnce(() => createChainable({ data: { sort_order: -1 }, error: null }));

      // 2. mockSingle for insert return
      mockSingle.mockImplementationOnce(() => createChainable({ data: createdJob, error: null }));

      const res = await request(app)
        .post('/api/jobs')
        .send(newJob);

      expect(res.status).toBe(201);
      expect(res.body.company).toBe(newJob.company);
    });

    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Auth error') });

      const res = await request(app)
        .post('/api/jobs')
        .send({ company: 'Fail Co', position: 'Dev' });

      expect(res.status).toBe(401);
    });
  });
});
