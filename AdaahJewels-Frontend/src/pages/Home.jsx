import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { couponService } from '../api/backendServices';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import { useBestSellers } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { getTestimonials } from '../services/testimonialService';
import { PageTransition, FadeInWhenVisible, StaggerContainer } from '../components/ui/PageTransition';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const Home = () => {
  const { products: bestSellers, loading: bestsellersLoading, error: bestsellersError } = useBestSellers(6);
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fetch testimonials (can be mock or API)
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        // Fallback to empty array
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  const loading = bestsellersLoading || categoriesLoading || testimonialsLoading;

  return (
    <PageTransition variant="slideUp">
      <div className="min-h-screen">
        {/* Hero Section */}
        <motion.section
          className="relative overflow-hidden"
          style={{ minHeight: '520px', height: 'clamp(420px, 60vh, 660px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1400&h=700&fit=crop)',
            }}
          />
          {/* Brand-coloured gradient overlay */}
          <div className="hero-overlay absolute inset-0" />

          <div className="relative container mx-auto px-4 h-full flex items-center" style={{ minHeight: 'inherit' }}>
            <motion.div
              className="max-w-xl text-white"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15 }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-gold-300)' }}
              >
                ✦ Adaah Jewels Collection
              </p>
              <h1 className="text-4xl md:text-6xl font-display font-black leading-tight mb-5" style={{ color: 'white' }}>
                Timeless Craft.<br />Modern Grace.
              </h1>
              <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
                Discover exquisite artificial jewellery that blends tradition with contemporary elegance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary">
                  Explore Collection
                </Link>
                <Link
                  to="/products?filter=new"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.40)', backdropFilter: 'blur(8px)' }}
                >
                  New Arrivals
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Free Shipping Banner — removed */}

      {/* Categories Section */}
      <FadeInWhenVisible>
        <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl section-heading">
            Shop by Category
          </h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-center text-red-600">
              Error loading categories
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => {
                const catId = category.CategoryId || category.id;
                const catName = category.CategoryName || category.name || '';
                const catImage = getSafeImageUrl(category.ImageUrl || category.image || category.image_url, '/no-image.svg');
                return (
                  <Link
                    key={catId}
                    to={`/products?category=${encodeURIComponent(catName)}`}
                    className="group text-center"
                  >
                    <div
                      className="aspect-square rounded-2xl overflow-hidden mb-4 card-shadow mx-auto"
                      style={{ maxWidth: '160px', border: '2px solid var(--color-brand-100)' }}
                    >
                      <img
                        src={catImage}
                        alt={catName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => handleImageError(e)}
                      />
                    </div>
                    <h3
                      className="font-display font-semibold text-base transition-colors duration-200 group-hover:text-brand-600"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {catName}
                    </h3>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No categories available
            </div>
          )}
        </div>
      </section>
      </FadeInWhenVisible>

      {/* Best Sellers Section */}
      <FadeInWhenVisible>
        <section className="py-16" style={{ background: 'var(--color-brand-50)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl section-heading mb-0 text-left">Best Sellers</h2>
            <Link
              to="/products"
              className="text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--color-brand-600)' }}
            >
              View All →
            </Link>
          </div>
          {bestsellersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : bestsellersError ? (
            <div className="text-center text-red-600">
              Error loading best sellers
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.ProductId || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No products available
            </div>
          )}
        </div>
      </section>
      </FadeInWhenVisible>

      {/* Trust Badges */}
      <FadeInWhenVisible>
        <TrustBadges />
      </FadeInWhenVisible>

      {/* Testimonials Section */}
      <FadeInWhenVisible>
        <section className="py-16" style={{ background: 'linear-gradient(135deg, var(--color-cream-200), var(--color-brand-50))' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl section-heading">What Our Customers Say</h2>
          {testimonialsLoading ? (
            <div className="max-w-3xl mx-auto animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ) : testimonials.length > 0 ? (
            <div className="max-w-3xl mx-auto relative">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12" style={{ border: '1px solid var(--color-brand-100)' }}>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" style={{ fill: 'var(--color-gold-500)', color: 'var(--color-gold-500)' }} />
                  ))}
                </div>
                <p className="text-lg md:text-xl italic text-center mb-6 leading-relaxed" style={{ color: 'var(--color-ink-secondary)' }}>
                  "{testimonials[currentTestimonial]?.quote}"
                </p>
                <p className="text-center font-bold font-display" style={{ color: 'var(--color-brand-600)' }}>
                  — {testimonials[currentTestimonial]?.name}
                </p>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-2.5 shadow-md hover:shadow-lg transition-all hover:scale-105"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-brand-500)' }} />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-2.5 shadow-md hover:shadow-lg transition-all hover:scale-105"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-brand-500)' }} />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: index === currentTestimonial ? '1.5rem' : '0.5rem',
                      background: index === currentTestimonial ? 'var(--color-brand-500)' : 'var(--color-neutral-300)',
                    }}
                    aria-label={`Testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              No testimonials available
            </div>
          )}
        </div>
      </section>
      </FadeInWhenVisible>

      {/* Festive Offer Banner */}
      <motion.section
        className="py-12 text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-brand-800), var(--color-brand-900))' }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-2xl md:text-3xl font-display font-bold mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            🎉 Diwali Special Offer! 🎉
          </motion.h2>
          <p className="text-base mb-3" style={{ color: 'var(--color-neutral-300)' }}>
            Get 15% off on your first order
          </p>
          <DynamicCouponBanner />
        </div>
      </motion.section>
    </div>
    </PageTransition>
  );
};

export default Home;

function DynamicCouponBanner() {
  const [coupon, setCoupon] = useState(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await couponService.getActive();
        if (!mounted) return;
        if (list && list.length > 0) setCoupon(list[0]);
      } catch (err) {
        console.error('Failed to load active coupons', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!coupon) return (
    <p className="text-xl font-bold font-display tracking-wider" style={{ color: 'var(--color-gold-400)' }}>
      Subscribe for offers
    </p>
  );

  return (
    <p className="text-xl font-bold font-display tracking-wider" style={{ color: 'var(--color-gold-400)' }}>
      Use code: {coupon.code}
    </p>
  );
}
