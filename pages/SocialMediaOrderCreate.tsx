import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Minus,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Truck,
  Save,
  X,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { createSocialMediaOrder } from "../services/Order/createSocialMediaOrder";
import { SocialMediaOrderProduct, SocialMediaOrderRequest } from "../types";
import {
  fetchProductById,
  ProductDetail,
} from "../services/Inventory/fetchProductById";
import axios from "axios";

interface OrderItem extends SocialMediaOrderProduct {
  productName?: string;
  productCode?: string;
  productDetail?: ProductDetail;
}

export const SocialMediaOrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { inventoryId: "", quantity: 1 },
  ]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("cash-on-delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const deliveryOptions = [
    { value: "cash-on-delivery", label: "ငွေကြိုရှင်း" },
    { value: "cash-down", label: "အိမ်အရောက်ငွေချေ  " },
  ];

  // Extract inventoryId from URL and fetch product data
  useEffect(() => {
    const inventoryId = searchParams.get("inventoryId");
    if (inventoryId) {
      fetchProductData(inventoryId);
    }
  }, [searchParams]);

  const fetchProductData = async (inventoryId: string) => {
    setIsLoadingProduct(true);
    try {
      const response = await fetchProductById(inventoryId);
      if (response.success && response.data) {
        setOrderItems([
          {
            inventoryId,
            quantity: 1,
            productName: response.data.productName,
            productCode: response.data.productCode,
            productDetail: response.data,
          },
        ]);
        toast.success(`Product loaded: ${response.data.productName}`);
      } else {
        toast.error(response.message || "Failed to load product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product data");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { inventoryId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
    }
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleInventoryIdChange = async (
    index: number,
    inventoryId: string,
  ) => {
    updateItem(index, "inventoryId", inventoryId);

    if (inventoryId.trim()) {
      setIsLoadingProduct(true);
      try {
        const response = await fetchProductById(inventoryId);
        if (response.success && response.data) {
          const newItems = [...orderItems];
          newItems[index] = {
            ...newItems[index],
            productName: response.data.productName,
            productCode: response.data.productCode,
            productDetail: response.data,
          };
          setOrderItems(newItems);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoadingProduct(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const hasEmptyInventoryId = orderItems.some(
      (item) => !item.inventoryId.trim(),
    );
    if (hasEmptyInventoryId) {
      toast.error("Please fill in all inventory IDs");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (!customerPhoneNumber.trim()) {
      toast.error("Please enter customer phone number");
      return;
    }

    if (!customerAddress.trim()) {
      toast.error("Please enter customer address");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: SocialMediaOrderRequest = {
        orderProducts: orderItems.map(({ inventoryId, quantity }) => ({
          inventoryId,
          quantity,
        })),
        customerName: customerName.trim(),
        customerPhoneNumber: customerPhoneNumber.trim(),
        customerAddress: customerAddress.trim(),
        deliveryOption,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}social-media-sale-order`,
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        toast.success("Order created successfully!");
        setShowSuccessModal(true);
      } else {
        toast.error(response.data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAndClose = () => {
    // Redirect to Messenger using m.me URL
    // You can replace 'yourpage' with your actual Facebook page username
    window.close();
    // window.location.href = "https://m.me/yourpage";
  };

  return (
    <div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                အော်ဒါ ဖန်တီးပြီးပါပြီ!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                သင့် social media order ကို ဖန်တီးပြီးပါပြီ။ confirm ကိုနှိပ်ပါ။
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleConfirmAndClose}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  messegner သို့ ပြန်သွားမည်
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Create Social Media Order
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Create a new order for social media sales
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/social-media-inventory")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div> */}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                အော်ဒါ ပစ္စည်းများ
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex gap-2 sm:gap-3 items-start justify-end">
                      {/* <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={orderItems.length === 1}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button> */}
                    </div>

                    {/* Product Display */}
                    {item.productDetail && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div>
                            {/* Product Image */}
                            {item.productDetail.images &&
                              item.productDetail.images.length > 0 && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={`https://otas.sgp1.cdn.digitaloceanspaces.com/gemini-chat-bot/${item.productDetail.images[0].spaceKey}`}
                                    alt={item.productDetail.productName}
                                    className="w-full h-50 sm:w-40 sm:h-40 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3Ctext x='32' y='32' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='12' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>
                              )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 items-center justify-center">
                            <div className="flex flex-col gap-2 justify-center">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.productDetail.productName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Code: {item.productDetail.productCode}
                              </p>
                              <p className="text-sm text-gray-600">
                                Category: {item.productDetail.category}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm font-medium text-green-600">
                                  {item.productDetail.sellingPrice.toLocaleString()}{" "}
                                  MMK
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {isLoadingProduct &&
                      item.inventoryId &&
                      !item.productDetail && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">
                              Loading product data...
                            </span>
                          </div>
                        </div>
                      )}
                    <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <button
                        type="button"
                        onClick={() =>
                          updateItem(
                            index,
                            "quantity",
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="p-1 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="w-full px-1 sm:px-2 py-2 text-sm text-center border-0 focus:ring-0 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateItem(index, "quantity", item.quantity + 1)
                        }
                        className="p-1 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* <button
              type="button"
              onClick={addItem}
              className="mt-3 sm:mt-4 flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button> */}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                ဝယ်ယူသူအချက်အလက်ဖြည့်ရန်
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ဝယ်ယူသူအမည်
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ဖုန်းနံပါတ်
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={customerPhoneNumber}
                      onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className="w-full pl-10 pr-3 py-2 sm:pr-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  ပေးပို့ရမည့် လိပ်စာ
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter complete delivery address"
                  rows={3}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
            </div>

            {/* Delivery Option */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                ပေးပို့ရမည့် နေရာ
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      deliveryOption === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryOption"
                      value={option.value}
                      checked={deliveryOption === option.value}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700 text-sm">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate("/social-media-inventory")}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "ဖန်တီးနေသည်..." : "အော်ဒါ ဖန်တီးမည်"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
