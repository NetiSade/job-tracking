# Project Structure

```
job-tracking-app/
│
├── README.md                    # Main project documentation
├── SETUP.md                     # Quick setup guide
├── .gitignore                   # Git ignore rules
│
├── backend/                     # Node.js Express API
│   ├── config/
│   │   └── supabase.js         # Supabase client configuration
│   ├── routes/
│   │   └── jobs.js             # Job CRUD endpoints
│   ├── server.js               # Express server entry point
│   ├── package.json            # Backend dependencies
│   ├── .gitignore
│   ├── .env.example            # Environment variables template
│   └── README.md               # Backend documentation
│
└── frontend/                    # React Native App
    ├── components/
    │   ├── JobForm.js          # Form to add/edit jobs
    │   ├── JobList.js          # List of all jobs
    │   └── JobItem.js          # Individual job card
    ├── services/
    │   └── api.js              # API client with axios
    ├── App.js                   # Main app component
    ├── config.js               # API URL configuration
    ├── app.json                # Expo configuration
    ├── babel.config.js         # Babel configuration
    ├── package.json            # Frontend dependencies
    ├── .gitignore
    └── README.md               # Frontend documentation
```

## Key Files Explained

### Backend

- **`server.js`**: Main Express server setup with CORS and routing
- **`config/supabase.js`**: Initializes Supabase client with credentials
- **`routes/jobs.js`**: All API endpoints (GET, POST, PUT, DELETE)

### Frontend

- **`App.js`**: Main component with state management and job operations
- **`components/JobForm.js`**: Reusable form for creating/editing jobs
- **`components/JobList.js`**: Container for displaying all jobs
- **`components/JobItem.js`**: Individual job card with badges and actions
- **`services/api.js`**: Centralized API calls using axios
- **`config.js`**: Backend API URL configuration

## Data Flow

1. User interacts with UI components (JobForm, JobItem)
2. App.js handles state and calls functions in `services/api.js`
3. API service makes HTTP requests to Express backend
4. Backend routes interact with Supabase database
5. Data flows back through the same chain to update UI

## Database Schema

**Table: `jobs`**

| Column      | Type      | Constraints                                           |
|-------------|-----------|-------------------------------------------------------|
| id          | UUID      | Primary Key, auto-generated                           |
| company     | TEXT      | NOT NULL                                              |
| position    | TEXT      | NOT NULL                                              |
| status      | TEXT      | NOT NULL, CHECK IN ('wishlist', 'in_progress', 'archived') |
| sort_order  | INTEGER   | NOT NULL, unique per user                             |
| salary_expectations | TEXT | Optional                                         |
| created_at  | TIMESTAMP | Default NOW()                                         |
| updated_at  | TIMESTAMP | Default NOW()                                         |

## API Endpoints

| Method | Endpoint        | Description          |
|--------|-----------------|----------------------|
| GET    | /api/jobs       | Get all jobs         |
| GET    | /api/jobs/:id   | Get single job       |
| POST   | /api/jobs       | Create new job       |
| PUT    | /api/jobs/:id   | Update existing job  |
| PUT    | /api/jobs/reorder | Persist a reordered list of jobs |
| DELETE | /api/jobs/:id   | Delete job           |

## Tech Stack Summary

**Backend:**
- Node.js
- Express.js
- Supabase (PostgreSQL)
- CORS middleware
- dotenv for environment variables

**Frontend:**
- React Native
- Expo (for easy development)
- Axios (HTTP client)
- react-native-draggable-flatlist (drag-and-drop ordering)
- react-native-gesture-handler
- react-native-reanimated
- Native styling with StyleSheet

## Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm start`
3. **Make Changes**: Edit files and see hot-reload in action
4. **Test**: Use the app to create, edit, and delete jobs
5. **Debug**: Check terminal logs for backend and Metro bundler for frontend

