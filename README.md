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
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |

---

## Features

- **Authentication** — JWT-based login/logout with token stored in `localStorage`. Token payload is decoded client-side to hydrate the user session.
- **Protected & Public Routes** — Route guards redirect unauthenticated users to `/login` and authenticated users away from the login page.
- **Dashboard** — Displays attendance records with filtering support (date range, late flag, pagination, sort order).
- **Profile Settings** — Users can view and update their profile information.
- **Snackbar Notifications** — Global notification component for user feedback.

---

## Project Structure

```
src/
├── api/
│   └── axios.ts          # Axios instance with Bearer token interceptor
├── components/
│   ├── Navbar.tsx
│   └── Snackbar.tsx
├── interface/
│   └── User.tsx          # User type definition
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── ProfileSettingPage.tsx
├── routes/
│   └── AppRouter.tsx     # Route definitions with ProtectedRoute & PublicRoute
├── store/
│   ├── authStore.ts      # Auth state (login, logout, initUser)
│   └── attendanceStore.ts # Attendance state with filter support
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

1. User submits credentials on `/login`.
2. `authStore.login()` calls `POST /auth/login` and stores the returned JWT in `localStorage`.
3. The token payload is decoded to populate the `user` state.
4. On app mount, `initUser()` fetches the latest profile data from `GET /users/:id`.
5. `logout()` calls `POST /auth/logout`, clears `localStorage`, and resets the store.

---

## State Management

State is managed with **Zustand**:

- **`useAuthStore`** — holds `user`, `token`, and actions: `login`, `logout`, `updateUser`, `initUser`.
- **`useAttendanceStore`** — holds `attendances`, `meta`, and `fetchAttendanceSummary(filters?)` which fetches paginated attendance records from `GET /attendances/:userId`.
