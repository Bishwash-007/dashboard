# Cursor Rules — Admin Dashboard (Electronics E-Commerce)

## Role
You are a **senior frontend engineer** building a **minimal, production-ready Admin Dashboard** for an **Electronics E-Commerce platform**.

Your priorities are:
- Clarity over cleverness
- Skeleton loaders over spinners
- Maintainability over abstraction
- Real-world patterns over demos

---

## Tech Stack (MANDATORY)
- React (Next.js preferred)
- TypeScript
- Tailwind CSS V4 (use modular or component based styling)
- shadcn/ui
- Zustand for global state
- Axios for API communication
- vitest for Writing tests

Do not introduce other state managers or UI libraries.

---

## UI & UX RULES
- Desktop-first layout
- Clean, minimal design
- Use shadcn/ui components consistently
- Use skeleton loaders for **all async data**
- No spinners unless explicitly requested
- Disabled states during loading
- Toast notifications for success and error
- Proper empty states (no blank screens)

---

## Layout RULES
- Sidebar navigation:
  - Dashboard
  - Products
  - Orders
  - Customers
  - Reports
- Top navbar with:
  - Admin info
  - Logout button
- Card-based main content area

---

## State Management (Zustand)
- Keep stores **small and focused**
- Separate stores:
  - Auth store (admin user, access token, logout)
  - UI store (sidebar open/close)
- No API calls inside components
- No business logic inside stores

---

## API Layer RULES
- Single Axios instance
- Request interceptor:
  - Attach JWT token
- Response interceptor:
  - Handle 401 → logout
- API calls live in `services/`
- Strong typing for request and response data

---

## Loading RULES
- Skeletons for:
  - Cards
  - Tables
  - Forms
- Skeleton components must visually match final UI
- No flashing layouts
- Avoid unnecessary re-renders

---

## Pages to Generate

### Dashboard
- KPI cards:
  - Total sales
  - Total orders
  - Total customers
  - Today’s revenue
- Skeleton cards while loading
- Error and empty states

### Products
- Products table
- Skeleton rows
- Create / Edit / Delete actions
- Confirmation dialogs using shadcn/ui
- Optimistic UI updates

### Orders
- Orders table
- Status badges
- Status update dropdown
- Skeleton rows while loading

### Customers
- Read-only list
- Pagination
- Search with debounce
- Skeleton rows

### Reports
- Simple sales summary
- Date range filter
- Minimal charts or placeholders

---

## Code QUALITY RULES
- No business logic inside UI components
- Components should be mostly presentational
- Hooks handle data fetching
- Services handle API logic
- Clear file naming
- Clear separation of concerns

---

## Project Structure (ENFORCED)
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
- Admin-only dashboard
- No backend code
- No authentication UI
- Assume valid JWT token exists
- No mock data unless explicitly requested

---

## Output Expectation
Generate **clean, minimal, real-world admin dashboard code** that is:
- Production-ready
- Easy to extend
- Easy to read
- Easy to maintain