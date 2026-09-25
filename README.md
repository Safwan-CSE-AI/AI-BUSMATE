# 🚌 AI BusMate — Smart Bus Travel Assistant

> **“Don’t Know Which Bus to Take? Let AI Guide You.”**
> 
> A production-ready, AI-powered public transit web application designed for students and everyday commuters to find the best bus routes with step-by-step boarding instructions, visual timeline navigation, transfer points, and student concession passes.

---

## 🌟 Key Features

1. **AI Route Recommendation Engine**:
   - Recommends the optimal bus route grounded **strictly** in verified transportation network data.
   - Powered by **Google Gemini API** (`@google/genai`) with plain-language reasoning explaining *why* the route was selected.
   - Guaranteed **Zero AI Hallucination**: bus numbers, stops, schedules, and fares are 100% verified against transit database records.
2. **Step-by-Step Visual Timeline**:
   - Visualizes each stage of the trip: **Board Bus ➔ Travel ➔ Transfer / Change Bus (if required) ➔ Alight & Reach Destination**.
   - Highlights exact bus stops, platforms, landmark directions, and interchange layover warnings.
3. **Multi-Preference Route Planning**:
   - **Fastest**: Minimizes overall transit duration.
   - **Cheapest**: Prioritizes lowest ticket fares.
   - **Fewest Transfers**: Prefers direct, zero-transfer buses.
   - **Balanced**: Optimal harmony between travel time, ticket cost, and transfer convenience.
4. **Student Concession Pass**:
   - Automated 50% discount calculations for student pass holders across verified routes.
5. **Alternative Routes & Route Comparison**:
   - Compares direct buses vs. 1-transfer connections side-by-side with duration, fare, and stop sequence details.
6. **Commuter Dashboard**:
   - Instant `From ➔ To ➔ Find Best Bus` fast-search interface.
   - Quick destination shortcuts (Home, University Campus, Hostel, Library).
7. **Favorites & Search History**:
   - Save frequently used places and transit routes.
   - Review past search queries and re-run route plans with one click.
8. **Crowd-Sourced Route Feedback**:
   - Real-time passenger ratings on **Crowd Level** (*Low*, *Moderate*, *High*, *Packed*) and **Punctuality** (*On Time*, *Slightly Delayed*, *Heavily Delayed*, *Early*).
9. **Transit Operations Admin Console**:
   - Manage bus routes, stops, and timetable schedules with real-time transit statistics.
10. **Enterprise Security**:
    - Secrets strictly secured in `.env` (Gemini API key is **never** exposed to the frontend).
    - JWT authentication, bcrypt password hashing, Helmet, CORS, and Express rate limiting.
    - Full PostgreSQL Row Level Security (RLS) policies.

---

## 🏗️ Tech Stack

- **Frontend**:
  - React.js 19
  - Vite 8
  - React Router v7
  - Tailwind CSS v4
  - Lucide React Icons
  - Axios HTTP Client
- **Backend**:
  - Node.js & Express.js
  - JWT Authentication
  - Zod Schema Validation
  - bcryptjs Password Hashing
  - Helmet Security & Express Rate Limiting
  - CORS
- **AI**:
  - Google Gemini API (`@google/genai`)
  - Grounded deterministic transit reasoning engine
- **Database**:
  - Supabase PostgreSQL
  - Row Level Security (RLS) policies
  - Built-in resilient fallback data store for immediate offline demonstrations

---

## 📁 Project Structure

```text
ai-busmate/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, RouteTimeline, RouteCard, StopSelect, FeedbackModal, ProtectedRoute
│   │   ├── context/            # AuthContext (user, token, session)
│   │   ├── pages/              # LandingPage, DashboardPage, SearchPage, ResultsPage, RouteDetailPage, FavoritesPage, HistoryPage, ProfilePage, AdminPage, LoginPage, RegisterPage
│   │   ├── services/           # api.js (Axios client with JWT interceptor)
│   │   ├── App.jsx             # Main Router & Provider Tree
│   │   ├── index.css           # Tailwind CSS design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express Backend API
│   ├── src/
│   │   ├── config/             # env.js, supabase.js
│   │   ├── data/               # seedTransitData.js (12 stops, 6 routes, schedules, fares)
│   │   ├── middleware/         # auth.js, validate.js, errorHandler.js, rateLimiter.js
│   │   ├── routes/             # authRoutes, routeRoutes, stopRoutes, favoriteRoutes, historyRoutes, feedbackRoutes, profileRoutes, adminRoutes
│   │   ├── services/           # routeFinder.js, geminiService.js, dbService.js
│   │   ├── app.js              # Express app with Helmet, CORS, and rate limiting
│   │   └── index.js            # Server entrypoint
│   ├── .env                    # Server environment variables
│   ├── .env.example
│   └── package.json
│
├── supabase/                   # Supabase Database Migrations
│   ├── schema.sql              # Tables, UUIDs, Indexes, and RLS policies
│   └── seed.sql                # Realistic transit network seed data
│
├── package.json                # Root package orchestrator
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

> **Note**: If `GEMINI_API_KEY` or `SUPABASE_URL` are not set during local evaluation, the application automatically uses its built-in realistic transit dataset and grounded deterministic AI reasoning engine so the entire application works seamlessly out-of-the-box!

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the root workspace:
npm run install:all
```
Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the Backend Server
```bash
cd server
npm run dev
```
Backend will start on: **`http://localhost:5000`**

### 3. Start the Frontend Application
```bash
cd client
npm run dev
```
Frontend will be live at: **`http://localhost:5173`**

---

## 🗄️ Database Setup (Supabase)

To link with a live Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Run the SQL script located in `supabase/schema.sql`.
4. Run the seed data script in `supabase/seed.sql`.
5. Copy your **Project URL**, **Anon Key**, and **Service Role Key** into `server/.env`.

---

## 👤 Demo Login Credentials

For testing and demonstration, use either of the built-in accounts:

| Role | Email | Password |
|---|---|---|
| **Student User** | `demo@busmate.ai` | `password` |
| **Transit Admin** | `admin@busmate.ai` | `password` |

*(You can also register a brand-new student or regular commuter account directly on the `/register` screen).*

---

## 🛣️ API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new commuter account | No |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user info | Yes |
| `GET` | `/api/stops` | List all active bus stops | No |
| `POST` | `/api/routes/search` | Search routes with AI recommendation & timeline | Optional |
| `GET` | `/api/routes/:id` | Fetch route details, sequence, schedules & feedback | No |
| `GET` | `/api/favorites` | Fetch user favorite places & routes | Yes |
| `POST` | `/api/favorites` | Save favorite place or route | Yes |
| `DELETE`| `/api/favorites/:id` | Remove saved favorite | Yes |
| `GET` | `/api/history` | Fetch route search history | Yes |
| `DELETE`| `/api/history/:id` | Delete history entry | Yes |
| `POST` | `/api/feedback` | Submit route crowd & punctuality review | Yes |
| `GET` | `/api/profile` | View commuter profile & pass status | Yes |
| `PATCH`| `/api/profile` | Update profile preferences & student pass ID | Yes |
| `GET` | `/api/admin/stats` | View transit operational metrics | Admin Only |
| `POST` | `/api/admin/routes` | Add new bus route | Admin Only |
| `POST` | `/api/admin/stops` | Add new transit stop | Admin Only |
| `POST` | `/api/admin/schedules`| Add route departure schedule | Admin Only |
| `GET` | `/api/health` | Service health status check | No |

---

## 📄 License
MIT License. Built for students and daily passengers everywhere.
