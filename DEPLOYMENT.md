# Deployment Guide for Page Pulse

## 1. Connect GitHub
1. Push the `page-pulse` repository to GitHub.
2. Confirm the repository contains the `frontend` and `backend` folders, plus `frontend/vercel.json` and `backend/render.yaml`.

## 2. Deploy the backend on Render
1. Sign in to Render and connect your GitHub account.
2. Choose "New Web Service" and select the `page-pulse/backend` folder from the repository.
3. Confirm the Render YAML file is detected (`backend/render.yaml`). If prompted, use the `main` branch.
4. Add the following environment variables in Render:
   - `JWT_SECRET` = *your strong JWT secret*
   - `CORS_ORIGIN` = `https://<YOUR_FRONTEND_DOMAIN>.vercel.app`
   - `PORT` = `5000`
5. Leave the build command as `npm install` and start command as `npm start`.
6. Deploy the service and note the backend URL from Render.

## 3. Deploy the frontend on Vercel
1. Sign in to Vercel and connect your GitHub account.
2. Select the `page-pulse/frontend` directory.
3. Vercel should detect a static site and use `npm run build` automatically.
4. Add the following environment variable in Vercel for the frontend project:
   - `VITE_API_URL` = `https://<YOUR_BACKEND_URL_FROM_RENDER>` (do not add a trailing slash)
5. Deploy the frontend.

## 4. Required environment variables
### Backend (Render)
- `JWT_SECRET` = secure random string
- `CORS_ORIGIN` = `https://<YOUR_FRONTEND_DOMAIN>.vercel.app`
- `PORT` = `5000`

### Frontend (Vercel)
- `VITE_API_URL` = `https://<YOUR_BACKEND_URL_FROM_RENDER>`

## 5. Verify the live application
1. Open the deployed frontend URL.
2. Open `https://<YOUR_BACKEND_URL_FROM_RENDER>/health`. It should return JSON with `"success": true`.
3. Enter a website URL and run the analysis.
4. Confirm the frontend connects to the Render backend and displays results.
5. For authenticated user features, register or log in and confirm report saving and history behavior.

## 6. URL placeholders to replace
- Frontend live URL: `https://<YOUR_FRONTEND_URL>.vercel.app`
- Backend live URL: `https://<YOUR_RENDER_BACKEND_URL>`

---

### Notes
- The frontend uses `import.meta.env.VITE_API_URL` to build API requests.
- The backend uses `CORS_ORIGIN` to restrict allowed frontend origins.
- The `frontend/.env` file is created for local development and is ignored by Git.
