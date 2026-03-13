import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderSuccess from "@/pages/OrderSuccess";

import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";
import AdminRoute from "./routes/AdminRoute";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { WishlistProvider } from "@/hooks/useWishlist";
import { CartProvider } from "@/hooks/useCart";
import AdminBlog from "./pages/admin/AdminBlog";

/* ================= PAGES ================= */

import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CategoriesPage from "./pages/CategoriesPage";
import Profile from "./pages/Profile";
import AdminNewsletter from "./pages/admin/AdminnewsLetter";
import AdminCoupons from "./pages/admin/Admincoupons";  
import SeyalPage from "./pages/Seyalpage";
import AdminDNAManager from "./pages/admin/Admindnamanager";
/* ================= FOOTER PAGES ================= */

import ShippingInfo from "@/pages/ShippingInfo";
import ReturnsRefunds from "@/pages/ReturnsRefunds";
import TrackOrder from "@/pages/TrackOrder";
import FAQPage from "@/pages/FAQPage";
import Careers from "@/pages/Careers";
import Blog from "@/pages/Blog";
import Press from "@/pages/Press";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";

/* ================= AUTH ================= */

import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import NotFound from "./pages/NotFound";

/* ================= ADMIN ================= */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";

/* ================= QUERY CLIENT ================= */

const queryClient = new QueryClient();

/* ================= APP ================= */

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <WishlistProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <BrowserRouter>
              <Routes>
                {/* 🔒 Auth Routes */}
                <Route path="/auth/sign-in" element={<SignIn />} />
                <Route path="/auth/sign-up" element={<SignUp />} />
                <Route path="/seyal" element={<SeyalPage />} />

                {/* 🌐 User Layout */}
                <Route element={<AppLayout />}>
                  {/* Core pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/product-id/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Support */}
                  <Route path="/shipping" element={<ShippingInfo />} />
                  <Route path="/returns" element={<ReturnsRefunds />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/faq" element={<FAQPage />} />

                  {/* Company */}
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/press" element={<Press />} />

                  {/* Legal */}
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                </Route>

                {/* 🔐 Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="newsletter" element={<AdminNewsletter />} /> 
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="dna" element={<AdminDNAManager />} />
                  <Route path="blog" element={<AdminBlog />} />
                </Route>

                {/* ❌ 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;