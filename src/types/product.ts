export type ProductSpecification = {
  key: string;        // e.g. "Microcontroller"
  value: string;      // e.g. "ATmega328P"
};

export type Product = {
  id: string;

  /* Basic info */
  name: string;
  slug: string;
  description: string | null;
  category: string;

  /* Pricing */
  price: number;
  offer_price: number | null;

  /* Inventory */
  stock: number;
  is_active: boolean;

  /* Shipping & policies */
  free_shipping: boolean;
  warranty: boolean;
  easy_returns: boolean;

  /* Media */
  images: string[];          // multiple images
  thumbnail?: string | null; // optional derived thumbnail

  /* Dynamic specifications */
  specifications: ProductSpecification[];

  /* Meta */
  created_at: string;
  updated_at: string;
};

/**
 * Payload used ONLY by admin while creating/updating a product
 * (id, slug, timestamps are generated automatically)
 */
export type AdminProductPayload = {
  name: string;
  description?: string;
  category: string;

  price: number;
  offer_price?: number;

  stock: number;

  free_shipping: boolean;
  warranty: boolean;
  easy_returns: boolean;

  images: string[];
  specifications: ProductSpecification[];
};
