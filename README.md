# Page Pulse

Project: Page Pulse — website analysis, audits and reporting.

Overview
- Website analysis
- SEO audit
- Performance audit
- Accessibility audit
- Security audit
- Dashboard, charts and recommendations
- PDF export
- History and reports

New in this update (Phase 6):
- User authentication (JWT, register/login)
- Persistent report storage (file-backed JSON DB)
- Protected report routes (save/list/get/delete)
- UI alignment, responsive improvements
- Professional dashboard sections and consistent card styling
- Dark/light-ready theme and responsive layout
- Security middlewares (helmet, CORS, rate limiting)

Tech stack
- Frontend: React, Vite, Tailwind CSS, Recharts, axios
- Backend: Node.js, Express, LowDB (file JSON store)
- Auth: JWT, bcrypt

Installation (development)
1. Install dependencies for backend and frontend
   - cd page-pulse/backend && npm install
   - cd page-pulse/frontend && npm install

2. Start backend and frontend
   - Backend: cd page-pulse/backend && npm run dev
   - Frontend: cd page-pulse/frontend && npm run dev

Environment variables (backend)
- Create a .env file in page-pulse/backend with:
  - JWT_SECRET=your_long_secret_here
  - CORS_ORIGIN=http://localhost:5173

API documentation
- POST /api/auth/register { name, email, password } => { success, user, token }
- POST /api/auth/login { email, password } => { success, user, token }
- GET /api/auth/me (Auth) => { success, user }

- POST /api/reports (Auth) { websiteURL, overallScore, grade, seoScore, performanceScore, accessibilityScore, securityScore, fullReportJSON }
- GET /api/reports (Auth) => { success, reports[] }
- GET /api/reports/:id (Auth) => { success, report }
- DELETE /api/reports/:id (Auth)

- POST /api/analyze { url } => existing analyze service response

Deployment notes
- Ensure JWT_SECRET is set in production
- Replace LowDB (file store) with a proper DB (Mongo/Postgres) for production scale
- Configure CORS_ORIGIN to the production frontend domain
- Use HTTPS and secure environment for JWT secret

Notes
- This update keeps existing frontend behavior while adding server-backed persistence and auth.
- LowDB is used to avoid external DB infra during development. For production, migrate to a managed DB.
