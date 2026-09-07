# Free Cloud Deployment & Hosting Guide

This guide explains how to host your Menstrual Health Tracker in the cloud for **100% free** without paying any money or requiring credit cards.

---

## Free Option 1: Render.com (Recommended for Complete App)

Render provides a generous free tier for both web services and PostgreSQL databases.

### Steps:
1. Push your repository to GitHub (we have already configured `render.yaml` and `Dockerfile`).
2. Go to **[https://render.com](https://render.com)** and sign up for a free account with GitHub.
3. In the Render Dashboard, click **New +** -> **Blueprint**.
4. Select your GitHub repository (`kancharlanavyatha/tracker`).
5. Render will automatically read `render.yaml`, create:
   - A free PostgreSQL database instance (`menstrual-health-db`)
   - A free Web Service container (`menstrual-tracker-app`)
6. Click **Apply**.
7. Once built, Render will assign you a live HTTPS URL (e.g., `https://menstrual-tracker-app.onrender.com`).
8. You can open this URL from any phone, laptop, or browser in the world!

---

## Free Option 2: Supabase (Free Managed Cloud PostgreSQL)

If you prefer to run the FastAPI app on your laptop or a server but want a real cloud-hosted database:
1. Sign up at **[https://supabase.com](https://supabase.com)** (Free tier includes 500MB database).
2. Create a new project.
3. Go to **Project Settings** -> **Database** -> **Connection string** (URI).
4. Copy the connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
5. Paste it into your `backend/.env` file. The app will automatically connect to Supabase Cloud!

---

## Free Option 3: Local Cloud Tunnel (Ngrok / Cloudflare Tunnel)

To connect your **ESP32 wearable** over the internet to your laptop without deploying to any cloud:
1. Download **[Cloudflare Tunnel (`cloudflared`)](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)** or **[Ngrok](https://ngrok.com)**.
2. Run in a terminal:
   ```cmd
   cloudflared tunnel --url http://127.0.0.1:8000
   ```
   or
   ```cmd
   ngrok http 8000
   ```
3. It will give you a public URL (e.g., `https://random-subdomain.trycloudflare.com`).
4. Paste that URL into your ESP32 Arduino sketch, and your wearable can transmit vitals from anywhere over Wi-Fi for free!
