import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ChatBot from './components/ChatBot';
import ToastContainer from './components/Toast';

// Core Priority Pages (Immediate Instant Load)
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';

// Code-Split Dynamic Secondary & Admin Pages (Loaded on demand for ultra-speed)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Checkout = lazy(() => import('./pages/Checkout'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Fast Lightweight Loading Shimmer
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
    <div className="w-10 h-10 rounded-full border-3 border-emerald-200 border-t-emerald-600 animate-spin"></div>
    <span className="text-xs font-bold text-emerald-800 tracking-wider animate-pulse">🌿 Loading Green Petals...</span>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <main className="min-h-screen bg-background text-foreground relative">
        <Navbar />
        <div className="w-full">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />

              {/* Protected Customer Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<UserDashboard />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/order/:id" element={<OrderTracking />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
        <ChatBot />
        <ToastContainer />
      </main>
    </Router>
  );
}

export default App;
