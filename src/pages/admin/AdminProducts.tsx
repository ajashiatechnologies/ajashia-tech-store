import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Power,
  Upload,
  PlusCircle,
  X,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* ================= TYPES ================= */

type Spec = {
  label: string;
  value: string;
};

type Product = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  offer_price: number | null;
  stock: number;
  image_url: string | null;
  hsn_sac: string | null;
  free_shipping: boolean;
  warranty: boolean;
  easy_returns: boolean;
  is_active: boolean;
  is_featured: boolean;
  description: string | null;
  specifications: Spec[] | null;
};

const inputClass = "bg-white text-black placeholder:text-gray-400";

const generateSlug = (name: string) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

/* ================= COMPONENT ================= */

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [hsnSac, setHsnSac] = useState("");

  /* FORM STATE */
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [specs, setSpecs] = useState<Spec[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* CHECKBOX STATES */
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [warranty, setWarranty] = useState(false);
  const [easyReturns, setEasyReturns] = useState(false);

  const [saving, setSaving] = useState(false);

  /* MODALS */
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, category, price, offer_price, stock,
        image_url, hsn_sac, free_shipping, warranty,
        easy_returns, is_active, is_featured, description, specifications
      `)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load products");
    else setProducts(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= IMAGE UPLOAD ================= */

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      toast.error("Image upload failed");
      return null;
    }

    return supabase.storage
      .from("product-images")
      .getPublicUrl(fileName).data.publicUrl;
  };

  /* ================= ADD ================= */

  const addProduct = async () => {
    if (!name || !price || !stock) {
      toast.error("Name, price & stock required");
      return;
    }

    setSaving(true);
    const imageUrl = imageFile ? await uploadImage(imageFile) : null;

    const { error } = await supabase.from("products").insert({
      name,
      slug: generateSlug(name),
      category,
      price: Number(price),
      offer_price: offerPrice ? Number(offerPrice) : null,
      stock: Number(stock),
      image_url: imageUrl,
      hsn_sac: hsnSac || null,
      description,
      specifications: specs,
      is_active: isActive,
      is_featured: isFeatured,
      free_shipping: freeShipping,
      warranty,
      easy_returns: easyReturns,
    });

    setSaving(false);

    if (error) return toast.error(error.message);

    toast.success("Product added");
    resetForm();
    fetchProducts();
  };

  /* ================= EDIT ================= */

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category || "");
    setPrice(String(p.price));
    setOfferPrice(p.offer_price ? String(p.offer_price) : "");
    setHsnSac(p.hsn_sac || "");
    setStock(String(p.stock));
    setDescription(p.description || "");
    setSpecs(p.specifications || []);
    setImagePreview(p.image_url);
    setIsActive(p.is_active);
    setIsFeatured(p.is_featured);
    setFreeShipping(p.free_shipping);
    setWarranty(p.warranty);
    setEasyReturns(p.easy_returns);
    setEditOpen(true);
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    setSaving(true);
    let imageUrl = editingProduct.image_url;
    if (imageFile) imageUrl = await uploadImage(imageFile);

    const { error } = await supabase
      .from("products")
      .update({
        name,
        category,
        price: Number(price),
        offer_price: offerPrice ? Number(offerPrice) : null,
        stock: Number(stock),
        image_url: imageUrl,
        hsn_sac: hsnSac || null,
        description,
        specifications: specs,
        is_active: isActive,
        is_featured: isFeatured,
        free_shipping: freeShipping,
        warranty,
        easy_returns: easyReturns,
      })
      .eq("id", editingProduct.id);

    setSaving(false);

    if (error) return toast.error(error.message);

    toast.success("Product updated");
    setEditOpen(false);
    resetForm();
    fetchProducts();
  };

  /* ================= TOGGLE FEATURED (quick action) ================= */

  const toggleFeatured = async (p: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_featured: !p.is_featured })
      .eq("id", p.id);

    if (error) return toast.error("Failed to update");

    toast.success(p.is_featured ? "Removed from featured" : "Added to featured");
    fetchProducts();
  };

  /* ================= TOGGLE ACTIVE ================= */

  const toggleActive = async (p: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);

    if (error) return toast.error("Failed to update status");

    toast.success(p.is_active ? "Product deactivated" : "Product activated");
    fetchProducts();
  };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from("products").delete().eq("id", deleteId);
    toast.success("Product deleted");
    setDeleteId(null);
    fetchProducts();
  };

  /* ================= RESET ================= */

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setOfferPrice("");
    setStock("");
    setDescription("");
    setSpecs([]);
    setImageFile(null);
    setImagePreview(null);
    setHsnSac("");
    setIsActive(true);
    setIsFeatured(false);
    setFreeShipping(false);
    setWarranty(false);
    setEasyReturns(false);
    setEditingProduct(null);
  };

  /* ================= FORM ================= */

  const renderForm = (onSubmit: () => void) => (
    <>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <Input className={inputClass} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input className={inputClass} placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input className={inputClass} type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input className={inputClass} type="number" placeholder="Offer price" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
        <Input className={inputClass} placeholder="HSN / SAC Code (optional)" value={hsnSac} onChange={(e) => setHsnSac(e.target.value)} />
        <Input className={inputClass} type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} />

        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm bg-white text-black"
          placeholder="Product description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* CHECKBOXES */}
        <div className="space-y-2 text-sm">
          <label className="flex gap-2 items-center">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <label className="flex gap-2 items-center cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            Show in Featured Collection (Landing Page)
          </label>
          <label className="flex gap-2 items-center">
            <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} />
            Free Shipping
          </label>
          <label className="flex gap-2 items-center">
            <input type="checkbox" checked={warranty} onChange={(e) => setWarranty(e.target.checked)} />
            Warranty
          </label>
          <label className="flex gap-2 items-center">
            <input type="checkbox" checked={easyReturns} onChange={(e) => setEasyReturns(e.target.checked)} />
            Easy Returns
          </label>
        </div>

        {/* SPECIFICATIONS */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Specifications</div>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <Input className={inputClass} placeholder="Label" value={spec.label} onChange={(e) => {
                const copy = [...specs];
                copy[i].label = e.target.value;
                setSpecs(copy);
              }} />
              <Input className={inputClass} placeholder="Value" value={spec.value} onChange={(e) => {
                const copy = [...specs];
                copy[i].value = e.target.value;
                setSpecs(copy);
              }} />
              <Button size="icon" variant="ghost" onClick={() => setSpecs(specs.filter((_, x) => x !== i))}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setSpecs([...specs, { label: "", value: "" }])}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Specification
          </Button>
        </div>

        {/* IMAGE */}
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer bg-zinc-50">
          <Upload className="w-6 h-6 mb-2 text-zinc-400" />
          <span className="text-sm text-zinc-500">Click to upload image</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }
          }} />
        </label>

        {imagePreview && (
          <img src={imagePreview} className="w-28 h-28 mx-auto rounded-lg object-cover" />
        )}
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Products</h1>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
            <AlertDialogHeader><AlertDialogTitle>Add Product</AlertDialogTitle></AlertDialogHeader>
            {renderForm(addProduct)}
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto text-white" />
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900">
          <table className="w-full text-sm text-zinc-100">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Features</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-zinc-800">
                  <td className="p-4">{p.image_url && <img src={p.image_url} className="w-12 h-12 rounded" />}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {p.name}
                      {p.is_featured && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" aria-label="Featured" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">
                    {p.offer_price ? (
                      <>
                        <span className="line-through mr-2 text-zinc-400">₹{p.price}</span>
                        <span className="text-green-400">₹{p.offer_price}</span>
                      </>
                    ) : <>₹{p.price}</>}
                  </td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4 space-x-2">
                    {p.free_shipping && badge("Free Shipping")}
                    {p.warranty && badge("Warranty")}
                    {p.easy_returns && badge("Easy Returns")}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* Featured toggle */}
                    <Button
                      size="icon"
                      aria-label={p.is_featured ? "Remove from featured" : "Add to featured"}
                      className={p.is_featured ? "bg-yellow-400 hover:bg-yellow-300" : "bg-white hover:bg-zinc-100"}
                      onClick={() => toggleFeatured(p)}
                    >
                      <Star className={`w-4 h-4 ${p.is_featured ? "text-white fill-white" : "text-zinc-500"}`} />
                    </Button>
                    <Button size="icon" className="bg-white hover:bg-zinc-100" onClick={() => openEdit(p)}>
                      <Pencil className="w-4 h-4 text-black" />
                    </Button>
                    <Button size="icon" className="bg-white hover:bg-zinc-100" onClick={() => toggleActive(p)}>
                      <Power className={`w-4 h-4 ${p.is_active ? "text-green-600" : "text-red-600"}`} />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => setDeleteId(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <AlertDialogHeader><AlertDialogTitle>Edit Product</AlertDialogTitle></AlertDialogHeader>
          {renderForm(updateProduct)}
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete product?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white" onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ================= BADGE ================= */

const badge = (text: string) => (
  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
    {text}
  </span>
);

export default AdminProducts;