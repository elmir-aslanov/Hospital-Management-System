# Deployment Guide — Aslan Medical Center

## Backend → Render

1. Go to https://render.com → **New Web Service**
2. Connect GitHub repo: `elmir-aslanov/Hospital-Management-System`
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from `server/.env.production`
7. After deploy, copy the service URL → `https://xxx.onrender.com`

## Frontend → Vercel

1. Go to https://vercel.com → **New Project**
2. Import GitHub repo
3. Root directory: `client`
4. Framework preset: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variable:
   ```
   VITE_API_URL = https://xxx.onrender.com/api/v1
   ```
8. Deploy

## MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. **Database Access** → Add user with `readWrite` role
3. **Network Access** → Add `0.0.0.0/0` (allow all IPs for Render)
4. **Connect** → Drivers → copy connection string
5. Paste in `MONGO_URI` (replace `<password>` and `<dbname>`)

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/aslanmedical?retryWrites=true&w=majority
```

## Cloudinary (image uploads)

1. Go to https://cloudinary.com → Sign up (free)
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret**
3. Add to Render environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Email (Gmail SMTP)

1. Google Account → Security → **2-Step Verification** → enable
2. App Passwords → create password for "Mail"
3. Add to Render:
   - `EMAIL_USER` = your Gmail address
   - `EMAIL_PASS` = 16-char app password (no spaces)

## Post-deployment checklist

- [ ] `GET /api/v1/health` returns `{ status: "ok" }`
- [ ] Admin login works (`/admin`)
- [ ] Patient registration works
- [ ] Appointment creation works (conflict detection)
- [ ] Cloudinary image upload works
- [ ] Email OTP delivery works
- [ ] CORS — no `Access-Control-Allow-Origin` errors in browser console
- [ ] `ALLOWED_ORIGINS` on Render matches Vercel deployment URL exactly

## Environment variable quick reference

| Variable | Where | Example |
|----------|-------|---------|
| `MONGO_URI` | Render | `mongodb+srv://...` |
| `JWT_SECRET` | Render | auto-generated |
| `JWT_REFRESH_SECRET` | Render | auto-generated |
| `CLIENT_URL` | Render | `https://xxx.vercel.app` |
| `ALLOWED_ORIGINS` | Render | `https://xxx.vercel.app` |
| `CLOUDINARY_*` | Render | from Cloudinary dashboard |
| `EMAIL_USER` | Render | `yourname@gmail.com` |
| `EMAIL_PASS` | Render | Gmail app password |
| `VITE_API_URL` | Vercel | `https://xxx.onrender.com/api/v1` |
