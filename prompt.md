You are building a **minimal, production-ready Admin Dashboard frontend** for an **Electronics E-Commerce application**.

Your task is to generate:
1. A **centralized Axios service with interceptors**
2. A **shadcn/ui-based Admin Dashboard starter layout**

The code must be **clean, readable, and production-ready**.

---

## Tech Stack
- React (Next.js App Router preferred)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand for global state
- Axios for API requests

---

## Part 1: Axios Service (REQUIRED)

Generate a centralized Axios instance with the following features:
- Base URL from environment variables
- JSON headers by default
- Request interceptor:
  - Automatically attach JWT access token from Zustand auth store
- Response interceptor:
  - Handle `401 Unauthorized`
  - Trigger logout and state reset on auth failure
- Typed request and response helpers
- No API logic inside components

The Axios service must live in a `services/` folder.

---

## Part 2: Admin Dashboard Starter (REQUIRED)

Generate a **minimal shadcn/ui-based admin dashboard layout**.

### Layout Requirements
- Sidebar navigation with links:
  - Dashboard
  - Products
  - Orders
  - Customers
  - Reports
- Top navbar with:
  - Admin profile info
  - Logout button
- Main content area using a card-based layout
- Desktop-first responsive design

### UI Rules
- Use shadcn/ui components only
- Clean typography and spacing
- No visual clutter
- Ready for real data (no mock-only UI)

---

## Loading & UX Requirements
- Use skeleton loaders for all async content
- No spinners unless explicitly required
- Disabled states during loading
- Toast notifications for success and error
- Proper empty states

---

## State Management
- Use Zustand for:
  - Auth state (admin user, access token, logout)
  - UI state (sidebar open/close)
- Keep stores small and focused
- No business logic inside components

---

## Project Structure
- app/
- components/
- components/ui/
- stores/
- services/
- hooks/
- lib/
- types/

---

## Constraints
- Frontend only (no backend code)
- Admin-only dashboard
- No authentication UI (assume token already exists)
- No mock data unless explicitly requested

---

## Output Expectations
- Axios service with interceptors
- shadcn-based dashboard layout components
- Example dashboard page with skeleton loading
- Clean, maintainable, production-quality code