# 🌱 GrønnValg

**Norwegian Sustainability Scanner** — Scan products, see their environmental impact, discover greener Norwegian alternatives.

---

## 🚀 Quick Start (For Andy)

### Step 1: Install Node.js

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (the green button)
3. Run the installer, click Next through everything

**To verify it worked:**
Open Terminal (Mac) or Command Prompt (Windows) and type:
```bash
node --version
```
You should see something like `v20.x.x`

---

### Step 2: Get the code on your computer

**Option A: Download from GitHub (easiest)**
1. Create a new repository on [github.com](https://github.com/new)
2. Name it `gronnvalg-app`
3. Upload all these files to it

**Option B: Use Git command line**
```bash
# Navigate to where you want the project
cd ~/Projects

# Copy this entire folder there
# Then initialize git:
cd gronnvalg-app
git init
git add .
git commit -m "Initial commit"
```

---

### Step 3: Install dependencies

Open Terminal, navigate to the project folder, and run:

```bash
cd path/to/gronnvalg-app
npm install
```

This will take 1-2 minutes.

---

### Step 4: Run locally

```bash
npm run dev
```

Then open your browser to: **http://localhost:3000**

🎉 You should see the app!

---

### Step 5: Deploy to the internet (Vercel)

1. Go to [vercel.com](https://vercel.com/)
2. Click "Sign Up" → "Continue with GitHub"
3. Click "New Project"
4. Select your `gronnvalg-app` repository
5. Click "Deploy"

**That's it!** In ~2 minutes you'll have a live URL like:
`https://gronnvalg-app.vercel.app`

---

## 📱 Testing on your phone

Once deployed:
1. Open the Vercel URL on your phone
2. The barcode scanner uses your phone's camera
3. Point at any product barcode to scan it!

**To install as an app on iPhone:**
1. Open the site in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

---

## 🛠 Project Structure

```
gronnvalg-app/
├── src/
│   ├── app/
│   │   ├── page.tsx        ← Main home screen
│   │   ├── layout.tsx      ← App wrapper
│   │   └── globals.css     ← Styles
│   ├── components/
│   │   ├── BarcodeScanner.tsx  ← Camera scanning
│   │   └── ProductCard.tsx     ← Product results
│   └── lib/
│       ├── openfoodfacts.ts    ← API integration
│       └── scoring.ts          ← GrønnScore algorithm
├── public/
│   └── manifest.json       ← PWA config
├── package.json
└── README.md
```

---

## 🔧 Common Commands

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint
```

---

## 📊 How the GrønnScore Works

The score (0-100) is calculated from:

| Factor | Weight | What it measures |
|--------|--------|------------------|
| Eco-Score | 40% | Official environmental impact rating |
| Transport | 25% | Distance from origin to Norway |
| Norwegian | 15% | Bonus for Norwegian products |
| Packaging | 10% | Recyclability of packaging |
| Certifications | 10% | Debio, Nyt Norge, etc. |

---

## 📡 Data Source

Product data comes from [Open Food Facts](https://openfoodfacts.org), a free, open database with millions of products.

**To add missing products:**
1. Download the Open Food Facts app
2. Scan and add product info
3. It will appear in GrønnValg within 24 hours!

---

## 🔜 Next Steps

1. **Custom domain:** Buy `gronnvalg.no` and connect it to Vercel
2. **App icons:** Create proper icons for the PWA
3. **Analytics:** Add Vercel Analytics to track usage
4. **Database:** Add Supabase for user accounts and saved scans

---

## 📞 Need Help?

Just ask Claude! Copy-paste any error messages and I'll help debug.

---

Built with ❤️ for a greener Norway 🇳🇴
