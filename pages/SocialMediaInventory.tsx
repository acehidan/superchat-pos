import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Share2,
  AlertTriangle,
  Box,
  RefreshCw,
  Search,

  X,
  MessageSquare,
  Bot,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchSocialMediaInventory,
  SocialMediaInventoryItem,
} from "../services/SocialMedia/fetchSocialMediaInventory";
import {
  updateSocialMediaInventoryQuantity,
  UpdateSocialMediaInventoryQuantityPayload,
} from "../services/SocialMedia/updateSocialMediaInventoryQuantity";

export const SocialMediaInventory: React.FC = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState<
    SocialMediaInventoryItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Stock Adjustment Modal State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] =
    useState<SocialMediaInventoryItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase",
  );
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    loadSocialMediaInventory();
  }, []);

  const loadSocialMediaInventory = async () => {
    setLoading(true);
    try {
      const response = await fetchSocialMediaInventory();
      console.log(
        "Social Media Inventory",
        response.socialMediaSaleInventories,
      );
      if (response.success) {
        setInventoryItems(response.data);
      }
    } catch (error) {
      toast.error("Failed to load social media inventory");
    } finally {
      setLoading(false);
    }
  };

  console.log(inventoryItems);

  const totalQuantity = inventoryItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const lowStockCount = inventoryItems.filter((item) => item.isLowStock).length;
  const categories = Array.from(
    new Set(inventoryItems.map((item) => item.inventoryId.category)),
  ).filter(Boolean);

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.inventoryId.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.inventoryId.productCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      item.inventoryId.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stock Adjustment Functions
  const openAdjustmentModal = (
    item: SocialMediaInventoryItem,
    type: "increase" | "decrease",
  ) => {
    setSelectedStockItem(item);
    setAdjustmentType(type);
    setAdjustmentQuantity(0);
    setAdjustmentReason("");
    setIsAdjustmentModalOpen(true);
  };

  const handleSubmitAdjustment = async () => {
    if (!selectedStockItem) return;

    if (adjustmentQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // For decrease, check if quantity is available
    if (
      adjustmentType === "decrease" &&
      adjustmentQuantity > selectedStockItem.quantity
    ) {
      toast.error(
        `Cannot decrease by ${adjustmentQuantity}. Available quantity is ${selectedStockItem.quantity}`,
      );
      return;
    }

    setIsAdjusting(true);
    try {
      const quantityChange =
        adjustmentType === "increase"
          ? adjustmentQuantity
          : -adjustmentQuantity;

      const payload: UpdateSocialMediaInventoryQuantityPayload = {
        quantityChange,
        reason: adjustmentReason.trim() || "",
      };

      const result = await updateSocialMediaInventoryQuantity(
        selectedStockItem.id,
        payload,
      );

      if (result.success) {
        toast.success(
          `Stock ${adjustmentType === "increase" ? "increased" : "decreased"
          } successfully!`,
        );
        setIsAdjustmentModalOpen(false);
        setSelectedStockItem(null);
        setAdjustmentQuantity(0);
        setAdjustmentReason("");
        loadSocialMediaInventory(); // Refresh stock
      } else {
        toast.error(result.message || "Failed to update stock quantity");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock quantity");
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-pink-600" />
            Social Media Inventory
          </h1>
        </div>
        <button
          onClick={loadSocialMediaInventory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Box className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="text-2xl font-bold text-slate-800">
                {filteredItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Share2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-2xl font-bold text-slate-800">
                {totalQuantity}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Low Stock</p>
              <p className="text-2xl font-bold text-slate-800">
                {lowStockCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">AI Ready</p>
              <p className="text-2xl font-bold text-slate-800">
                {inventoryItems.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="font-semibold text-slate-800">
            Social Media Inventory
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No items found</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Product Name
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Product Code
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Category
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
                  Quantity
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  AI Guides
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.inventoryId.productName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                      {item.inventoryId.productCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                      {item.inventoryId.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {item.inventoryId.sellingPrice.toLocaleString()} MMK
                  </td>
                  <td className="px-4 py-3">
                    {item.isLowStock ? (
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                        Low Stock
                      </span>
                    ) : item.quantity === 0 ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Selling
                      </button>
                      <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Buying
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAdjustmentModal(item, "increase")}
                        className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded hover:bg-green-100 border border-green-200 font-medium transition-colors flex items-center gap-1"
                        title="Increase Stock"
                      >
                        <TrendingUp className="w-3 h-3" /> +
                      </button>
                      <button
                        onClick={() => openAdjustmentModal(item, "decrease")}
                        disabled={item.quantity === 0}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 border border-red-200 font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Decrease Stock"
                      >
                        <TrendingDown className="w-3 h-3" /> -
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustmentModalOpen && selectedStockItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {adjustmentType === "increase" ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                {adjustmentType === "increase"
                  ? "Increase Stock"
                  : "Decrease Stock"}
              </h2>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Product Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Product</p>
                <p className="font-bold text-slate-800">
                  {selectedStockItem.inventoryId.productName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedStockItem.inventoryId.productCode} | Current:{" "}
                  {selectedStockItem.quantity}
                </p>
              </div>

              {/* Adjustment Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${adjustmentType === "increase"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="increase"
                      checked={adjustmentType === "increase"}
                      onChange={(e) =>
                        setAdjustmentType(
                          e.target.value as "increase" | "decrease",
                        )
                      }
                      className="sr-only"
                    />
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium">Increase</span>
                  </label>
                  <label
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${adjustmentType === "decrease"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="decrease"
                      checked={adjustmentType === "decrease"}
                      onChange={(e) =>
                        setAdjustmentType(
                          e.target.value as "increase" | "decrease",
                        )
                      }
                      className="sr-only"
                    />
                    <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                    <span className="font-medium">Decrease</span>
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    adjustmentType === "decrease"
                      ? selectedStockItem.quantity
                      : undefined
                  }
                  value={adjustmentQuantity}
                  onChange={(e) =>
                    setAdjustmentQuantity(Number(e.target.value))
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder={`Enter quantity to ${adjustmentType}`}
                />
                {adjustmentType === "decrease" && (
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum: {selectedStockItem.quantity}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  placeholder="Enter reason for stock adjustment..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAdjustment}
                  disabled={isAdjusting || adjustmentQuantity <= 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isAdjusting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      {adjustmentType === "increase" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {adjustmentType === "increase" ? "Increase" : "Decrease"}{" "}
                      Stock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
