# 🚀 Quick Start Guide - MysticJewel

## Get Started in 3 Steps

### Step 1: Navigate to Project
```bash
cd mystic-jewel
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

### Step 3: Start Development Server
```bash
npm run dev
```

**That's it!** Open your browser and go to: **http://localhost:5173**

---

## 🎯 What You'll See

### Home Page (/)
- Beautiful hero section with "Timeless Craft. Modern Grace."
- 4 category circles (Earrings, Necklaces, Rings, Maang Tikka)
- Best sellers grid with 6 products
- Trust badges (Made in India, Free Shipping, etc.)
- Customer testimonials carousel
- Diwali special offer banner

### Product Listing (/products)
- 12 products in a responsive grid
- Filter sidebar (category, price, material)
- Sort dropdown (popularity, price, rating)
- Search functionality

### Product Detail (/product/:id)
- Click any product to see details
- Image gallery
- Add to cart / Wishlist buttons
- Quantity selector
- Product tabs (Details, Shipping, Returns)
- Recommendations

### Wishlist (/wishlist)
- Click heart icon on any product
- View all saved items
- Move to cart functionality

### Shopping Cart
- Click cart icon in header
- Slide-in drawer from right
- Add/remove items
- Quantity controls
- Price breakdown
- Free shipping progress

---

## 🎨 Try These Features

### 1. Add to Cart
1. Go to home page
2. Click shopping bag icon on any product
3. Click cart icon in header to see drawer

### 2. Add to Wishlist
1. Click heart icon on any product
2. Heart turns red when added
3. Click "Wishlist" in navigation to see all

### 3. Filter Products
1. Go to /products
2. Use sidebar filters
3. Try different categories and price ranges

### 4. View Product Details
1. Click on any product card
2. See full details and images
3. Try quantity selector
4. Add to cart or wishlist

### 5. Mobile View
1. Resize browser to mobile width
2. See bottom navigation appear
3. Try hamburger menu
4. Test cart drawer

---

## 📱 Test on Mobile

### Option 1: Browser DevTools
1. Open browser DevTools (F12)
2. Click device toolbar icon
3. Select mobile device
4. Test all features

### Option 2: Local Network
1. Find your local IP (ipconfig on Windows, ifconfig on Mac/Linux)
2. Start dev server with: `npm run dev -- --host`
3. Access from phone: `http://YOUR_IP:5173`

---

## 🎨 Customize Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  maroon: '#B22234',  // Change this
  teal: '#008B8B',    // Change this
  gold: '#FFC000',    // Change this
  // ...
}
```

Save and see changes instantly!

---

## 📦 Add Your Own Products

Edit `src/api/mockData.js`:
```javascript
const mockProducts = [
  {
    id: 13,  // New ID
    name: 'Your Product Name',
    price: 999,
    image: 'https://your-image-url.jpg',
    category: 'Earrings',
    isLightweight: true,
    rating: 4.5,
    material: 'Gold plated',
    description: 'Your description here',
  },
  // ... existing products
];
```

---

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name

# Update dependencies
npm update
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3000
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styles Not Loading
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

---

## 📚 Quick Reference

### Key Files
- `src/App.jsx` - Main app with routing
- `src/pages/Home.jsx` - Landing page
- `src/components/ProductCard.jsx` - Product display
- `src/context/CartContext.jsx` - Cart state
- `src/api/mockData.js` - Product data

### Key Routes
- `/` - Home page
- `/products` - Product listing
- `/product/:id` - Product details
- `/wishlist` - Saved items

### Key Components
- `Header` - Top navigation
- `Footer` - Bottom section
- `CartDrawer` - Shopping cart
- `ProductCard` - Product display
- `TrustBadges` - Trust signals

---

## 🎯 Next Steps

1. ✅ **Explore the app** - Click around and test features
2. ✅ **Customize colors** - Make it your own
3. ✅ **Add products** - Update mock data
4. ✅ **Test responsive** - Try different screen sizes
5. ✅ **Read docs** - Check README.md for details
6. ✅ **Deploy** - See DEPLOYMENT.md for options

---

## 💡 Pro Tips

### Hot Reload
Changes to code automatically refresh the browser!

### React DevTools
Install React DevTools browser extension to inspect components.

### Tailwind IntelliSense
Install Tailwind CSS IntelliSense VS Code extension for autocomplete.

### Console Logs
Open browser console (F12) to see any errors or logs.

---

## 🎉 You're All Set!

The app is running at **http://localhost:5173**

Enjoy building with MysticJewel! 🚀

---

**Need Help?**
- Check README.md for detailed documentation
- Check FEATURES.md for complete feature list
- Check DEPLOYMENT.md for deployment options
- Check PROJECT_SUMMARY.md for project overview
