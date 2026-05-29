# How to Upload Your Project to Vercel - Step by Step Guide

## What is Vercel?
Vercel is a platform where you can upload and run your web projects for free. People can visit your website using a link.

---

## Step 1: Prepare Your Project Files

Make sure your project folder has these important files:
- `index.html` (your main page)
- `style.css` (your styles)
- `script.js` (your JavaScript code)
- `vercel.json` (configuration file - we will create this)

---

## Step 2: Create `vercel.json` File

Add a new file to your project root folder called `vercel.json` with this content:

```json
{
  "buildCommand": "",
  "outputDirectory": ".",
  "installCommand": ""
}
```

This tells Vercel how to run your static website.

---

## Step 3: Create GitHub Account (if you don't have one)

1. Go to: https://github.com/signup
2. Create your free account
3. Verify your email

---

## Step 4: Create GitHub Repository

1. Go to: https://github.com/new
2. Enter repository name: `kimchi-calculator`
3. Add description: "Kimchi calculator app"
4. Click "Create repository"

---

## Step 5: Upload Your Files to GitHub

### Option A: Using GitHub Website (Easiest)

1. Go to your new repository page
2. Click "Add file" → "Upload files"
3. Drag and drop your project files (or click to browse)
4. Files you need to upload:
   - `index.html`
   - `style.css`
   - `script.js`
   - `vercel.json`
5. Scroll down and click "Commit changes"

### Option B: Using Git Command Line (For Advanced Users)

```bash
git clone https://github.com/YOUR-USERNAME/kimchi-calculator.git
cd kimchi-calculator
# Add your files here
git add .
git commit -m "Add kimchi calculator project"
git push origin main
```

---

## Step 6: Create Vercel Account

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Authorize Vercel to access your GitHub account
5. Complete your account setup

---

## Step 7: Deploy Your Project to Vercel

1. Go to: https://vercel.com/dashboard
2. Click "New Project" or "Add New..."
3. Find your `kimchi-calculator` repository and click "Import"
4. Vercel will show your project settings - just click "Deploy"
5. Wait 1-2 minutes for deployment to complete

---

## Step 8: Get Your Live Website Link

After deployment finishes:
1. You will see a screen with your website link
2. The link looks like: `https://kimchi-calculator-xxxxxx.vercel.app`
3. Click the link to view your website
4. Share this link with friends!

---

## Step 9: Update Your Project (After Making Changes)

When you make changes to your files:

### Using GitHub Website:
1. Go to your repository
2. Click the file name
3. Click the pencil icon to edit
4. Make your changes
5. Click "Commit changes"
6. Vercel will automatically redeploy your website

### Using Git Command Line:
```bash
git add .
git commit -m "Update my project"
git push origin main
```

---

## Troubleshooting

### If your website doesn't work:
1. Check that `index.html` is in the root folder (not in a subfolder)
2. Check that all file names match exactly (case sensitive on Linux/Mac)
3. Check browser console for errors (Press F12)

### If deployment fails:
1. Go to Vercel dashboard
2. Click your project
3. Look at the "Deployments" tab
4. Click the failed deployment
5. Look for error messages
6. Fix the errors and push to GitHub again

---

## Important Notes

- **File paths must be correct**: If your HTML file references `./images/pic.jpg`, make sure the `images` folder and `pic.jpg` file exist
- **No backend needed**: Vercel can host static websites (HTML, CSS, JavaScript) for free
- **Auto-deploy**: After you upload files to GitHub, Vercel automatically deploys them
- **Custom domain**: You can add your own domain later (costs extra)

---

## Need Help?

If you get stuck:
1. Check Vercel documentation: https://vercel.com/docs
2. Check GitHub documentation: https://docs.github.com
3. Ask in Vercel support: https://vercel.com/support

Good luck! 🚀
