import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useProfile } from "@/hooks/useProfile";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Categories", path: "/categories" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();
  const { profile } = useProfile();
  const { user, loading } = useAuthContext();
  const { signOut } = useAuth();
  const { items } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const displayName = profile?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-header"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="razorpay-webhook-server/assets/logo.png"
                alt="Ajashia"
                className="h-10 w-10 object-contain rounded-xl"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Ajashia</span>
                <span className="text-[10px] text-muted-foreground -mt-1 tracking-wider">TECH STORE</span>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path ? "text-primary" : "text-white hover:text-primary"
                  }`}>
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    className="hidden md:block overflow-hidden">
                    <Input value={searchQuery} onChange={handleSearch} placeholder="Search products..."
                      className="w-64 bg-muted/40 border-border" autoFocus />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)} className="hidden md:flex text-white">
                <Search className="w-5 h-5" />
              </Button>

              <Link to="/wishlist">
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs flex items-center justify-center px-1">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>

              {!loading && (
                user ? (
                  <div className="hidden md:flex items-center gap-3">
                    <Link to="/profile"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition">
                      <User className="w-4 h-4" />
                      <span className="text-sm max-w-[140px] truncate">{displayName}</span>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white hover:text-red-400">Logout</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Log out?</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to log out of your account?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleLogout}>Logout</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <Link to="/auth/sign-in" className="hidden md:block">
                    <Button variant="hero" size="sm"><User className="w-4 h-4" /> Sign In</Button>
                  </Link>
                )
              )}

              <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-2xl p-6 pt-24">
              <Input value={searchQuery} onChange={handleSearch} placeholder="Search products..."
                className="mb-6 bg-muted/40 border-border" />
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div key={link.path} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link to={link.path}
                      className={`block py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                        location.pathname === link.path ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-8">
                {!loading && (
                  user ? (
                    <>
                      <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-muted">
                        <User className="w-5 h-5" />
                        <span className="text-sm truncate">{user.user_metadata?.name || user.email}</span>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">Logout</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Log out?</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to log out of your account?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleLogout}>Logout</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Link to="/auth/sign-in">
                      <Button variant="hero" className="w-full"><User className="w-5 h-5" /> Sign In</Button>
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};