# AgroTrade — Deployment Guide (Free Tier)

## Architecture
```
Vercel (Frontend) → Render (Backend API) → Aiven (MySQL)
```

---

## Step 1: Create MySQL Database (Aiven)

1. Go to https://aiven.io → Sign up (free, no credit card)
2. Create a new **MySQL** service → select **Free Plan**
3. Wait 2-3 minutes for provisioning
4. From the **Overview** tab, copy:
   - **Host** (e.g. `mysql-xxxxx.aiven.io`)
   - **Port** (usually `12345`)
   - **User** (`avnadmin`)
   - **Password** (shown once, copy it)
   - **Database** (`defaultdb`)
5. Your JDBC URL will be:
   ```
   jdbc:mysql://HOST:PORT/defaultdb?useSSL=true&requireSSL=true&serverTimezone=UTC
   ```

---

## Step 2: Deploy Backend to Render

1. Push this entire repo to GitHub
2. Go to https://render.com → Sign up → **New → Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Name:** `agrotrade-api`
   - **Runtime:** Docker
   - **Plan:** Free
   - **Branch:** main
5. Add **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://HOST:PORT/defaultdb?useSSL=true&requireSSL=true&serverTimezone=UTC` |
   | `SPRING_DATASOURCE_USERNAME` | `avnadmin` |
   | `SPRING_DATASOURCE_PASSWORD` | (your Aiven password) |
   | `APP_JWT_SECRET` | (generate: run `openssl rand -hex 32` in terminal) |
   | `APP_CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` (update after Step 3) |
   | `PORT` | `8080` |

6. Click **Create Web Service** → wait 5-10 min for first deploy
7. Note your URL: `https://agrotrade-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com → Sign up → **Import Project**
2. Select your GitHub repo
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy** → wait 1-2 min
5. Note your URL: `https://your-app.vercel.app`

---

## Step 4: Connect Frontend to Backend

1. In `frontend/vercel.json`, replace `YOUR-BACKEND-NAME.onrender.com` with your actual Render URL
2. Push the change to GitHub → Vercel auto-redeploys
3. Go back to Render → update `APP_CORS_ALLOWED_ORIGINS` with your Vercel URL
4. Render will auto-redeploy

---

## Step 5: Verify

1. Open your Vercel URL
2. Register as a buyer/farmer
3. Check admin panel with: `admin@agrotrade.com` / `Admin@123`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| First load takes 30s | Render free tier cold-starts after 15min inactivity. Normal. |
| CORS error | Check `APP_CORS_ALLOWED_ORIGINS` matches your Vercel URL exactly (include `https://`) |
| DB connection refused | Verify Aiven allows connections from Render's IP (usually auto-allowed on free tier) |
| 502 Bad Gateway | Check Render logs — likely OOM. Reduce `JAVA_OPTS` heap or upgrade plan. |
| WebSocket not connecting | Render free doesn't support persistent WebSocket. Live prices will use HTTP polling only. |

---

## Cost: Rs. 0

| Service | What you get |
|---------|-------------|
| Vercel | Unlimited deploys, global CDN, HTTPS, custom domain |
| Render | 750 hours/month free, auto-deploy from GitHub |
| Aiven MySQL | 1GB storage, 5 connections, backups |

---

## When ready for production (paid)

- Render Starter ($7/mo) → no cold starts, 1GB RAM, ~500 concurrent users
- Aiven Hobbyist ($19/mo) → 5GB, 30 connections
- Or switch to Railway ($5/mo flat) for simpler all-in-one setup
