import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, User, Phone, MapPin, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { LoadingSpinner } from '../components/states/LoadingState';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-12 w-12 rounded-full border-4 border-cream-200 border-t-gold-500"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-cream-200 bg-white p-8 text-center shadow-xl"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gold-50 p-4 text-gold-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <p className="mb-4 text-charcoal-600">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.button
          whileHover={{ x: -2 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-charcoal-700 transition-colors hover:text-gold-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto max-w-3xl overflow-hidden rounded-4xl border border-cream-200 bg-white shadow-2xl"
        >
          <div className="relative h-28 bg-linear-to-r from-maroon-600 via-maroon-500 to-gold-500 md:h-36">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_45%)]" />
            <div className="absolute bottom-4 left-6 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Premium Member
            </div>
          </div>

          <div className="px-5 pb-8 pt-0 sm:px-8 md:px-10">
            <div className="-mt-14 mb-6 text-center sm:-mt-16 md:mb-8">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full border-4 border-cream-100 bg-white shadow-xl sm:h-32 sm:w-32"
              >
                <User className="h-12 w-12 text-gold-600 sm:h-14 sm:w-14" />
              </motion.div>
              <h1 className="font-display text-2xl font-bold text-charcoal-900 sm:text-3xl">
                {user.name || user.email}
              </h1>
              <p className="mt-2 break-all text-charcoal-600">{user.email}</p>
            </div>

            <div className="mb-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-gold-600" />
                  <h3 className="font-semibold text-charcoal-900">Email</h3>
                </div>
                <p className="ml-8 break-all text-sm text-charcoal-700">{user.email}</p>
              </div>

              {user.phone && (
                <div className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-gold-600" />
                    <h3 className="font-semibold text-charcoal-900">Phone</h3>
                  </div>
                  <p className="ml-8 text-sm text-charcoal-700">{user.phone}</p>
                </div>
              )}

              {user.address && (
                <div className="rounded-2xl border border-cream-200 bg-cream-50 p-4 md:col-span-2">
                  <div className="mb-2 flex items-center gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-gold-600" />
                    <h3 className="font-semibold text-charcoal-900">Address</h3>
                  </div>
                  <p className="ml-8 wrap-break-word text-sm text-charcoal-700">{user.address}</p>
                </div>
              )}
            </div>

            <div className="mb-8 rounded-2xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
              <p>
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/products')}
                className="flex-1 rounded-xl bg-charcoal-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-gold-600"
              >
                Continue Shopping
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-maroon-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-maroon-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
