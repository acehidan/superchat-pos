import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  AlertTriangle,
  Box,
  RefreshCw,
  Package,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Search,
  Filter,
  ArrowRightLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchStorefrontStock,
  StorefrontStockItem,
} from "../services/Storefront/fetchStorefrontStock";
import {
  updateStorefrontStockQuantity,
  UpdateStorefrontStockQuantityPayload,
} from "../services/Storefront/updateStorefrontStockQuantity";
import { fetchWarehouseProfiles } from "../services/Warehouse/fetchWarehouseProfiles";
import {
  fetchStorefrontProfiles,
  StorefrontProfile,
} from "../services/Storefront/fetchStorefrontProfiles";
import {
  createWarehouseTransfer,
  TransferLineItem,
} from "../services/Warehouse/createWarehouseTransfer";
import { WarehouseProfile } from "../types";

interface TransferFormItem {
  productCode: string;
  productName: string;
  quantity: number;
  maxQuantity: number;
  notes: string;
}

export const StorefrontDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role from localStorage (set during login)
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const userRole = adminData.role;

  // Get storefront info from location state if available
  const storefrontInfo = location.state as {
    storefrontName?: string;
    storefrontCode?: string;
  } | null;

  const [stockItems, setStockItems] = useState<StorefrontStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [storefrontName, setStorefrontName] = useState(
    storefrontInfo?.storefrontName || "Storefront",
  );
  const [storefrontCode, setStorefrontCode] = useState(
    storefrontInfo?.storefrontCode || "",
  );

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [storefronts, setStorefronts] = useState<StorefrontProfile[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseProfile[]>([]);
  const [transferType, setTransferType] = useState<"Warehouse" | "Storefront">(
    "Warehouse",
  );
  const [selectedStorefrontId, setSelectedStorefrontId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [transferItems, setTransferItems] = useState<TransferFormItem[]>([]);
  const [transferNotes, setTransferNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStorefrontStock();
    loadWarehouses();
    loadStorefronts();
  }, [id]);

  const loadStorefrontStock = async () => {
    if (!id) {
      toast.error("Storefront ID is missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchStorefrontStock(id);
      // console.log(response);
      if (response.success && response.data) {
        setStockItems(response.data);

        // Update storefront info from first item if not provided via state
        if (response.data.length > 0 && !storefrontInfo) {
          const firstItem = response.data[0];
          setStorefrontName(
            firstItem.storefrontId.locationName ||
              firstItem.storefrontId.storefrontName ||
              "Storefront",
          );
          setStorefrontCode(
            firstItem.storefrontId.locationCode ||
              firstItem.storefrontId.storefrontCode ||
              "",
          );
        }
      } else {
        toast.error(response.message || "Failed to load storefront stock");
      }
    } catch (error) {
      console.error("Error loading storefront stock:", error);
      toast.error("Failed to load storefront stock");
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await fetchWarehouseProfiles();
      if (response.success) {
        setWarehouses(response.data);
      }
    } catch (error) {
      console.error("Error loading warehouses:", error);
    }
  };

  const loadStorefronts = async () => {
    try {
      const response = await fetchStorefrontProfiles();
      if (response.success) {
        setStorefronts(response.data);
      }
    } catch (error) {
      console.error("Error loading storefronts:", error);
    }
  };

  const totalQuantity = stockItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const lowStockCount = stockItems.filter((item) => item.isLowStock).length;

  // Get unique categories from stock items
  const categories = Array.from(
    new Set(stockItems.map((item) => item.inventoryId.category)),
  ).filter(Boolean);

  // Filter stock items based on search term and category
  const filteredStockItems = stockItems.filter((item) => {
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

  // Calculate totals based on filtered items
  const filteredTotalQuantity = filteredStockItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const filteredLowStockCount = filteredStockItems.filter(
    (item) => item.isLowStock,
  ).length;

  // Calculate total amount for each item and storefront total
  const totalStorefrontAmount = stockItems.reduce((sum, item) => {
    const sellingPrice = item.inventoryId.sellingPrice || 0;
    const itemTotal = item.quantity * sellingPrice;
    return sum + itemTotal;
  }, 0);

  // Stock Adjustment Modal State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] =
    useState<StorefrontStockItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase",
  );
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Stock Adjustment Functions
  const openAdjustmentModal = (
    item: StorefrontStockItem,
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

      const payload: UpdateStorefrontStockQuantityPayload = {
        quantityChange,
        reason: adjustmentReason.trim() || "",
      };

      const result = await updateStorefrontStockQuantity(
        selectedStockItem.id,
        payload,
      );

      if (result.success) {
        toast.success(
          `Stock ${
            adjustmentType === "increase" ? "increased" : "decreased"
          } successfully!`,
        );
        setIsAdjustmentModalOpen(false);
        setSelectedStockItem(null);
        setAdjustmentQuantity(0);
        setAdjustmentReason("");
        loadStorefrontStock(); // Refresh stock
      } else {
        toast.error(result.message || "Failed to update stock quantity");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock quantity");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Transfer Modal Functions
  const openTransferModal = (item?: StorefrontStockItem) => {
    if (item) {
      // Pre-populate with clicked item
      setTransferItems([
        {
          productCode: item.inventoryId.productCode,
          productName: item.inventoryId.productName,
          quantity: 1,
          maxQuantity: item.quantity,
          notes: "",
        },
      ]);
    } else {
      setTransferItems([]);
    }
    setSelectedStorefrontId("");
    setSelectedWarehouseId("");
    setTransferType("Warehouse");
    setTransferNotes("");
    setIsTransferModalOpen(true);
  };

  const addTransferItem = () => {
    // Get available products (not already in transfer list)
    const usedCodes = transferItems.map((i) => i.productCode);
    const availableProducts = stockItems.filter(
      (item) =>
        !usedCodes.includes(item.inventoryId.productCode) && item.quantity > 0,
    );

    if (availableProducts.length === 0) {
      toast.error("No more products available to add");
      return;
    }

    const firstAvailable = availableProducts[0];
    setTransferItems([
      ...transferItems,
      {
        productCode: firstAvailable.inventoryId.productCode,
        productName: firstAvailable.inventoryId.productName,
        quantity: 1,
        maxQuantity: firstAvailable.quantity,
        notes: "",
      },
    ]);
  };

  const removeTransferItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const updateTransferItem = (
    index: number,
    field: keyof TransferFormItem,
    value: string | number,
  ) => {
    const updated = [...transferItems];

    if (field === "productCode") {
      // Find the stock item for this product code
      const stockItem = stockItems.find(
        (item) => item.inventoryId.productCode === value,
      );
      if (stockItem) {
        updated[index] = {
          ...updated[index],
          productCode: value as string,
          productName: stockItem.inventoryId.productName,
          maxQuantity: stockItem.quantity,
          quantity: Math.min(updated[index].quantity, stockItem.quantity),
        };
      }
    } else if (field === "quantity") {
      const qty = Math.max(
        1,
        Math.min(Number(value), updated[index].maxQuantity),
      );
      updated[index] = { ...updated[index], quantity: qty };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setTransferItems(updated);
  };

  const handleSubmitTransfer = async () => {
    const destinationId =
      transferType === "Warehouse" ? selectedWarehouseId : selectedStorefrontId;

    if (!destinationId) {
      toast.error(`Please select a destination ${transferType.toLowerCase()}`);
      return;
    }

    if (transferItems.length === 0) {
      toast.error("Please add at least one product to transfer");
      return;
    }

    // Validate quantities
    for (const item of transferItems) {
      if (item.quantity <= 0) {
        toast.error(`Quantity for ${item.productName} must be greater than 0`);
        return;
      }
      if (item.quantity > item.maxQuantity) {
        toast.error(
          `Quantity for ${item.productName} exceeds available stock (${item.maxQuantity})`,
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const lineItems: TransferLineItem[] = transferItems.map((item) => ({
        productCode: item.productCode,
        quantity: item.quantity,
        ...(item.notes && { notes: item.notes }),
      }));

      const result = await createWarehouseTransfer({
        sourceType: "Storefront",
        sourceId: id!,
        destinationType: transferType,
        destinationId,
        lineItems,
        notes: transferNotes,
      });

      if (result.success) {
        toast.success("Transfer created successfully!");
        setIsTransferModalOpen(false);
        loadStorefrontStock(); // Refresh stock
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available products for dropdown (not already selected)
  const getAvailableProductsForItem = (currentCode: string) => {
    const usedCodes = transferItems
      .map((i) => i.productCode)
      .filter((code) => code !== currentCode);
    return stockItems.filter(
      (item) =>
        !usedCodes.includes(item.inventoryId.productCode) && item.quantity > 0,
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/storefront")}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            {storefrontName}
            {storefrontCode && (
              <span className="text-sm px-2 py-1 bg-primary/20 text-primary-700 rounded-full font-medium">
                {storefrontCode}
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Storefront Stock Inventory
          </p>
        </div>
        {userRole === "owner" && (
          <button
            onClick={() => openTransferModal()}
            disabled={stockItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-btn-primary hover:bg-btn-primary-hover text-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer Stock
          </button>
        )}
        <button
          onClick={loadStorefrontStock}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by product name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Results Summary */}
        {(searchTerm || selectedCategory !== "all") && (
          <div className="mt-3 text-sm text-slate-500">
            Showing {filteredStockItems.length} of {stockItems.length} items
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Box className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Products</p>
              <p className="text-2xl font-bold text-slate-800">
                {searchTerm || selectedCategory !== "all"
                  ? filteredStockItems.length
                  : stockItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-2xl font-bold text-slate-800">
                {searchTerm || selectedCategory !== "all"
                  ? filteredTotalQuantity
                  : totalQuantity}
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
              <p className="text-sm text-slate-500">Low Stock Items</p>
              <p className="text-2xl font-bold text-slate-800">
                {searchTerm || selectedCategory !== "all"
                  ? filteredLowStockCount
                  : lowStockCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Store className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="text-2xl font-bold text-indigo-600">
                {searchTerm || selectedCategory !== "all"
                  ? filteredStockItems
                      .reduce((sum, item) => {
                        const sellingPrice = item.inventoryId.sellingPrice || 0;
                        const itemTotal = item.quantity * sellingPrice;
                        return sum + itemTotal;
                      }, 0)
                      .toLocaleString()
                  : totalStorefrontAmount.toLocaleString()}{" "}
                MMK
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="font-semibold text-slate-800">Stock Items</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading stock items...
          </div>
        ) : filteredStockItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchTerm || selectedCategory !== "all" ? (
              <div>
                <p className="font-medium mb-2">
                  No items found matching your filters
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="text-primary hover:text-primary-700 underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              "No stock items found in this storefront."
            )}
          </div>
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
                {/* <th className="px-4 py-3 font-medium text-slate-600">SKU</th> */}
                <th className="px-4 py-3 font-medium text-slate-600">
                  Category
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
                  Quantity
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
                  Available
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
                  Total Amount
                </th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">
                  Last Updated
                </th>
                {userRole === "owner" && (
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.inventoryId.productName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                      {item.inventoryId.productCode}
                    </span>
                  </td>
                  {/* <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {item.inventoryId.SKU}
                  </td> */}
                  <td className="px-4 py-3">
                    <span className="bg-primary/20 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                      {item.inventoryId.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {item.availableQuantity}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {(item.inventoryId.sellingPrice || 0).toLocaleString()} MMK
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    {(
                      item.quantity * (item.inventoryId.sellingPrice || 0)
                    ).toLocaleString()}{" "}
                    MMK
                  </td>
                  <td className="px-4 py-3">
                    {item.isLowStock ? (
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
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
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(item.lastUpdated).toLocaleDateString()}{" "}
                    {new Date(item.lastUpdated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {userRole === "owner" && (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <tfoot className="bg-slate-50 border-t-2">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 font-bold text-slate-800 text-right"
                >
                  Total:
                </td>
                <td className="px-4 py-4 text-right font-bold text-slate-800">
                  {totalQuantity}
                </td>
                <td className="px-4 py-4 text-right font-medium text-slate-600">
                  -
                </td>
                <td className="px-4 py-4 text-right font-bold text-indigo-600 text-lg">
                  {totalStorefrontAmount.toLocaleString()} MMK
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot> */}
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
                  {selectedStockItem.inventoryId.productCode} | Current
                  Quantity: {selectedStockItem.quantity}
                </p>
              </div>

              {/* Adjustment Type Info */}
              <div
                className={`p-3 rounded-lg ${
                  adjustmentType === "increase"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p className="text-sm font-medium">
                  {adjustmentType === "increase"
                    ? "This will increase the stock quantity"
                    : "This will decrease the stock quantity"}
                </p>
                {adjustmentType === "decrease" && (
                  <p className="text-xs text-red-600 mt-1">
                    Available to decrease: {selectedStockItem.quantity}
                  </p>
                )}
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity to {adjustmentType === "increase" ? "Add" : "Remove"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    adjustmentType === "decrease"
                      ? selectedStockItem.quantity
                      : undefined
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter quantity"
                  value={adjustmentQuantity || ""}
                  onChange={(e) =>
                    setAdjustmentQuantity(Number(e.target.value) || 0)
                  }
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter reason for stock adjustment (optional)..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
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
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    adjustmentType === "increase"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
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
                      )}{" "}
                      {adjustmentType === "increase"
                        ? "Increase Stock"
                        : "Decrease Stock"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary-600" />
                Transfer to {transferType}
              </h2>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Source Storefront Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  Source Storefront
                </p>
                <p className="text-lg font-bold text-blue-800">
                  {storefrontName}{" "}
                  <span className="text-sm font-normal">
                    ({storefrontCode})
                  </span>
                </p>
              </div>

              {/* Transfer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transfer Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      transferType === "Warehouse"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transferType"
                      value="Warehouse"
                      checked={transferType === "Warehouse"}
                      onChange={(e) => {
                        setTransferType(
                          e.target.value as "Warehouse" | "Storefront",
                        );
                        setSelectedStorefrontId("");
                        setSelectedWarehouseId("");
                      }}
                      className="mr-3"
                    />
                    <span className="text-slate-700 text-sm font-medium">
                      Transfer to Warehouse
                    </span>
                  </label>
                  <label
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      transferType === "Storefront"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transferType"
                      value="Storefront"
                      checked={transferType === "Storefront"}
                      onChange={(e) => {
                        setTransferType(
                          e.target.value as "Warehouse" | "Storefront",
                        );
                        setSelectedStorefrontId("");
                        setSelectedWarehouseId("");
                      }}
                      className="mr-3"
                    />
                    <span className="text-slate-700 text-sm font-medium">
                      Transfer to Storefront
                    </span>
                  </label>
                </div>
              </div>

              {/* Destination Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destination {transferType}{" "}
                  <span className="text-red-500">*</span>
                </label>
                {transferType === "Warehouse" ? (
                  <select
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  >
                    <option value="">Select Warehouse...</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.locationName} ({warehouse.locationCode})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={selectedStorefrontId}
                    onChange={(e) => setSelectedStorefrontId(e.target.value)}
                  >
                    <option value="">Select Storefront...</option>
                    {storefronts
                      .filter((storefront) => storefront.id !== id) // Exclude current storefront
                      .map((storefront) => (
                        <option key={storefront.id} value={storefront.id}>
                          {storefront.locationName} ({storefront.locationCode})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Transfer Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700">
                    Products to Transfer <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={addTransferItem}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                {transferItems.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center text-slate-400">
                    <p>No products added yet.</p>
                    <button
                      onClick={addTransferItem}
                      className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + Add your first product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transferItems.map((item, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-slate-50"
                      >
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-5">
                            <label className="block text-xs text-slate-500 mb-1">
                              Product
                            </label>
                            <select
                              className="w-full border rounded p-2 text-sm"
                              value={item.productCode}
                              onChange={(e) =>
                                updateTransferItem(
                                  index,
                                  "productCode",
                                  e.target.value,
                                )
                              }
                            >
                              {getAvailableProductsForItem(
                                item.productCode,
                              ).map((stockItem) => (
                                <option
                                  key={stockItem.inventoryId.productCode}
                                  value={stockItem.inventoryId.productCode}
                                >
                                  {stockItem.inventoryId.productName} (
                                  {stockItem.inventoryId.productCode})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-slate-500 mb-1">
                              Qty (max: {item.maxQuantity})
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={item.maxQuantity}
                              className="w-full border rounded p-2 text-sm"
                              value={item.quantity}
                              onChange={(e) =>
                                updateTransferItem(
                                  index,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="block text-xs text-slate-500 mb-1">
                              Notes (optional)
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded p-2 text-sm"
                              placeholder="Item notes..."
                              value={item.notes}
                              onChange={(e) =>
                                updateTransferItem(
                                  index,
                                  "notes",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="col-span-1 flex items-end justify-center">
                            <button
                              onClick={() => removeTransferItem(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transfer Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Transfer notes..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTransfer}
                  disabled={isSubmitting || transferItems.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Create Transfer
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
