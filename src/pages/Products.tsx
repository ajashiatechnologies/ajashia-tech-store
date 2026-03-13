import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutList,
} from "lucide-react";

/* ================= TYPES ================= */

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  price: number;
  offer_price: number | null;
  stock: number;
  image_url: string | null;
  created_at: string;
};

type RatingRow = {
  product_id: string;
  rating: number;
};

/* ================= HELPERS ================= */

const normalizeCategory = (category: string) =>
  category.toLowerCase().replace(/\s+/g, "");

/* ================= COMPONENT ================= */

const Products = () => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* ⭐ RATING MAPS */
  const [ratingMap, setRatingMap] = useState<Record<string, number>>({});
  const [ratingCountMap, setRatingCountMap] = useState<Record<string, number>>({});

  /* UI STATE */
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* FILTER STATE — pre-populate from URL ?category=xxx */
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  /* If user navigates from one category link to another, sync state */
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategories([cat]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, category, price,
          offer_price, stock, image_url, created_at
        `)
        .eq("is_active", true);

      if (!error) setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  /* ================= FETCH RATINGS ================= */

  useEffect(() => {
    if (products.length === 0) return;

    const fetchRatings = async () => {
      const { data, error } = await supabase
        .from("product_ratings")
        .select("product_id, rating");

      if (error || !data) return;

      const sumMap: Record<string, number> = {};
      const countMap: Record<string, number> = {};

      data.forEach((r: RatingRow) => {
        sumMap[r.product_id] = (sumMap[r.product_id] || 0) + r.rating;
        countMap[r.product_id] = (countMap[r.product_id] || 0) + 1;
      });

      const avgMap: Record<string, number> = {};
      Object.keys(sumMap).forEach((pid) => {
        avgMap[pid] = Number((sumMap[pid] / countMap[pid]).toFixed(1));
      });

      setRatingMap(avgMap);
      setRatingCountMap(countMap);
    };

    fetchRatings();
  }, [products]);

  /* ================= FILTER + SORT ================= */

  const filteredProducts = useMemo(() => {
    let data = [...products];

    /* 🔍 SEARCH */
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    /* 📂 CATEGORY */
    if (selectedCategories.length > 0) {
      data = data.filter((p) =>
        p.category
          ? selectedCategories.includes(normalizeCategory(p.category))
          : false
      );
    }

    /* 💰 PRICE */
    data = data.filter((p) => {
      const finalPrice = p.offer_price ?? p.price;
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
    });

    /* ⭐ RATING FILTER */
    if (selectedRating !== null) {
      data = data.filter((p) => {
        const rating = ratingMap[p.id] ?? 0;
        return rating >= selectedRating;
      });
    }

    /* 🔃 SORT */
    if (sortBy === "price-low") {
      data.sort((a, b) => (a.offer_price ?? a.price) - (b.offer_price ?? b.price));
    }
    if (sortBy === "price-high") {
      data.sort((a, b) => (b.offer_price ?? b.price) - (a.offer_price ?? a.price));
    }
    if (sortBy === "newest") {
      data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return data;
  }, [products, searchQuery, selectedCategories, priceRange, selectedRating, sortBy, ratingMap]);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {selectedCategories.length === 1
                ? `${selectedCategories[0].charAt(0).toUpperCase() + selectedCategories[0].slice(1)} Products`
                : "All Products"}
            </h1>
            <p className="text-muted-foreground">
              {selectedCategories.length === 1 ? (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-primary underline underline-offset-2 text-sm"
                >
                  ← Back to all products
                </button>
              ) : (
                "Browse our electronics components"
              )}
            </p>
          </motion.div>

          {/* SEARCH + CONTROLS */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low → High (₹)</SelectItem>
                <SelectItem value="price-high">Price: High → Low (₹)</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 ${viewMode === "grid" ? "bg-primary text-white" : ""}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 ${viewMode === "list" ? "bg-primary text-white" : ""}`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>

            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-8">
            {/* FILTER SIDEBAR */}
            <aside
              className={`${
                showFilters
                  ? "fixed inset-0 z-50 bg-background p-6 overflow-auto"
                  : "hidden"
              } lg:block lg:relative lg:w-64`}
            >
              <ProductFilters
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
              />
            </aside>

            {/* PRODUCTS */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredProducts.length} products
              </p>

              {loading ? (
                <div className="py-20 text-center">Loading products…</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm">Try a different category or clear your filters</p>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSearchQuery("");
                    }}
                    className="mt-4 text-primary underline underline-offset-2 text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard
                        viewMode={viewMode}
                        product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          category: product.category,
                          image: product.image_url,
                          stock: product.stock,
                          price: product.offer_price ?? product.price,
                          originalPrice: product.offer_price ? product.price : null,
                          avgRating: ratingMap[product.id] ?? 0,
                          ratingCount: ratingCountMap[product.id] ?? 0,
                        }}
                        onAddToCart={() => console.log("ADD TO CART:", product)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;