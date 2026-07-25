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

## 🌐 Live Demo

Frontend:
https://glittery-beignet-978257.netlify.app/

Backend:
https://page-pulse-aye6.onrender.com

GitHub Repository:
https://github.com/abhinavreddy6342/Page-Pulse

## Testing

The application was manually tested using the following scenarios:

### Test Cases

1. **Happy Path**
   - Input: Valid website URL (e.g., https://google.com)
   - Expected Result: Website analysis is generated successfully with SEO, Performance, Accessibility, and Security scores.

2. **Failure Case – Invalid URL**
   - Input: Invalid URL (e.g., `abcd`)
   - Expected Result: Displays an appropriate validation error message.

3. **Failure Case – Unreachable Website**
   - Input: An unavailable or unreachable website.
   - Expected Result: Displays an error message without crashing the application.

## Design Decisions

### 1. Separate Frontend and Backend Architecture

The application uses a separate frontend and backend structure.

The frontend is built using React and the backend is built using Node.js and Express. This separation allows independent deployment, easier maintenance, and better scalability.

---

### 2. Modular Backend Service Architecture

The website analysis functionality is divided into separate service modules:

- SEO Analysis Service
- Performance Analysis Service
- Accessibility Analysis Service
- Security Analysis Service

This design keeps the code organized and makes it easier to improve or add new auditing features without affecting the complete application.

---

### 3. Lightweight Database Approach Using LowDB

LowDB was selected as the database solution for this project because it provides simple file-based persistent storage without requiring external database setup.

This approach is suitable for development and testing. For production-level scaling, the storage layer can be migrated to databases like MongoDB or PostgreSQL.

---

## Error Handling Approach

The application handles different failure scenarios safely:

- Invalid URL inputs are validated before processing.
- Network failures and unreachable websites return meaningful error responses.
- Non-HTML responses are handled without crashing the server.
- Backend errors are returned as structured JSON responses.

---

## Deployment

The project is deployed using free cloud services:

Frontend:
- Netlify

Backend:
- Render

Environment variables are configured separately for development and production environments.

---

## AI Usage

AI tools were used during development for:

- Debugging errors
- Improving README documentation structure
- Getting suggestions for testing scenarios
- Reviewing code organization

All implementation decisions, project architecture, deployment configuration, and final modifications were completed by me.

---

## Future Improvements

Possible future enhancements:

- Integration with Google Lighthouse API for advanced audits
- AI-generated website improvement suggestions
- Scheduled website monitoring
- Email notifications for reports
- Migration from LowDB to a production database
- Advanced analytics dashboard

---

## Built For

Digital Heroes Training Task

https://digitalheroesco.com
