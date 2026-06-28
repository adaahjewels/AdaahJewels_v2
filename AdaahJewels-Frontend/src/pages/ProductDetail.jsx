import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Plus, Minus, Truck, Shield, ChevronRight } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductById, getRecommendations } from '../services/productService';
import toast from 'react-hot-toast';
import { FALLBACK_IMAGE, getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]           = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [quantity, setQuantity]         = useState(1);
  const [activeTab, setActiveTab]       = useState('details');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart, isInCart }       = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const [prod, recs] = await Promise.all([
        getProductById(id),
        getRecommendations(id, 4).catch(() => []),
      ]);
      setProduct(prod);
      setRecommendations(Array.isArray(recs) ? recs : []);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      toast.success('Added to cart!', { icon: '✨' });
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  /* ── Loading skeleton ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{ background: 'var(--color-cream-100)' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl skeleton" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl skeleton" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded-xl skeleton" />
              <div className="h-5 w-1/3 rounded-xl skeleton" />
              <div className="h-10 w-1/2 rounded-xl skeleton" />
              <div className="h-28 w-full rounded-xl skeleton" />
              <div className="h-12 w-full rounded-xl skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ─────────────────────────────────────────── */
  if (!product) {
    return (
      <div className="min-h-screen py-16 flex items-center justify-center" style={{ background: 'var(--color-cream-100)' }}>
        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-ink)' }}>Product not found</p>
          <Link to="/products" className="text-sm font-medium" style={{ color: 'var(--color-brand-600)' }}>
            ← Back to products
          </Link>
        </div>
      </div>
    );
  }

  const name        = product.ProductName || product.name || '';
  const price       = product.Price       || product.price       || 0;
  const description = product.Description || product.description || '';
  const category    = product.CategoryName|| product.category    || '';
  const material    = product.Material    || product.material    || '';
  const rating      = product.AverageRating || product.rating    || 0;
  const productId   = product.ProductId   || product.id;
  const stock       = product.Stock       || product.stock       || 0;
  const discount    = product.Discount    || product.discount    || 0;
  const originalPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : null;

  const rawImages = product.ProductImages || product.images || [];
  const images    = rawImages.length > 0
    ? rawImages.map(img => getSafeImageUrl(img.ImageUrl || img.url || img, FALLBACK_IMAGE))
    : [getSafeImageUrl(product.ImageUrl || product.image, FALLBACK_IMAGE)];

  const inCart     = isInCart(productId);
  const inWishlist = isInWishlist(productId);

  const tabs = [
    { id: 'details',  label: 'Product Details' },
    { id: 'shipping', label: 'Shipping' },
  ];

  return (
    <div className="min-h-screen py-6 md:py-10" style={{ background: 'var(--color-cream-100)' }}>
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: 'var(--color-ink-muted)' }}>
          <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-brand-600 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: 'var(--color-ink)' }} className="font-medium truncate max-w-45">{name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">

          {/* Images */}
          <div>
            <div
              className="rounded-2xl overflow-hidden mb-3"
              style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-md)' }}
            >
              <img
                src={images[selectedImage]}
                alt={name}
                className="w-full aspect-square object-cover"
                onError={(e) => handleImageError(e)}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="aspect-square rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      border: `2px solid ${selectedImage === i ? 'var(--color-brand-500)' : 'transparent'}`,
                      boxShadow: selectedImage === i ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div
            className="rounded-2xl p-6 md:p-7"
            style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}
          >
            {category && (
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-brand-400)' }}>
                {category}
              </p>
            )}

            <h1 className="font-display font-bold text-2xl md:text-3xl mb-3" style={{ color: 'var(--color-ink)' }}>
              {name}
            </h1>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4"
                      style={{
                        fill: i < Math.floor(rating) ? 'var(--color-gold-500)' : 'none',
                        color: i < Math.floor(rating) ? 'var(--color-gold-500)' : 'var(--color-neutral-300)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-ink-secondary)' }}>
                  {parseFloat(rating).toFixed(1)}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-bold font-display" style={{ color: 'var(--color-brand-700)' }}>
                ₹{parseFloat(price).toFixed(0)}
              </span>
              {originalPrice && (
                <span className="text-base line-through" style={{ color: 'var(--color-ink-muted)' }}>
                  ₹{originalPrice}
                </span>
              )}
              {discount > 0 && (
                <span className="badge badge-brand text-xs">{discount}% OFF</span>
              )}
            </div>

            {/* Material */}
            {material && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-muted)' }}>
                  Material
                </p>
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-700)', border: '1px solid var(--color-brand-200)' }}
                >
                  {material}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-ink-muted)' }}>
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-600)', border: '1px solid var(--color-brand-200)' }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-base font-bold" style={{ color: 'var(--color-ink)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(stock || 99, quantity + 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-600)', border: '1px solid var(--color-brand-200)' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 btn-primary py-3 justify-center"
              >
                <ShoppingBag className="w-4 h-4" />
                {addingToCart ? 'Adding…' : inCart ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  background: inWishlist ? 'var(--color-brand-500)' : 'white',
                  color: inWishlist ? 'white' : 'var(--color-brand-500)',
                  border: `2px solid var(--color-brand-${inWishlist ? '500' : '200'})`,
                }}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button onClick={handleBuyNow} className="btn-secondary w-full py-3 justify-center mb-6">
              Buy Now
            </button>

            {/* Trust signals */}
            <div className="space-y-2.5 pt-5" style={{ borderTop: '1px solid var(--color-brand-100)' }}>
              {[
                { Icon: Truck,  text: 'Free shipping on orders above ₹1299' },
                { Icon: Shield, text: '100% quality assured' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--color-ink-secondary)' }}>
                  <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--color-brand-500)' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="rounded-2xl p-6 mb-12"
          style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex gap-6 mb-5" style={{ borderBottom: '1px solid var(--color-neutral-200)' }}>
            {tabs.map(({ id: tid, label }) => (
              <button
                key={tid}
                onClick={() => setActiveTab(tid)}
                className="pb-3 text-sm font-semibold transition-colors"
                style={{
                  color: activeTab === tid ? 'var(--color-brand-600)' : 'var(--color-ink-muted)',
                  borderBottom: activeTab === tid ? '2px solid var(--color-brand-500)' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-3 text-sm" style={{ color: 'var(--color-ink-secondary)' }}>
              {description && <p className="leading-relaxed">{description}</p>}
              <ul className="space-y-1.5">
                {material  && <li>• Material: {material}</li>}
                {category  && <li>• Category: {category}</li>}
                <li>• Hypoallergenic and skin-friendly</li>
                <li>• Handcrafted by Indian artisans</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-ink-secondary)' }}>
              <li>• Free shipping on orders above ₹1299</li>
              <li>• Standard delivery: 5-7 business days</li>
              <li>• Express delivery available at checkout</li>
            </ul>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-2xl mb-6" style={{ color: 'var(--color-ink)' }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendations.map((rec) => (
                <ProductCard key={rec.ProductId || rec.id} product={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
