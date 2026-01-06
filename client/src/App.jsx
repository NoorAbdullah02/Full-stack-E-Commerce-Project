import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

import Home from './pages/Home';
// Placeholder Pages
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';

import Checkout from './pages/Checkout';
import ChatBot from './components/ChatBot';
import Wishlist from './pages/Wishlist';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import Products from './pages/Products';
import ToastContainer from './components/Toast';
import OrderTracking from './pages/OrderTracking';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Placeholder Pages
// const Home = () => <div className="p-10 font-bold text-3xl">Home Page</div>;
// const ProductDetails = () => <div className="p-10">Product Details</div>;
// const Cart = () => <div className="p-10">Cart</div>;
// const AdminDashboard = () => <div className="p-10">Admin Dashboard</div>;

function App() {
  return (
    <Router>
      <main className="min-h-screen bg-background text-foreground relative">
        <Navbar />
        {/* Header/Navbar would go here */}
        <div className="w-full">
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

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<UserDashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/order/:id" element={<OrderTracking />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </div>
        <ChatBot />
        <ToastContainer />
      </main>
    </Router>
  );
}

export default App;
