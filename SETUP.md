# Storage Inventory — Setup Guide

## What you need to install first

### 1. Install Node.js
Download and install from: **https://nodejs.org** (choose the "LTS" version)

After installing, open Terminal and verify:
```
node --version   # should print v18 or higher
npm --version
```

---

## Step-by-step setup

### 2. Create a Supabase project (free)

1. Go to **https://supabase.com** and sign up (free)
2. Click **"New project"**, give it a name (e.g. `storage-inventory`)
3. Wait for it to start (~1 minute)
4. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Create the database tables

1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and paste it
4. Click **"Run"**

### 4. Create the photo storage bucket

1. In Supabase, click **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name it exactly: `photos`
4. Check **"Public bucket"** (so images can be displayed)
5. Click **"Create bucket"**

### 5. Get an Anthropic API key (for AI photo detection)

1. Go to **https://console.anthropic.com** and sign up
2. Go to **Settings → API Keys**
3. Click **"Create Key"** and copy it

> Note: The API costs a small amount per photo analysis (~$0.01 per photo). You can add $5 credit to get started.

### 6. Configure the app

In the project folder, create a file called `.env.local` (copy from `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Replace the placeholder values with your real keys.

### 7. Install dependencies and run

Open Terminal in the project folder and run:

```bash
npm install
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## Using on your phone

Once deployed to Vercel (free), you can open the same URL on any phone browser.

### Deploy to Vercel (free)
1. Create a free account at **https://vercel.com**
2. Install Git from **https://git-scm.com** and commit the project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Push to GitHub and connect the repo to Vercel
4. In Vercel dashboard → your project → **Settings → Environment Variables**, add the same 3 keys from `.env.local`
5. Redeploy — your app is now live at a public URL usable on any device

---

## How to use the app

1. **Create a location**: Click "Add Location" on the home screen
2. **Add a photo**: Open a location and tap "Add Photo" — your camera will open on mobile
3. **Review AI detections**: Claude will analyze the photo and list items — you can edit, add, or remove
4. **Browse inventory**: All items are shown in a table, click any row to edit inline
5. **Search**: Use the search icon in the top bar to find any item across all locations
