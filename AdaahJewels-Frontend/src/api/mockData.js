import axiosInstance from './axiosInstance';

// Mock data
const mockProducts = [
  {
    id: 1,
    name: 'Golden Jhumka Earrings',
    price: 899,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
    category: 'Earrings',
    isLightweight: true,
    rating: 4.5,
    material: 'Gold plated',
    description: 'Traditional golden jhumka earrings with intricate design. Perfect for festive occasions.',
  },
  {
    id: 2,
    name: 'Kundan Necklace Set',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
    category: 'Necklaces',
    isLightweight: false,
    rating: 4.8,
    material: 'Kundan',
    description: 'Elegant kundan necklace set with matching earrings. Ideal for weddings and special events.',
  },
  {
    id: 3,
    name: 'Silver Oxidized Ring',
    price: 399,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop',
    category: 'Rings',
    isLightweight: true,
    rating: 4.2,
    material: 'Silver',
    description: 'Bohemian style oxidized silver ring. Adjustable size for comfortable fit.',
  },
  {
    id: 4,
    name: 'Pearl Maang Tikka',
    price: 699,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    category: 'Maang Tikka',
    isLightweight: true,
    rating: 4.6,
    material: 'Gold plated',
    description: 'Delicate pearl maang tikka with gold plating. Adds grace to your bridal look.',
  },
  {
    id: 5,
    name: 'Chandbali Earrings',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&h=500&fit=crop',
    category: 'Earrings',
    isLightweight: true,
    rating: 4.7,
    material: 'Gold plated',
    description: 'Classic chandbali earrings with pearl drops. Lightweight and comfortable for all-day wear.',
  },
  {
    id: 6,
    name: 'Temple Jewellery Necklace',
    price: 3299,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=500&h=500&fit=crop',
    category: 'Necklaces',
    isLightweight: false,
    rating: 4.9,
    material: 'Gold plated',
    description: 'Traditional South Indian temple jewellery necklace. Intricate craftsmanship with deity motifs.',
  },
  {
    id: 7,
    name: 'Floral Stud Earrings',
    price: 499,
    image: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=500&h=500&fit=crop',
    category: 'Earrings',
    isLightweight: true,
    rating: 4.3,
    material: 'Gold plated',
    description: 'Dainty floral stud earrings. Perfect for daily wear and office settings.',
  },
  {
    id: 8,
    name: 'Polki Choker Necklace',
    price: 2899,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    category: 'Necklaces',
    isLightweight: false,
    rating: 4.8,
    material: 'Kundan',
    description: 'Stunning polki choker necklace with emerald accents. Makes a statement at any event.',
  },
  {
    id: 9,
    name: 'Adjustable Finger Ring Set',
    price: 599,
    image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&h=500&fit=crop',
    category: 'Rings',
    isLightweight: true,
    rating: 4.4,
    material: 'Gold plated',
    description: 'Set of 3 adjustable rings with different designs. Mix and match for trendy looks.',
  },
  {
    id: 10,
    name: 'Bridal Maang Tikka',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    category: 'Maang Tikka',
    isLightweight: true,
    rating: 4.9,
    material: 'Kundan',
    description: 'Elaborate bridal maang tikka with kundan work. Complete your wedding ensemble.',
  },
  {
    id: 11,
    name: 'Tassel Earrings',
    price: 799,
    image: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=500&h=500&fit=crop',
    category: 'Earrings',
    isLightweight: true,
    rating: 4.5,
    material: 'Gold plated',
    description: 'Trendy tassel earrings with colorful threads. Adds a pop of color to any outfit.',
  },
  {
    id: 12,
    name: 'Layered Chain Necklace',
    price: 1799,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    category: 'Necklaces',
    isLightweight: true,
    rating: 4.6,
    material: 'Gold plated',
    description: 'Modern layered chain necklace. Versatile piece for both traditional and western wear.',
  },
];

const mockTestimonials = [
  {
    id: 1,
    quote: 'Loved it..! The earrings are so lightweight and beautiful. Got so many compliments at my friend\'s wedding!',
    name: 'Priya Sharma',
    rating: 5,
  },
  {
    id: 2,
    quote: 'Amazing quality! The necklace looks exactly like the picture. Very happy with my purchase.',
    name: 'Anjali Verma',
    rating: 5,
  },
  {
    id: 3,
    quote: 'Fast delivery and excellent packaging. The jewellery is stunning and doesn\'t feel heavy at all.',
    name: 'Neha Patel',
    rating: 5,
  },
  {
    id: 4,
    quote: 'Best artificial jewellery I\'ve bought online! The gold plating is perfect and it\'s hypoallergenic.',
    name: 'Riya Gupta',
    rating: 5,
  },
];

const mockCategories = [
  {
    id: 1,
    name: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop',
    count: 150,
  },
  {
    id: 2,
    name: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
    count: 120,
  },
  {
    id: 3,
    name: 'Rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop',
    count: 80,
  },
  {
    id: 4,
    name: 'Maang Tikka',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop',
    count: 45,
  },
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const fetchProducts = async (filters = {}) => {
  await delay(800);
  let filteredProducts = [...mockProducts];
  
  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
  }
  
  if (filters.minPrice || filters.maxPrice) {
    filteredProducts = filteredProducts.filter(p => {
      const matchMin = !filters.minPrice || p.price >= filters.minPrice;
      const matchMax = !filters.maxPrice || p.price <= filters.maxPrice;
      return matchMin && matchMax;
    });
  }
  
  if (filters.material) {
    filteredProducts = filteredProducts.filter(p => p.material === filters.material);
  }
  
  if (filters.sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }
  
  return { data: filteredProducts };
};

export const fetchProductById = async (id) => {
  await delay(600);
  const product = mockProducts.find(p => p.id === parseInt(id));
  if (!product) {
    throw new Error('Product not found');
  }
  return { data: product };
};

export const fetchTestimonials = async () => {
  await delay(500);
  return { data: mockTestimonials };
};

export const fetchCategories = async () => {
  await delay(400);
  return { data: mockCategories };
};

export const fetchBestSellers = async () => {
  await delay(700);
  const bestSellers = mockProducts.filter(p => p.rating >= 4.5).slice(0, 6);
  return { data: bestSellers };
};

export const fetchRecommendations = async (productId) => {
  await delay(600);
  const currentProduct = mockProducts.find(p => p.id === parseInt(productId));
  const recommendations = mockProducts
    .filter(p => p.category === currentProduct?.category && p.id !== parseInt(productId))
    .slice(0, 4);
  return { data: recommendations };
};
