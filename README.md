# HRIS Frontend

A Human Resource Information System (HRIS) frontend built with **React 19**, **TypeScript**, and **Vite**. It provides authentication, an attendance dashboard, and profile management for employees.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vite.dev/) | Build tool & dev server |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [Zustand](https://zustand-demo.pmnd.rs/) | Global state management |
| [Axios](https://axios-http.com/) | HTTP client |
| [Moment.js](https://momentjs.com/) | Date formatting & manipulation |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |

---

## Features

- **Authentication** — JWT-based login/logout with token stored in `localStorage`. Expired tokens are detected and removed on app startup.
- **Protected & Public Routes** — Route guards redirect unauthenticated users to `/login` and authenticated users away from the login page.
- **Dashboard** — Tabbed layout with three views: a welcome home screen, check-in/check-out actions, and a paginated attendance summary.
- **Check-in / Check-out** — Employees can record their daily arrival and departure via dedicated API calls.
- **Attendance Summary** — Filterable and paginated attendance records with date range, late/on-time status, sort order, and page size controls.
- **Profile Settings** — Users can view and update their phone number, password, and profile photo.
- **Snackbar Notifications** — Global notification component for success and error feedback.
- **Auto-logout on 401** — Axios response interceptor clears the session and redirects to `/login` on any `401 Unauthorized` response.

---

## Project Structure

```
src/
├── api/
│   └── axios.ts              # Axios instance with Bearer token & 401 interceptors
├── components/
│   ├── Attendance.tsx         # Check-in / Check-out buttons
│   ├── AttendanceSummary.tsx  # Filterable, paginated attendance table
│   ├── Dashboard.tsx          # Welcome home screen
│   ├── Navbar.tsx             # Top navigation bar with tab support
│   └── Snackbar.tsx           # Toast notification component
├── interface/
│   └── UserInterface.ts       # User type definition
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx      # Tabbed page: Dashboard / Attendance / Summary
│   └── ProfileSettingPage.tsx
├── routes/
│   └── AppRouter.tsx          # Route definitions with ProtectedRoute & PublicRoute
├── store/
│   ├── authStore.ts           # Auth state (login, logout, initUser, token expiry check)
│   └── attendanceStore.ts     # Attendance state with filter support
├── App.tsx
└── main.tsx
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nurhabibrs/hris-frontend.git
cd hris-frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the base URL of the HRIS backend API. All requests made through the Axios instance will use this as their base.

### Running the App

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/) v2

### Setup

```bash
# 1. Copy the Docker environment template
cp .env.docker.example .env

# 2. Edit .env and set the correct values
#    Most importantly: VITE_API_URL must point to your backend
nano .env
```

### Build & Run

```bash
# Build the image and start the container in the background
docker compose up --build -d

# The app will be available at http://localhost:3000
# (or whatever VITE_PORT is set to in your .env)
```

### Useful Commands

```bash
# View running containers
docker compose ps

# Stream logs
docker compose logs -f

# Stop and remove the container
docker compose down

# Rebuild after code or env changes
docker compose up --build -d
```

### Environment Variables (Docker)

> **Important:** `VITE_*` variables are baked into the JavaScript bundle at **build time**. You must rebuild the Docker image (`docker compose up --build`) whenever they change.

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Node environment | `production` |
| `VITE_PORT` | Host port mapped to the container | `3000` |
| `VITE_API_URL` | Backend API base URL (browser-facing) | `http://localhost:8000` |
| `VITE_APP_NAME` | Application display name | `HRIS Company` |

When the backend runs in the **same Docker network**, use the service name instead of `localhost`:

```env
VITE_API_URL=http://hris-backend:8000
```

---

## Authentication Flow

1. On app load, any expired JWT already in `localStorage` is detected via `isTokenExpired()` and removed before the store initialises.
2. User submits credentials on `/login`.
3. `authStore.login()` calls `POST /auth/login` and stores the returned JWT in `localStorage`.
4. The token payload is decoded to populate the `user` state (`userId`, `email`, `name`, `role`).
5. After login, `initUser()` calls `GET /users/:id` and refreshes `name` and `photo_url` in the store.
6. If any API request returns `401 Unauthorized`, the Axios interceptor automatically clears `localStorage` and redirects to `/login`.
7. `logout()` calls `POST /auth/logout`, clears `localStorage`, and resets the store.

---

## State Management

State is managed with **Zustand**:

- **`useAuthStore`** — holds `user`, `token`, and actions: `login`, `logout`, `updateUser`, `initUser`. Checks token expiry at module load time and discards stale tokens.
- **`useAttendanceStore`** — holds `attendances`, `meta`, and `fetchAttendanceSummary(filters?)` which fetches paginated attendance records from `GET /attendances/:userId`. Supported filters: `startDate`, `endDate`, `isLate`, `page`, `limit`, `order`.
