import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";

/* ================= TYPES ================= */

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  category: string | null;
  stock: number;

  /* ⭐ RATING */
  avgRating?: number;
  ratingCount?: number;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  onAddToCart?: () => void;
}

/* ================= COMPONENT ================= */

export const ProductCard = ({
  product,
  viewMode = "grid",
  onAddToCart,
}: ProductCardProps) => {
  const {
    id,
    name,
    slug,
    image,
    category,
    price,
    originalPrice,
    stock,
    avgRating = 0,
    ratingCount = 0,
  } = product;

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(id);

  const handleWishlistToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        name,
        slug,
        price,
        image: image || "/placeholder.png",
        rating: avgRating,
      });
    }
  };

  /* ================= LIST VIEW ================= */

  if (viewMode === "list") {
    return (
      <div className="group bg-card rounded-2xl border overflow-hidden flex">
        <div className="relative w-48 bg-muted">
          <img
            src={image || "/placeholder.png"}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              {category}
            </div>

            <Link to={`/product/${slug}`}>
              <h3 className="text-lg font-semibold hover:text-primary">
                {name}
              </h3>
            </Link>

            {/* ⭐ RATING */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    avgRating >= i
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({ratingCount})
              </span>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">₹{price}</span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={`w-5 h-5 ${
                    inWishlist
                      ? "text-red-500 fill-red-500"
                      : ""
                  }`}
                />
              </Button>

              <Button size="sm" onClick={onAddToCart}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= GRID VIEW ================= */

  return (
    <div className="group bg-card rounded-2xl border overflow-hidden">
      <div className="relative aspect-square bg-muted">
        <img
          src={image || "/placeholder.png"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* ❤️ Wishlist toggle */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleWishlistToggle}
          >
            <Heart
              className={`w-4 h-4 ${
                inWishlist
                  ? "text-red-500 fill-red-500"
                  : ""
              }`}
            />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1">
          {category}
        </div>

        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold hover:text-primary line-clamp-1">
            {name}
          </h3>
        </Link>

        {/* ⭐ RATING */}
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                avgRating >= i
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({ratingCount})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold">₹{price}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
