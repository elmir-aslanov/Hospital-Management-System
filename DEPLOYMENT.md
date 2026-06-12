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
5. Paste in `MONGODB_URI` (replace `<password>` and `<dbname>`)

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
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_SECURE` = `false`
   - `SMTP_USER` = your Gmail address
   - `SMTP_PASS` = 16-char app password (no spaces)
   - `SMTP_FROM` = `Aslan Medical Clinic <yourname@gmail.com>`

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
| `NODE_ENV` | Render | `production` |
| `PORT` | Render | `5000` |
| `MONGODB_URI` | Render | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Render | auto-generated |
| `JWT_REFRESH_SECRET` | Render | auto-generated |
| `JWT_ACCESS_EXPIRES` | Render | `30m` |
| `JWT_REFRESH_EXPIRES` | Render | `7d` |
| `CLIENT_URL` | Render | `https://xxx.vercel.app` |
| `ALLOWED_ORIGINS` | Render | `https://xxx.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Render | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Render | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Render | from Cloudinary dashboard |
| `SMTP_HOST` | Render | `smtp.gmail.com` |
| `SMTP_PORT` | Render | `587` |
| `SMTP_SECURE` | Render | `false` |
| `SMTP_USER` | Render | `yourname@gmail.com` |
| `SMTP_PASS` | Render | Gmail app password |
| `SMTP_FROM` | Render | `Aslan Medical Clinic <yourname@gmail.com>` |
| `VITE_API_URL` | Vercel | `https://xxx.onrender.com/api/v1` |

The current frontend code reads `VITE_API_URL` for the backend API URL. It does not require a separate `SERVER_URL`.
