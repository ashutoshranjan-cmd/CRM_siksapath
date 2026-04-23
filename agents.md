# CRM Agent Notes

> **Last updated:** 2026-04-23
> This file is the single source of truth for AI agents working on this codebase.
> Read this BEFORE making any changes.

---

## Project Overview

Full-stack WhatsApp Marketing CRM. **React + Vite** frontend, **Express + MongoDB** backend.
The frontend UI was built to **exactly replicate** a Stitch design system (reference files in `frontend/stitch_ref/`).
The live local backend environment for this workspace is configured through `backend/.env`.

---

## Repository Layout

```
CRM/
├── agents.md                  ← THIS FILE (agent instructions)
├── README.md                  ← Project readme
├── .agents/workflows/         ← Agent workflow files
├── backend/                   ← Express API server
│   ├── server.js              ← Entry point
│   ├── .env                   ← Local runtime secrets (sensitive; do not copy into docs)
│   ├── src/
│   │   ├── app.js             ← Express app setup
│   │   ├── config/            ← DB, env config
│   │   ├── controllers/       ← Route controllers
│   │   ├── middlewares/       ← Auth, validation, error handlers
│   │   ├── models/            ← Mongoose schemas
│   │   ├── routes/            ← API route definitions
│   │   ├── services/          ← Business logic (WhatsApp, etc.)
│   │   └── validators/        ← Request validation schemas
│   └── .env.example           ← Required env vars
└── frontend/                  ← React + Vite + Tailwind
    ├── index.html             ← HTML entry with Google Fonts / Material Symbols
    ├── vite.config.js         ← Vite config with @tailwindcss/vite plugin
    ├── package.json
    ├── stitch_ref/            ← Original Stitch HTML designs (DO NOT EDIT)
    │   ├── login.html
    │   ├── dashboard.html
    │   ├── send_message.html
    │   ├── sent_history.html
    │   ├── bulk_message.html
    │   └── user_management.html
    └── src/
        ├── main.jsx           ← React entry point
        ├── App.jsx            ← Router setup
        ├── index.css          ← Tailwind imports + design system tokens
        ├── components/        ← Shared UI components
        │   ├── Sidebar.jsx    ← Dark sidebar navigation
        │   └── TopNav.jsx     ← Top header bar
        ├── layouts/
        │   └── DashboardLayout.jsx  ← Sidebar + TopNav + <Outlet>
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── SendMessagePage.jsx
            ├── BulkMessagePage.jsx
            ├── SentHistoryPage.jsx
            ├── UserManagementPage.jsx
            └── RolesPage.jsx
```

---

## Current Stack

| Layer      | Tech                                    |
|------------|-----------------------------------------|
| Frontend   | React 19, Vite 8, Tailwind CSS 4        |
| Routing    | react-router-dom v7                     |
| Icons      | Google Material Symbols Outlined (CDN)   |
| Fonts      | Inter (Google Fonts CDN)                |
| Backend    | Express 4, MongoDB, Mongoose            |
| Auth       | JWT bearer tokens                       |
| Messaging  | Meta WhatsApp Business API (mock/live)  |

---

## Frontend Architecture

### Design System

The frontend uses a **Material Design 3** inspired token system from the Stitch design tool.
All design tokens are defined in `frontend/src/index.css` using Tailwind's `@theme` directive.

**Key color tokens (use these class names, NOT raw hex):**

| Token                      | Hex       | Usage                              |
|----------------------------|-----------|-------------------------------------|
| `primary`                  | `#004ccd` | Primary actions, active states      |
| `primary-container`        | `#0f62fe` | Filled buttons, icon backgrounds    |
| `secondary`                | `#006d2f` | WhatsApp/success actions            |
| `secondary-container`      | `#5dfd8a` | Success badges                      |
| `error`                    | `#ba1a1a` | Error states, failed badges         |
| `error-container`          | `#ffdad6` | Error background                    |
| `on-surface`               | `#191c1f` | Primary text                        |
| `on-surface-variant`       | `#424656` | Secondary/muted text                |
| `surface-container-lowest` | `#ffffff` | Card backgrounds                    |
| `surface-container-low`    | `#f2f4f8` | Page background                     |
| `surface-container`        | `#eceef2` | Input backgrounds, subtle fills     |
| `outline-variant`          | `#c3c6d8` | Borders, dividers                   |
| `outline`                  | `#737687` | Input icons, muted icons            |
| `tertiary`                 | `#365789` | Tertiary accent                     |

**Typography tokens (use as tailwind classes like `text-sm`, `text-base`, `text-xs`):**

| Role        | Size   | Weight | Line Height | Usage                           |
|-------------|--------|--------|-------------|----------------------------------|
| headline-xl | 32px   | 700    | 40px        | Page titles                      |
| headline-lg | 24px   | 600    | 32px        | Card stat numbers                |
| headline-md | 20px   | 600    | 28px        | Section headings                 |
| body-lg     | 16px   | 400    | 24px        | Description text                 |
| body-md     | 14px   | 400    | 20px        | Table content, body text         |
| label-md    | 12px   | 600    | 16px        | Form labels, badges              |
| code-sm     | 12px   | 400    | 16px        | Timestamps, secondary info       |

**Spacing tokens:**

| Token               | Value  |
|----------------------|--------|
| `sidebar-width`      | 260px  |
| `gutter`             | 24px   |
| `margin-page`        | 32px   |
| `stack-sm`           | 4px    |
| `stack-md`           | 12px   |
| `stack-lg`           | 24px   |
| `base`               | 8px    |
| `container-max-width`| 1440px |

### Routing

Defined in `App.jsx`. Uses React Router v7 with nested routes:

```
/login              → LoginPage (standalone, no sidebar)
/                   → Redirects to /dashboard
/dashboard          → DashboardPage
/send-message       → SendMessagePage
/bulk-message       → BulkMessagePage
/sent-history       → SentHistoryPage
/users              → UserManagementPage
/roles              → RolesPage
```

All routes under `/` use `DashboardLayout` which renders `Sidebar` + `TopNav` + `<Outlet>`.

### Component Patterns

1. **Sidebar** (`components/Sidebar.jsx`):
   - Dark `bg-slate-900` sidebar, fixed 260px width
   - Uses `NavLink` from react-router with `isActive` for highlighting
   - Active state: `bg-blue-600/10 text-white border-l-4 border-blue-600`
   - Material Symbols icons with `FILL 1` on active items
   - Mobile: slides in/out with overlay

2. **TopNav** (`components/TopNav.jsx`):
   - White `bg-white` header bar, fixed at top
   - Search input, notification/settings buttons, user avatar
   - Mobile menu toggle button (hidden on lg+)

3. **Page pattern**: Each page is a standalone component that renders directly inside the `<Outlet>`. No wrapper needed — the `DashboardLayout` handles padding.

### Key UI Patterns Used

- **Stat cards**: Rounded corners, border, shadow, decorative corner circle
- **Data tables**: Full-width with `divide-y`, header in `bg-surface-container-low`
- **Status badges**: Rounded-full pills with colored dots
- **Form inputs**: `bg-surface border border-outline-variant rounded-lg` with `focus:ring-2 focus:ring-primary`
- **Action buttons**: Primary = `bg-primary text-on-primary`, Secondary/WhatsApp = `bg-secondary text-on-secondary`
- **Pagination**: Numbered pages with active page in `bg-primary text-on-primary`

### Stitch Reference Files

The `frontend/stitch_ref/` directory contains the **original Stitch-generated HTML** files.
These are the **source of truth** for visual design. When making UI changes:

1. Always cross-reference with the corresponding `stitch_ref/*.html` file
2. Use the exact same Tailwind classes and token names
3. Do NOT modify stitch_ref files — they are read-only references

---

## Backend Structure

- Entry point: `backend/server.js`
- App setup: `backend/src/app.js`
- Config: `backend/src/config/`
- Controllers: `backend/src/controllers/`
- Models: `backend/src/models/`
- Routes: `backend/src/routes/`
- Middlewares: `backend/src/middlewares/`
- Services: `backend/src/services/`
- Validators: `backend/src/validators/`

### Main Features Already Implemented

- Bootstrap signup for the first `super_admin`
- Admin creation and CRM access ID assignment by `super_admin`
- Login by email or `crmAccessId`
- Contact save/list APIs for manual number entry
- Single WhatsApp send API
- Bulk CSV/XLS/XLSX upload and send API
- Message history with filters and pagination
- Rate limiting, CORS, Helmet, payload sanitizing, file validation, and request validation

### Important Backend Rules

- Keep `WHATSAPP_API_MODE=mock` for local work unless real Meta credentials are available.
- Do not hardcode secrets. Use `backend/.env`.
- In this workspace, `backend/.env` is the live source of truth for `MONGO_URI`; do not duplicate the actual Atlas secret into docs or example files.
- Super admin access is controlled by the first signup or the optional default super admin env values.
- Admin users should be created by `POST /api/auth/admins` when public signup is disabled.
- Bulk upload expects a spreadsheet with a phone-like column such as `phone`, `phoneNumber`, `number`, `mobile`, or `whatsappNumber`.

### API Routes

| Method | Endpoint                          | Description                     |
|--------|------------------------------------|---------------------------------|
| POST   | `/api/auth/signup`                 | Bootstrap first super_admin     |
| POST   | `/api/auth/login`                  | Login (email or crmAccessId)    |
| GET    | `/api/auth/me`                     | Get current user profile        |
| PATCH  | `/api/auth/me/password`            | Super admin updates own password |
| POST   | `/api/auth/admins`                 | Create admin user               |
| PATCH  | `/api/auth/users/:userId/access-id`| Assign CRM access ID           |
| POST   | `/api/contacts`                    | Create new contact              |
| GET    | `/api/contacts`                    | List contacts                   |
| POST   | `/api/messages/send`               | Send single WhatsApp message    |
| POST   | `/api/messages/bulk`               | Bulk send from CSV/XLS          |
| GET    | `/api/messages/history`            | Message history (paginated)     |
| GET    | `/api/messages/history/:historyId` | Single history entry            |

### Env Contract

Use `backend/.env` for actual local runtime values.
Use [backend/.env.example](backend/.env.example) as the sanitized template/schema.
When env requirements change, update both the code and the example env files, but never copy live secrets into agent docs.

---

## Development Commands

```bash
# Frontend (from frontend/)
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build to dist/

# Backend (from backend/)
npm install          # Install dependencies
npm run dev          # Start Express server with nodemon
```

---

## Common Modification Scenarios

### Adding a New Page

1. Create `frontend/src/pages/NewPage.jsx`
2. Add route to `frontend/src/App.jsx` inside the `<Route path="/" element={<DashboardLayout />}>` block
3. Add nav item to `frontend/src/components/Sidebar.jsx` in the `navItems` array
4. Follow existing page patterns: page header (`text-[32px] font-bold`), then content cards

### Modifying the Design System

1. Update tokens in `frontend/src/index.css` under `@theme {}`
2. Tailwind CSS 4 uses `@theme` — do NOT use `tailwind.config.js` for tokens
3. Test all pages after token changes since they share the same system

### Adding a New API Endpoint

1. Add route in `backend/src/routes/`
2. Add controller in `backend/src/controllers/`
3. Add service logic in `backend/src/services/`
4. Add validator if needed in `backend/src/validators/`
5. Register route in `backend/src/app.js`

### Connecting Frontend to Backend

Frontend is currently **decoupled** — uses static mock data. To connect:
1. Create API service layer in `frontend/src/services/api.js`
2. Use `fetch` or `axios` to call backend endpoints
3. Store JWT token in localStorage after login
4. Add `Authorization: Bearer <token>` header to requests
5. Replace static data in page components with API calls

---

## Future Upgrade Guidance

- If you add templated WhatsApp messages, keep them in a dedicated service instead of expanding controllers.
- If delivery statuses/webhooks are added later, extend `MessageHistory` rather than creating a parallel log model.
- If queues are introduced, move bulk sending from request-time execution into a worker without changing route contracts unless necessary.
- When integrating real-time updates (WebSocket), add a `frontend/src/hooks/useWebSocket.js` hook.
- When adding dark mode, all tokens already support it — just toggle `dark` class on `<html>` and provide dark token variants.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tailwind classes not working | Ensure `@tailwindcss/vite` plugin is in `vite.config.js` and `@import "tailwindcss"` is in `index.css` |
| Material icons not showing | Check that Material Symbols Outlined font is loaded in `index.html` |
| Sidebar not highlighting | Verify the route `path` in `Sidebar.jsx` matches the route in `App.jsx` |
| Colors look wrong | Cross-reference with `stitch_ref/*.html` — tokens must match exactly |
| Build fails | Run `npm install` — ensure `react-router-dom`, `tailwindcss`, `@tailwindcss/vite` are installed |
| Backend 401 errors | Ensure JWT token is being sent in the Authorization header |
