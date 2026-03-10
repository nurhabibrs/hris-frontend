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
- **`useAttendanceStore`** — holds `attendances`, `meta`, and `fetchSummary(filters?)` which fetches paginated attendance records from `GET /attendances/:userId`.
