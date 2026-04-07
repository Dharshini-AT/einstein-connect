# Einstein Connect — Deployment & Hosting Guide

This fully-featured MERN Stack application has been split exactly into a `/frontend` (Vite + React) and a `/backend` (Express + MongoDB) layer. 

Here is everything you need to run it successfully locally for testing, or deploy it securely to the cloud for real school usage!

---

## 💻 Option 1: Run Locally (Development Mode)

Running the project locally requires three simple things: a running Database, your Backend API, and your Frontend UI.

### 1. Database Setup
Since the app relies strictly on MongoDB, you must have an active database to query before the servers boot up:
- **Locally:** Download **MongoDB Community Server** and **MongoDB Compass**. Once installed, running it automatically opens up `mongodb://127.0.0.1:27017`.
- **Alternatively (Cloud DB):** Create a free account on **MongoDB Atlas**, click "Build a Cluster", hit "Connect", and copy the connection string.
- Open `backend/.env` and ensure `MONGODB_URI` exactly matches your chosen database string.

### 2. Boot Local Backend API
Open a terminal in the root folder of the project.
```bash
cd backend
npm install
node seed.js     # Run this ONCE to automatically create the 150 dummy students 
npm start        # Launches the API on http://localhost:5000
```

### 3. Boot Local Frontend UI
Open a **second** terminal window.
```bash
cd frontend
npm install
npm run dev      # Launches the Beautiful UI on http://localhost:8080 (or 5173 depending on port availability)
```
*Tip: Ensure your UI is querying `http://localhost:5000/api` when logging in your users!*

---

## ☁️ Option 2: Run in the Cloud (Production Mode)

Your codebase is specifically configured to map into free, reliable cloud platforms smoothly. 

### 1. Deploy the Backend Database (MongoDB Atlas)
- If you were using a local MongoDB instance, you **must** migrate to MongoDB Atlas for cloud usage. Get your cluster connection string (it'll look analogous to `mongodb+srv://user:pass@cluster.mongodb.net/einstein`).

### 2. Deploy your Backend to Render (Free)
Render is an excellent host for Node.js APIs.
1. Sign in to [Render](https://render.com/) and click **New > Web Service**.
2. Connect your GitHub repository `Dharshini-AT/einstein-connect`.
3. Fill out the configuration fields exactly like this:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Expand **Advanced > Add Environment Variables** and add everything from your `.env` file (Most importantly your Cloud `MONGODB_URI` and your `JWT_SECRET`).
5. Click **Create**. Once live, it'll hand you a URL like `https://einstein-backend-abcd.onrender.com`.

### 3. Deploy your Frontend to Vercel (Free)
Vercel is the premier host for Vite-powered Single Page Applications. The codebase already contains the `vercel.json` rewrite routing system.
1. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your identical GitHub repository.
3. Edit the **Root Directory** by hitting Edit, and typing: `frontend`
4. Vercel will smartly identify the framework as Vite. Keep the Build setup (`npm run build`) untouched!
5. Expand the **Environment Variables** tab. Add:
   - **NAME:** `VITE_API_URL`
   - **VALUE:** `https://einstein-backend-abcd.onrender.com` *(The exact Render link you grabbed in the previous step)*
6. Click **Deploy**. Vercel will bundle the colors, CSS, and interactive menus natively!
