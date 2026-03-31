import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/* ================= CORE (KEEP NORMAL) ================= */

import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";
import AdminRoute from "./routes/AdminRoute";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { WishlistProvider } from "@/hooks/useWishlist";
import { CartProvider } from "@/hooks/useCart";

/* ================= HOME (KEEP NORMAL) ================= */

import Index from "./pages/Index";
import UpdatePassword from "./pages/auth/update-password";
import ForgotPassword from "./pages/auth/forgot-password";

/* ================= LAZY LOADED PAGES ================= */

const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const Profile = lazy(() => import("./pages/Profile"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const SeyalPage = lazy(() => import("./pages/Seyalpage"));

/* ================= FOOTER PAGES ================= */

const ShippingInfo = lazy(() => import("./pages/ShippingInfo"));
const ReturnsRefunds = lazy(() => import("./pages/ReturnsRefunds"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const Careers = lazy(() => import("./pages/Careers"));
const Blog = lazy(() => import("./pages/Blog"));
const Press = lazy(() => import("./pages/Press"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));

/* ================= AUTH ================= */

const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const NotFound = lazy(() => import("./pages/NotFound"));

/* ================= ADMIN ================= */

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminnewsLetter"));
const AdminCoupons = lazy(() => import("./pages/admin/Admincoupons"));
const AdminDNAManager = lazy(() => import("./pages/admin/Admindnamanager"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));


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
              <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                {/* 🔒 Auth Routes */}
                <Route path="/auth/sign-in" element={<SignIn />} />
                <Route path="/auth/sign-up" element={<SignUp />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/update-password" element={<UpdatePassword />} />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;