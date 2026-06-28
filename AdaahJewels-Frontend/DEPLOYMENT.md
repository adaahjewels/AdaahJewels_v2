# Deployment Guide - MysticJewel

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd mystic-jewel
   vercel
   ```

3. **Follow prompts**
   - Link to your Vercel account
   - Configure project settings
   - Deploy!

**Automatic Deployments**: Connect your GitHub repo to Vercel for automatic deployments on push.

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

**Drag & Drop**: Alternatively, drag the `dist` folder to Netlify's web interface.

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install -D gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/mystic-jewel"
   }
   ```

3. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/mystic-jewel/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: AWS S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 bucket**
   - Enable static website hosting
   - Set bucket policy for public read

3. **Upload dist folder**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

4. **Configure CloudFront** (optional)
   - Create distribution
   - Point to S3 bucket
   - Configure custom domain

### Option 5: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build image**
   ```bash
   docker build -t mystic-jewel .
   ```

3. **Run container**
   ```bash
   docker run -p 80:80 mystic-jewel
   ```

## 🔧 Environment Configuration

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build Locally

```bash
npm run preview
```

### Environment Variables

If you need environment variables, create `.env` files:

**.env.development**
```
VITE_API_URL=http://localhost:3000/api
```

**.env.production**
```
VITE_API_URL=https://api.mysticjewel.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📊 Performance Optimization

### Before Deployment

1. **Optimize Images**
   - Use WebP format
   - Compress images
   - Use CDN for images

2. **Enable Compression**
   - Gzip/Brotli compression
   - Minification (handled by Vite)

3. **Configure Caching**
   - Set proper cache headers
   - Use service workers (optional)

4. **Analyze Bundle**
   ```bash
   npm run build -- --mode analyze
   ```

### Vite Build Optimizations

Already configured in the project:
- Code splitting
- Tree shaking
- Minification
- CSS optimization

## 🔒 Security Checklist

- [ ] Remove console.logs
- [ ] Secure API endpoints
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Use HTTPS
- [ ] Add security headers
- [ ] Sanitize user inputs
- [ ] Implement CSP (Content Security Policy)

## 🌐 Custom Domain Setup

### Vercel
1. Go to project settings
2. Add custom domain
3. Configure DNS records
4. Wait for SSL certificate

### Netlify
1. Go to domain settings
2. Add custom domain
3. Update DNS records
4. Enable HTTPS

### CloudFlare (Recommended for CDN)
1. Add site to CloudFlare
2. Update nameservers
3. Configure SSL/TLS
4. Enable caching rules

## 📱 PWA Configuration (Optional)

To make it a Progressive Web App:

1. **Install Vite PWA plugin**
   ```bash
   npm install -D vite-plugin-pwa
   ```

2. **Update vite.config.js**
   ```javascript
   import { VitePWA } from 'vite-plugin-pwa'
   
   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'MysticJewel',
           short_name: 'MysticJewel',
           description: 'Artificial Jewellery Ecommerce',
           theme_color: '#B22234',
           icons: [
             {
               src: 'icon-192.png',
               sizes: '192x192',
               type: 'image/png'
             },
             {
               src: 'icon-512.png',
               sizes: '512x512',
               type: 'image/png'
             }
           ]
         }
       })
     ]
   })
   ```

## 🔍 SEO Optimization

### Meta Tags (Update index.html)
```html
<meta name="description" content="MysticJewel - Beautiful artificial jewellery">
<meta name="keywords" content="jewellery, artificial jewellery, indian jewellery">
<meta property="og:title" content="MysticJewel">
<meta property="og:description" content="Timeless Craft. Modern Grace.">
<meta property="og:image" content="/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
```

### Sitemap
Generate sitemap.xml and add to public folder.

### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://mysticjewel.com/sitemap.xml
```

## 📈 Analytics Setup

### Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Monitoring & Error Tracking

### Sentry (Recommended)
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] Check all routes work
- [ ] Test on mobile devices
- [ ] Verify images load correctly
- [ ] Test cart and wishlist functionality
- [ ] Check console for errors
- [ ] Verify responsive design
- [ ] Test on different browsers
- [ ] Check loading performance
- [ ] Verify SEO meta tags
- [ ] Test 404 handling
- [ ] Backup current version

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📞 Support

For deployment issues:
- Check Vite documentation: https://vitejs.dev/guide/
- Check hosting provider docs
- Review build logs for errors

---

**Happy Deploying! 🚀**
