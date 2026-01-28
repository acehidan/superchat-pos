import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";
import { createSocialMediaOrder } from "../services/Order/createSocialMediaOrder";
import { SocialMediaOrderProduct, SocialMediaOrderRequest } from "../types";
import axios from "axios";

interface OrderItem extends SocialMediaOrderProduct {
  productName?: string;
  productCode?: string;
}

export const SocialMediaOrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { inventoryId: "", quantity: 1 },
  ]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("cash-on-delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryOptions = [
    { value: "cash-on-delivery", label: "Cash on Delivery" },
    { value: "cash-down", label: "Cash-down" },
  ];

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
        "https://overearnest-intentional-rosendo.ngrok-free.dev/api/v1/social-media-sale-order",
        orderData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        toast.success("Order created successfully!");
        navigate("/social-media-inventory");
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

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              Order Items
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2 sm:gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Inventory ID"
                      value={item.inventoryId}
                      onChange={(e) =>
                        updateItem(index, "inventoryId", e.target.value)
                      }
                      className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="w-20 sm:w-32">
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
                      className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={orderItems.length === 1}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-3 sm:mt-4 flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              Customer Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
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
                  Phone Number
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
                Delivery Address
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
              Delivery Option
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
                  <span className="text-gray-700 text-sm">{option.label}</span>
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
              {isSubmitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
