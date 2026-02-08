import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Share2,
  AlertTriangle,
  Box,
  RefreshCw,
  Search,
  Filter,
  X,
  MessageSquare,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchSocialMediaInventory,
  SocialMediaInventoryItem,
} from "../services/SocialMedia/fetchSocialMediaInventory";
import {
  fetchSocialMediaInventoryDetail,
  SocialMediaInventoryDetail,
} from "../services/SocialMedia/fetchSocialMediaInventoryDetail";
import { SocialMediaInventoryDetailModal } from "../components/SocialMedia/SocialMediaInventoryDetailModal";

export const SocialMediaInventory: React.FC = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState<
    SocialMediaInventoryItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] =
    useState<SocialMediaInventoryDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

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
      if (response.socialMediaSaleInventories) {
        setInventoryItems(response.socialMediaSaleInventories);
      }
    } catch (error) {
      toast.error("Failed to load social media inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const response = await fetchSocialMediaInventoryDetail(id);
      if (response.success) {
        setSelectedItem(response.data);
      } else {
        toast.error("Failed to load item details");
        // setIsDetailModalOpen(false); // Keep open to show empty state or error if desired, but better to close or show error in modal
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      toast.error("Failed to load item details");
      // setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
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
                <th className="px-4 py-3 font-medium text-slate-600 text-right">
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
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewDetail(item.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SocialMediaInventoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        inventoryItem={selectedItem}
        loading={detailLoading}
      />
    </div>
  );
};
