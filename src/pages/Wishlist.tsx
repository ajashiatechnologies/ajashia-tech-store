import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
//import  useCart  from "@/hooks/useCart";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  ArrowRight,
} from "lucide-react";

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  //const { addToCart } = useCart();

  const handleAddToCart = (item: (typeof items)[0]) => {
   // addToCart({
   //   id: Number(item.id),
   //   name: item.name,
   //   price: item.price,
   //   image: item.image,
  //  });
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground">
                {items.length} items saved
              </p>
            </div>

            {items.length > 0 && (
              <Button variant="outline" onClick={clearWishlist}>
                Clear All
              </Button>
            )}
          </div>

          {/* EMPTY */}
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Your wishlist is empty
              </h2>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => {
                // ✅ SAFE ROUTE
                const productLink = item.slug
                  ? `/product/${item.slug}`
                  : `/product-id/${item.id}`;

                return (
                  <motion.div
                    key={item.id}
                    className="bg-card rounded-2xl border overflow-hidden"
                  >
                    <Link to={productLink}>
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromWishlist(item.id);
                          }}
                          className="absolute top-3 right-3 bg-destructive text-white p-2 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={productLink}>
                        <h3 className="font-semibold line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>

                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4,5].map(i => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              item.rating >= i
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="font-bold">₹{item.price}</span>
                        <Button size="sm" onClick={() => handleAddToCart(item)}>
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
