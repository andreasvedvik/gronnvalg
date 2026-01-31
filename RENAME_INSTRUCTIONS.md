# Renaming from GrønnValg to Grønnest

All code references have been updated. Follow these steps to complete the rename:

## 1. Rename Local Folder

In Finder or Terminal, rename your project folder from `GRØNN` to `gronnest`:

```bash
# Navigate to parent folder and rename
cd /path/to/your/projects
mv GRØNN gronnest
```

## 2. Rename GitHub Repository

1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. Under **General**, find **Repository name**
4. Change from `GRØNN` (or current name) to `gronnest`
5. Click **Rename**

After renaming, update your local git remote:

```bash
cd gronnest
git remote set-url origin https://github.com/YOUR_USERNAME/gronnest.git
```

## 3. Update Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings**
4. Under **General**, find **Project Name**
5. Change to `gronnest`
6. Save changes

### Update Domain (if applicable)

If you're using a Vercel subdomain:
1. In Vercel Settings, go to **Domains**
2. Add `gronnest.vercel.app` (or your preferred subdomain)
3. Remove the old domain if needed

## 4. Redeploy

After renaming:

```bash
cd gronnest
git add .
git commit -m "Rename project from GrønnValg to Grønnest"
git push
```

Vercel will automatically redeploy.

## Summary of Code Changes Made

The following files were updated:

- `src/lib/i18n/translations.ts` - App name, taglines
- `src/app/layout.tsx` - Metadata and title
- `src/app/om/page.tsx` - About page
- `src/app/vilkar/page.tsx` - Terms page
- `src/app/personvern/page.tsx` - Privacy page
- `src/app/page.tsx` - LocalStorage keys
- `src/app/sw.js` - Service worker cache name
- `src/components/Header.tsx` - Header
- `src/components/AppFooter.tsx` - Footer
- `src/components/StatsCard.tsx` - Score labels
- `src/components/ProductCard.tsx` - Comments
- `src/components/modals/ChatModal.tsx` - AI responses
- `src/components/modals/ContactModal.tsx` - Contact info
- `src/components/modals/ScoreInfoModal.tsx` - Score explanation
- `src/lib/analytics.ts` - Analytics keys
- `src/lib/scoring.ts` - Comments
- `src/lib/openfoodfacts.ts` - User-Agent
- `src/lib/i18n/LanguageContext.tsx` - Storage key
- `package.json` - Project name
- `public/manifest.json` - PWA manifest

**Note:** Internal TypeScript types (`GrønnScoreResult`, `calculateGrønnScore`) were kept unchanged to avoid breaking changes. The user-facing text now shows "Miljøscore".
