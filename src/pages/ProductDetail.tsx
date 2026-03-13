import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";



import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Star,
} from "lucide-react";

/* ================= TYPES ================= */

type Spec = {
  label: string;
  value: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  price: number;
  offer_price: number | null;
  stock: number;
  image_url: string | null;
  free_shipping: boolean;
  warranty: boolean;
  easy_returns: boolean;
  description: string | null;
  specifications: Spec[] | null;
};

type Review = {
  id: string;
  review: string;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  reviewer_name?: string;
};





/* ================= COMPONENT ================= */

const ProductDetail = () => {
  const { slug, id } = useParams(); // ✅ support both routes

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();


  /* ⭐ RATING STATE */
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);


  /* DELETE REVIEW ACTION */
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [showLoginDialog, setShowLoginDialog] = useState(false);

  /* ADD REVIEW */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  

  /* ❤️ WISHLIST */
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    if (!slug && !id) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);

      let query = supabase
  .from("products")
  .select(`
    id,
    name,
    slug,
    category,
    price,
    offer_price,
    stock,
    image_url,
    free_shipping,
    warranty,
    easy_returns,
    description,
    specifications
  `)
  .eq("is_active", true);

if (slug) query = query.eq("slug", slug);
if (id) query = query.eq("id", id);

const { data: productData } = await query.maybeSingle();
setProduct(productData || null);
setLoading(false);



    };

    fetchProduct();
  }, [slug, id]);

  /* ================= FETCH RATINGS ================= */
  

  useEffect(() => {
    if (!product?.id) return;

    const fetchRatings = async () => {
      const { data } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("product_id", product.id);

      if (!data) return;

      const total = data.length;
      const sum = data.reduce((a, r) => a + r.rating, 0);

      setRatingCount(total);
      setAvgRating(total ? Number((sum / total).toFixed(1)) : 0);
    };

    const fetchUserRating = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("product_ratings")
        .select("rating")
        .eq("product_id", product.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setUserRating(data.rating);
        setRating(data.rating);
      }
    };

    fetchRatings();
    fetchUserRating();
  }, [product?.id]);

  
  /* ================= FETCH REVIEWS ================= */
  const attachReviewerNames = async (reviews: Review[]) => {
  const userIds = [...new Set(reviews.map(r => r.user_id))];

  

  if (userIds.length === 0) return reviews;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  if (!data) return reviews;

  const profileMap = Object.fromEntries(
    data.map(p => [
      p.id,
      p.full_name || p.email?.split("@")[0] || "Anonymous"
    ])
  );

  return reviews.map(r => ({
    ...r,
    reviewer_name: profileMap[r.user_id] || "Anonymous"
  }));
};

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  };

  getUser();
}, []);



  useEffect(() => {
  if (!product?.id) return;

  const fetchReviews = async () => {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, review, created_at, updated_at, user_id")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return;
  }

  //setReviews(data || []);
  const enriched = await attachReviewerNames(data || []);
  setReviews(enriched);

};


  fetchReviews();
}, [product?.id]);





  /* ================= SUBMIT RATING ================= */

  const submitRating = async (value: number) => {
    if (!product || ratingSubmitting) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setShowLoginDialog(true);
      return;

    }

    setRating(value);
    setRatingSubmitting(true);

    if (userRating === null) {
      await supabase.from("product_ratings").insert({
        product_id: product.id,
        user_id: user.id,
        rating: value,
      });

      setAvgRating(
        Number(((avgRating * ratingCount + value) / (ratingCount + 1)).toFixed(1))
      );
      setRatingCount((c) => c + 1);
    } else {
      await supabase
        .from("product_ratings")
        .update({ rating: value })
        .eq("product_id", product.id)
        .eq("user_id", user.id);

      setAvgRating(
        Number(((avgRating * ratingCount - userRating + value) / ratingCount).toFixed(1))
      );
    }

    setUserRating(value);
    setRatingSubmitting(false);
  };

  const submitReview = async () => {
  if (!product || !reviewText.trim()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    setShowLoginDialog(true);
    return;

  }

  setReviewSubmitting(true);

  const { data } = await supabase
    .from("product_reviews")
    .insert({
      product_id: product.id,
      user_id: user.id,
      review: reviewText,
    })
    .select()
    .single();

  if (data) {
    setReviews((prev) => [data, ...prev]);
    setReviewText("");
  }

  setReviewSubmitting(false);
};

const updateReview = async (reviewId: string) => {
  if (!editedText.trim()) return;

  setEditLoading(true);

  const { error } = await supabase
    .from("product_reviews")
    .update({
      review: editedText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) {
    console.error("Update failed:", error);
    setEditLoading(false);
    return;
  }

  setReviews(prev =>
    prev.map(r =>
      r.id === reviewId
        ? { ...r, review: editedText, updated_at: new Date().toISOString() }
        : r
    )
  );

  setEditingReviewId(null);
  setEditLoading(false);
};



const deleteReview = async () => {
  if (!deleteTargetId) return;

  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", deleteTargetId);

  if (error) {
    console.error("Delete failed:", error);
    return;
  }

  setReviews(prev => prev.filter(r => r.id !== deleteTargetId));
  setDeleteTargetId(null);
};



  /* ================= WISHLIST ================= */

  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleWishlistToggle = () => {
    if (!product) return;

    inWishlist
      ? removeFromWishlist(product.id)
      : addToWishlist({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.offer_price ?? product.price,
          image: product.image_url || "/placeholder.png",
          rating: avgRating,
        });
  };

  /* ================= STATES ================= */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product…
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found or inactive
      </div>
    );

  const finalPrice = product.offer_price ?? product.price;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/products" className="hover:text-primary">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="aspect-square rounded-2xl overflow-hidden bg-card border">
                <img
                  src={product.image_url || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="text-sm text-primary font-medium mb-2">
                {product.category}
              </div>

              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* ⭐ AVG RATING */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${avgRating >= i ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {ratingCount ? `${avgRating} (${ratingCount} ratings)` : "No ratings yet"}
                </span>
              </div>

              {/* ⭐ RATE */}
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(i => (
                  <Star
                    key={i}
                    className={`w-5 h-5 cursor-pointer ${(hoverRating || rating) >= i ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => submitRating(i)}
                  />
                ))}
                {ratingSubmitting && (
                  <span className="text-xs ml-2 text-muted-foreground">Saving…</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold">₹{finalPrice}</span>
                {product.offer_price && (
                  <span className="line-through text-muted-foreground">₹{product.price}</span>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">
                  {product.stock} in stock
                </span>
              </div>

              <p className="text-muted-foreground mb-6">
                {product.description || "No description available."}
              </p>

            {/* Quantity + Cart */}
<div className="flex flex-col sm:flex-row gap-4 mb-8">
  {/* Quantity Selector */}
  <div className="flex items-center border rounded-lg">
    <button
      onClick={() => setQuantity(q => Math.max(1, q - 1))}
      className="p-3"
    >
      <Minus className="w-4 h-4" />
    </button>

    <span className="px-4 font-semibold">{quantity}</span>

    <button
      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
      className="p-3"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>

  {/* Add to Cart */}
  <Button
    className="flex-1"
    onClick={() => {
      if (!product) return;
addToCart({
    id: product.id, // ✅ UUID STRING
    name: product.name,
    price: product.offer_price ?? product.price,
    image: product.image_url || "/placeholder.png",
    stock: product.stock,
    quantity: quantity,
  });


    }}
  >
    <ShoppingCart className="mr-2 w-4 h-4" />
    Add to Cart
  </Button>




                <Button variant="outline" onClick={handleWishlistToggle}>
                  <Heart className={`w-4 h-4 ${inWishlist ? "text-red-500 fill-red-500" : ""}`} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border">
                {product.free_shipping && <Feature icon={Truck} label="Free Shipping" />}
                {product.warranty && <Feature icon={Shield} label="Warranty" />}
                {product.easy_returns && <Feature icon={RotateCcw} label="Easy Returns" />}
              </div>
            </motion.div>
          </div>

          <Tabs defaultValue="specs" className="mt-16">
  <TabsList>
    <TabsTrigger value="specs">Specifications</TabsTrigger>
    <TabsTrigger value="reviews">Reviews</TabsTrigger>
  </TabsList>

  {/* ================= SPECS ================= */}
  <TabsContent value="specs" className="pt-6">
    {product.specifications?.length ? (
      <div className="grid sm:grid-cols-2 gap-4">
        {product.specifications.map((s, i) => (
          <div
            key={i}
            className="flex justify-between p-4 rounded-lg bg-card border"
          >
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground">No specifications available.</p>
    )}
  </TabsContent>

{/* ================= REVIEWS ================= */}
<TabsContent value="reviews" className="pt-6 space-y-6">

  {/* Write Review */}
  <div>
    <textarea
      value={reviewText}
      onChange={(e) => setReviewText(e.target.value)}
      placeholder="Write your review here..."
      className="w-full min-h-[120px] p-4 rounded-xl bg-card border resize-none"
    />

    <Button
      onClick={submitReview}
      disabled={reviewSubmitting || !reviewText.trim()}
      className="mt-4"
    >
      {reviewSubmitting ? "Submitting..." : "Submit Review"}
    </Button>
  </div>

  {/* Reviews List */}
  <div className="space-y-4">
    {reviews.length === 0 ? (
      <p className="text-muted-foreground">No reviews yet.</p>
    ) : (
      reviews.map((r) => {
        const reviewerName = r.reviewer_name || "Anonymous";
        const isOwner = r.user_id === currentUserId;
        const formatDateTime = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });


        return (
          <div key={r.id} className="p-4 rounded-xl bg-card border">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-foreground">
                {reviewerName}
              </span>
              <div className="text-right">
    <div className="text-xs text-muted-foreground">
      {new Date(r.created_at).toLocaleDateString()}
    </div>

    {r.updated_at && r.updated_at !== r.created_at && (
      <div className="text-[11px] text-muted-foreground">
        Edited on · {new Date(r.updated_at).toLocaleString()}
      </div>
    )}
  </div>
              
            </div>

            

            {/* Edit Mode */}
            {editingReviewId === r.id ? (
              <>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-lg bg-card border resize-none mt-2"
                />

                <div className="flex gap-3 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingReviewId(null)}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => updateReview(r.id)}
                    disabled={editLoading || !editedText.trim()}
                  >
                    {editLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Review Text */}
                <p className="text-muted-foreground mt-2">{r.review}</p>

                {/* Actions — OWNER ONLY */}
                {isOwner && (
                  <div className="flex gap-3 text-xs mt-3">
                    <button
                      onClick={() => {
                        setEditingReviewId(r.id);
                        setEditedText(r.review);
                      }}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteTargetId(r.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })
    )}
  </div>

</TabsContent>
</Tabs>




{deleteTargetId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-card border rounded-xl p-6 w-full max-w-sm">
      <h3 className="text-lg font-semibold mb-2">
        Delete review?
      </h3>

      <p className="text-sm text-muted-foreground mb-6">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3">

        
        
        <Button
          variant="outline"
          onClick={() => setDeleteTargetId(null)}
        >
          Cancel
        </Button>

        

        <Button
          variant="destructive"
          onClick={deleteReview}
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
)}


          
        </div>
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Login required</DialogTitle>
      <DialogDescription>
        Please login to continue. You need an account to rate or review products.
      </DialogDescription>
    </DialogHeader>

    <div className="flex justify-end gap-3 mt-4">
      <Button
        variant="outline"
        onClick={() => setShowLoginDialog(false)}
      >
        Cancel
      </Button>

      <Link to="/auth/sign-in">
        <Button>
          Login
        </Button>
      </Link>
    </div>
  </DialogContent>
</Dialog>

      </main>

      <Footer />
    </div>
  );
};

/* ================= FEATURE ================= */

const Feature = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="text-center">
    <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default ProductDetail;
