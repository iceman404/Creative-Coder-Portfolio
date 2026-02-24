# Local Development Server Setup

This guide helps you test the site locally before uploading to GitHub.

## Quick Start

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   Or use the simple serve command:
   ```bash
   npm run serve
   ```

3. **Open your browser**:
   - The server will automatically open at `http://localhost:3000`
   - Or manually navigate to the URL shown in the terminal

## Alternative: Simple HTTP Server

If you prefer a simpler solution without npm:

```bash
# Python 3
python3 -m http.server 3000

# Or Node.js http-server (if installed globally)
npx http-server -p 3000
```

## Testing Checklist

- ✅ All pages load correctly
- ✅ Navigation works (no .html extensions in URLs)
- ✅ Resume download works (tries HackerRank first, falls back to local PDF)
- ✅ All links work properly
- ✅ Responsive design works on mobile
- ✅ 404 page works
- ✅ Control panel accessible

## Notes

- The `vite.config.js` file is for local testing only and is ignored by git
- When uploading to GitHub, the site will work with GitHub Pages
- The resume link automatically tries HackerRank URL first, then falls back to local PDF
