import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Product } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

// const UNIT_OF_MEASURE_OPTIONS = [
//   "piece",
//   "kg",
//   "gram",
//   "liter",
//   "ml",
//   "meter",
//   "cm",
//   "box",
//   "pack",
//   "carton",
//   "dozen",
//   "pair",
// ];

export interface ProductFormData {
  productName: string;
  productCode: string;
  saleCode: string;
  SKU: string;
  barcode?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  unitOfMeasure: string;
  reorderPoint: number;
  reorderQuantity: number;
  taxRate: number;
  status: "active" | "inactive";
  tags?: string[];
  images?: File[];
}

export interface ApiProduct {
  id: string;
  productName: string;
  productCode: string;
  saleCode: string;
  SKU?: string;
  barcode?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  unitOfMeasure: string;
  reorderPoint: number;
  reorderQuantity: number;
  taxRate: number;
  status: "active" | "inactive";
  tags?: string[];
  images?: ProductImage[];
  profitMargin: number;
  profitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  _id: string;
  spaceKey: string;
  url: string;
  primary: boolean;
  order: number;
}

interface ProductModalProps {
  isOpen: boolean;
  editingId: string | null;
  formData: ProductFormData;
  error: string | null;
  isLoading: boolean;
  products: Product[];
  apiProducts: ApiProduct[];
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (data: ProductFormData) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  editingId,
  formData,
  error,
  isLoading,
  products,
  apiProducts,
  onClose,
  onSave,
  onFormDataChange,
}) => {
  const { t } = useLanguage();

  // Combobox states for category and subCategory
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryShowDropdown, setCategoryShowDropdown] = useState(false);

  // Image upload state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file): file is File =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length > 0) {
      // Create preview URLs
      const previews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);

      // Update form data with files
      onFormDataChange({
        ...formData,
        images: [...(formData.images || []), ...validFiles],
      });
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = formData.images?.filter((_, i) => i !== index) || [];
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke object URL to prevent memory leaks
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    setImagePreviews(newPreviews);
    onFormDataChange({ ...formData, images: newImages });
  };

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);
  // const [subCategoryInput, setSubCategoryInput] = useState("");
  // const [subCategoryShowDropdown, setSubCategoryShowDropdown] = useState(false);

  // Get unique categories from products
  const getUniqueCategories = (): string[] => {
    const categories = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        categories.add(p.category);
      }
    });
    return Array.from(categories).sort();
  };

  // Get unique subcategories from API products
  // const getUniqueSubCategories = (): string[] => {
  //   const subCategories = new Set<string>();
  //   apiProducts.forEach((p) => {
  //     if (p.subCategory && p.subCategory.trim()) {
  //       subCategories.add(p.subCategory);
  //     }
  //   });
  //   return Array.from(subCategories).sort();
  // };

  // Filter categories/subcategories based on input
  const getFilteredCategories = (input: string): string[] => {
    const allCategories = getUniqueCategories();
    if (!input.trim()) return allCategories;
    return allCategories.filter((cat) =>
      cat.toLowerCase().includes(input.toLowerCase()),
    );
  };

  // const getFilteredSubCategories = (input: string): string[] => {
  //   const allSubCategories = getUniqueSubCategories();
  //   if (!input.trim()) return allSubCategories;
  //   return allSubCategories.filter((subCat) =>
  //     subCat.toLowerCase().includes(input.toLowerCase())
  //   );
  // };

  const updateFormData = (updates: Partial<ProductFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editingId
            ? t("inventory.editProduct")
            : t("inventory.addNewProduct")}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Required Fields */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.productName")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded p-2"
              value={formData.productName}
              onChange={(e) => {
                const productName = e.target.value;
                updateFormData({ productName, productCode: productName });
              }}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.barcode")}
            </label>
            <input
              className="w-full border rounded p-2"
              value={formData.barcode || ""}
              onChange={(e) => updateFormData({ barcode: e.target.value })}
              placeholder={t("inventory.barcode") || "Enter barcode"}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.productCode")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded p-2"
              value={formData.productCode}
              onChange={(e) => updateFormData({ productCode: e.target.value })}
            />
          </div>

          {/* <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.sku")}
            </label>
            <input
              className="w-full border rounded p-2"
              value={formData.SKU}
              onChange={(e) => updateFormData({ SKU: e.target.value })}
            />
          </div> */}

          <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.category")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full border rounded p-2 pr-8"
                value={categoryInput || formData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryInput(value);
                  updateFormData({ category: value });
                  setCategoryShowDropdown(true);
                }}
                onFocus={() => setCategoryShowDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setCategoryShowDropdown(false), 200);
                }}
                placeholder={t("inventory.categoryPlaceholder")}
              />
              {categoryShowDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getFilteredCategories(
                    categoryInput || formData.category,
                  ).map((category) => (
                    <div
                      key={category}
                      className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        updateFormData({ category });
                        setCategoryInput("");
                        setCategoryShowDropdown(false);
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.subCategory")}
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full border rounded p-2 pr-8"
                value={subCategoryInput || formData.subCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  setSubCategoryInput(value);
                  updateFormData({ subCategory: value });
                  setSubCategoryShowDropdown(true);
                }}
                onFocus={() => setSubCategoryShowDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setSubCategoryShowDropdown(false), 200);
                }}
                placeholder={t("inventory.subCategoryPlaceholder")}
              />
              {subCategoryShowDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getFilteredSubCategories(
                    subCategoryInput || formData.subCategory
                  ).map((subCategory) => (
                    <div
                      key={subCategory}
                      className="px-4 py-2 hover:bg-primary/10 cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        updateFormData({ subCategory });
                        setSubCategoryInput("");
                        setSubCategoryShowDropdown(false);
                      }}
                    >
                      {subCategory}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.brand")}
            </label>
            <input
              className="w-full border rounded p-2"
              value={formData.brand}
              onChange={(e) => updateFormData({ brand: e.target.value })}
            />
          </div>

          {/* <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.unitOfMeasure")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded p-2"
              value={formData.unitOfMeasure}
              onChange={(e) =>
                updateFormData({ unitOfMeasure: e.target.value })
              }
            >
              {UNIT_OF_MEASURE_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div> */}

          {/* <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500">
              {t("common.description")}
            </label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div> */}

          <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.buyingPrice")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border rounded p-2"
              value={formData.buyingPrice}
              onChange={(e) =>
                updateFormData({ buyingPrice: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500">
              {t("inventory.sellingPrice")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border rounded p-2"
              value={formData.sellingPrice}
              onChange={(e) => {
                const sellingPrice = Number(e.target.value);
                const buyingPrice = sellingPrice > 0 ? sellingPrice * 0.9 : 0;
                updateFormData({ sellingPrice, buyingPrice });
              }}
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 mb-2">
            Product Images
          </label>

          {/* Image Upload Input */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Images
            </label>
            <p className="text-xs text-slate-500 mt-2">
              Upload multiple product images (JPG, PNG, etc.)
            </p>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {index === 0 ? "Primary" : `Image ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-btn-primary text-dark rounded hover:bg-btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("inventory.saving") : t("inventory.save")}
          </button>
        </div>
      </div>
    </div>
  );
};
