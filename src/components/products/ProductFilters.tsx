import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const CATEGORIES = [
  { id: "arduino", label: "Arduino Boards" },
  { id: "sensors", label: "Sensors" },
  { id: "iot", label: "IoT Modules" },
  { id: "kits", label: "Kits & Bundles" },
  { id: "cables", label: "Cables & Wires" },
  { id: "tools", label: "Tools" },
];

const RATINGS = [5, 4, 3, 2, 1];

interface ProductFiltersProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  selectedRating: number | null;
  onRatingChange: (rating: number | null) => void;
}

export const ProductFilters = ({
  selectedCategories, onCategoryChange,
  priceRange, onPriceChange,
  selectedRating, onRatingChange,
}: ProductFiltersProps) => {

  const handleCategoryToggle = (id: string, checked: boolean) => {
    if (checked) onCategoryChange([...selectedCategories, id]);
    else onCategoryChange(selectedCategories.filter((c) => c !== id));
  };

  const clearFilters = () => {
    onCategoryChange([]);
    onPriceChange([0, 10000]);
    onRatingChange(null);
  };

  return (
    <div className="space-y-8">

      {/* CATEGORIES */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Categories</h3>
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
              />
              <Label htmlFor={category.id} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* PRICE RANGE */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
        <div className="px-2">
          <Slider value={priceRange} onValueChange={(v) => onPriceChange(v as [number, number])} max={10000} step={100} className="mb-4" />
          <div className="flex items-center justify-between text-sm">
            <span className="px-3 py-1 rounded-lg bg-muted font-medium">₹{priceRange[0]}</span>
            <span className="text-muted-foreground">to</span>
            <span className="px-3 py-1 rounded-lg bg-muted font-medium">₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* RATING */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Rating</h3>
        <div className="space-y-2">
          {RATINGS.map((rating) => (
            <button key={rating} onClick={() => onRatingChange(selectedRating === rating ? null : rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                selectedRating === rating ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
              }`}>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* CLEAR */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );
};