import { useProfile } from "@/hooks/useProfile";
import { useAuthContext } from "@/context/AuthProvider";
import { Loader2, User, X, ShoppingBag, Package, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

/* Country codes */
const COUNTRY_CODES = [
  { code: "+91", label: "India" },
  { code: "+1", label: "USA" },
  { code: "+44", label: "UK" },
  { code: "+61", label: "Australia" },
];

/* Preset avatars */
const PRESET_AVATARS = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
  "/avatars/avatar-7.png",
  "/avatars/avatar-8.png",
];

const STATUS_STEPS = ["placed", "packed", "shipped", "delivered"];

const STATUS_ICONS: Record<string, any> = {
  placed: ShoppingBag,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

/* ================= ORDER TIMELINE ================= */
const OrderTimeline = ({ status }: { status: string }) => {
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-2 mt-3">
      {STATUS_STEPS.map((step, index) => {
        const Icon = STATUS_ICONS[step];
        const active = index <= currentIndex;

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center
                ${active ? "bg-[#813FF1]" : "bg-gray-200 dark:bg-gray-600"}`}
            >
              <Icon className="w-3 h-3 text-white" />
            </div>
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={`w-6 h-[2px] ${
                  index < currentIndex ? "bg-[#813FF1]" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
const Profile = () => {
  const { profile, loading, refreshProfile } = useProfile();
  const { user } = useAuthContext();

  /* ---------------- STATES ---------------- */
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const [showAvatars, setShowAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showOrders, setShowOrders] = useState(false);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setPhone(profile.phone ?? "");
    setCountryCode(profile.country_code ?? "+91");
    setAddress1(profile.address_line1 ?? "");
    setAddress2(profile.address_line2 ?? "");
    setCity(profile.city ?? "");
    setState(profile.state ?? "");
    setPostalCode(profile.postal_code ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);

  /* ---------------- FUNCTIONS ---------------- */
  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, amount, fulfillment_status, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setOrdersLoading(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("Full name is required");
    if (!phone || phone.length < 6) return toast.error("Valid phone number required");
    if (!address1 || !city || !state || !postalCode)
      return toast.error("Complete address required");

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim(),
        country_code: countryCode,
        address_line1: address1.trim(),
        address_line2: address2.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        phone_completed: true,
        address_completed: true,
      })
      .eq("id", user!.id);

    setSaving(false);
    if (error) return toast.error("Failed to update profile");

    toast.success("Profile updated");
    refreshProfile();
    setIsEditing(false);
  };

  const applyAvatar = async () => {
    await supabase
      .from("profiles")
      .update({
        avatar_url: selectedAvatar,
        avatar_source: selectedAvatar ? "preset" : "oauth",
      })
      .eq("id", user!.id);

    toast.success("Avatar updated");
    setShowAvatars(false);
    setSelectedAvatar(null);
    refreshProfile();
  };

  const confirmVerifyPhone = async () => {
    setVerifyingPhone(true);
    await supabase.from("profiles").update({ phone_verified: true }).eq("id", user!.id);
    setVerifyingPhone(false);
    toast.success("Phone verified");
    refreshProfile();
  };

  const confirmChangePhone = async () => {
    await supabase
      .from("profiles")
      .update({ phone_verified: false, phone_completed: false })
      .eq("id", user!.id);
    toast.info("Phone unlocked. Please re-verify.");
    refreshProfile();
    setIsEditing(true);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed": return "bg-yellow-100 text-yellow-700";
      case "packed": return "bg-blue-100 text-blue-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "delivered": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  /* ---------------- SAFE RETURNS ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">You must be logged in</p>
        <Link to="/auth/sign-in">
          <Button variant="hero">Sign In</Button>
        </Link>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-3xl space-y-6">

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">

        {/* Header row: title + action buttons */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="flex items-center gap-2">
            {/* Order History button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOrders((prev) => !prev)}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {showOrders ? "Hide Orders" : "Order History"}
              {orders.length > 0 && (
                <span className="ml-2 bg-[#813FF1] text-white text-xs rounded-full px-1.5 py-0.5">
                  {orders.length}
                </span>
              )}
            </Button>

            {/* Edit / Save / Cancel */}
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <div>
            <p className="text-xl font-semibold">{profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowAvatars(true)}>
              Change Avatar
            </Button>
          </div>
        </div>

        {/* Avatar Picker */}
        {showAvatars && (
          <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
            <p className="text-sm text-muted-foreground">Choose an avatar</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              <button
                onClick={() => setSelectedAvatar(null)}
                className={`w-14 h-14 rounded-full border flex items-center justify-center text-xs ${
                  selectedAvatar === null ? "ring-2 ring-primary" : ""
                }`}
              >
                None
              </button>
              {PRESET_AVATARS.map((url) => (
                <div key={url} className="relative">
                  <button
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-14 h-14 rounded-full overflow-hidden border ${
                      selectedAvatar === url ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <img src={url} className="w-full h-full object-cover" />
                  </button>
                  <button
                    onClick={() => setPreviewAvatar(url)}
                    className="absolute -bottom-1 -right-1 bg-background border rounded-full px-1 text-xs"
                  >
                    👁
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowAvatars(false)}>Cancel</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Apply Avatar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apply this avatar?</AlertDialogTitle>
                    <AlertDialogDescription>You can change it anytime later.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={applyAvatar}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Fullscreen preview */}
        {previewAvatar && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <button className="absolute top-6 right-6 text-white" onClick={() => setPreviewAvatar(null)}>
              <X className="w-6 h-6" />
            </button>
            <img src={previewAvatar} className="max-w-[80vw] max-h-[80vh] rounded-full" />
          </div>
        )}

        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name *" value={profile?.full_name} isEditing={isEditing}>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>

          <Field label="Country Code *" value={profile?.country_code} isEditing={isEditing && !profile?.phone_verified}>
            <select
              disabled={profile?.phone_verified}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-lg bg-muted/40 border px-3 py-2"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
              ))}
            </select>
          </Field>

          <Field label="Phone *" value={profile?.phone} isEditing={isEditing && !profile?.phone_verified}>
            <Input
              disabled={profile?.phone_verified}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
        </div>

        {/* Phone actions */}
        {profile?.phone_completed && (
          <div className="flex items-center gap-3">
            {profile.phone_verified ? (
              <>
                <span className="text-sm text-green-500">✅ Phone verified</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive">Change phone</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Change phone number?</AlertDialogTitle>
                      <AlertDialogDescription>You must re-verify before checkout.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-white" onClick={confirmChangePhone}>
                        Change Phone
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">Verify Phone</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Verify phone number?</AlertDialogTitle>
                    <AlertDialogDescription>This will lock the phone number.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmVerifyPhone}>Confirm Verification</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Address Line 1 *" value={profile?.address_line1} isEditing={isEditing}>
            <Input value={address1} onChange={(e) => setAddress1(e.target.value)} />
          </Field>
          <Field label="Address Line 2" value={profile?.address_line2} isEditing={isEditing}>
            <Input value={address2} onChange={(e) => setAddress2(e.target.value)} />
          </Field>
          <Field label="City *" value={profile?.city} isEditing={isEditing}>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="State *" value={profile?.state} isEditing={isEditing}>
            <Input value={state} onChange={(e) => setState(e.target.value)} />
          </Field>
          <Field label="Postal Code *" value={profile?.postal_code} isEditing={isEditing}>
            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </Field>
        </div>
      </div>

      {/* ================= ORDER HISTORY (separate card, toggled) ================= */}
      {showOrders && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Order History</h2>

          {ordersLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border rounded-xl p-4 bg-muted/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* LEFT — order info */}
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm">Placed on {formatDate(order.created_at)}</p>
                      <p className="font-semibold mt-1">₹{order.amount}</p>

                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.fulfillment_status
                        )}`}
                      >
                        {order.fulfillment_status?.toUpperCase()}
                      </span>

                      <OrderTimeline status={order.fulfillment_status} />
                    </div>

                    {/* RIGHT — invoice button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="self-start sm:self-center shrink-0"
                      onClick={() =>
                        window.open(
                          `http://localhost:4000/download-invoice/${order.id}`,
                          "_blank"
                        )
                      }
                    >
                      Download Invoice
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* Reusable field */
const Field = ({ label, value, isEditing, children }: any) => (
  <div>
    <label className="text-sm text-muted-foreground">{label}</label>
    {isEditing ? (
      <div className="mt-1">{children}</div>
    ) : (
      <div className="mt-1 p-3 bg-muted/40 rounded-lg">{value || "—"}</div>
    )}
  </div>
);

export default Profile;