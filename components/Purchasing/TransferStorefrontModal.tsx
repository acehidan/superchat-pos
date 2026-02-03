import React, { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { GRNData } from "../../services/Purchase/fetchGRNs";
import { fetchGRNById } from "../../services/Purchase/fetchGRNById";
import { fetchStorefrontProfiles } from "../../services/Storefront/fetchStorefrontProfiles";
import { transferGRN } from "../../services/Purchase/transferGRN";
import { toast } from "sonner";
import { Store, Package } from "lucide-react";

interface StorefrontProfile {
  id: string;
  locationName: string;
  locationCode: string;
}

interface TransferItem {
  productCode: string;
  productName: string;
  availableQuantity: number;
  quantity: number;
  isSelected: boolean;
  inventoryId?: string;
  notes?: string;
}

interface TransferStorefrontModalProps {
  isOpen: boolean;
  onClose: () => void;
  grnId: string | null;
  onSuccess?: () => void;
}

export const TransferStorefrontModal: React.FC<
  TransferStorefrontModalProps
> = ({ isOpen, onClose, grnId, onSuccess }) => {
  const [grn, setGrn] = useState<GRNData | null>(null);
  const [storefronts, setStorefronts] = useState<StorefrontProfile[]>([]);
  const [selectedStorefrontId, setSelectedStorefrontId] = useState("");
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && grnId) {
      loadData();
    }
  }, [isOpen, grnId]);

  const loadData = async () => {
    if (!grnId) return;
    setLoading(true);
    try {
      const [grnRes, storefrontRes] = await Promise.all([
        fetchGRNById(grnId),
        fetchStorefrontProfiles(),
      ]);

      if (grnRes.success && grnRes.data) {
        setGrn(grnRes.data);
        const items: TransferItem[] = grnRes.data.lineItems.map((item) => ({
          productCode: item.inventoryId?.productCode || "",
          productName: item.inventoryId?.productName || "Unknown Product",
          availableQuantity: item.availableQuantity,
          quantity: item.availableQuantity,
          isSelected: true,
          inventoryId: item.inventoryId?.id,
          notes: "",
        }));
        setTransferItems(items);
      }

      if (storefrontRes.success && storefrontRes.data) {
        setStorefronts(storefrontRes.data);
      }
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const updateTransferNotes = (index: number, notes: string) => {
    setTransferItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        notes,
      };
      return updated;
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    setTransferItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity,
      };
      return updated;
    });
  };

  const toggleItemSelection = (index: number, isSelected: boolean) => {
    setTransferItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isSelected,
      };
      return updated;
    });
  };

  const resetForm = () => {
    setGrn(null);
    setSelectedStorefrontId("");
    setTransferItems([]);
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (selectedItemsOnly = false) => {
    if (!grnId) {
      toast.error("GRN ID is required");
      return;
    }

    if (!selectedStorefrontId) {
      toast.error("Please select a destination storefront");
      return;
    }

    const itemsToProcess = selectedItemsOnly
      ? transferItems.filter((item) => item.isSelected && item.quantity > 0)
      : transferItems.filter((item) => item.quantity > 0);

    if (itemsToProcess.length === 0) {
      toast.error(
        selectedItemsOnly
          ? "Please select at least one product to transfer"
          : "Please add at least one product to transfer",
      );
      return;
    }

    // Validate quantities
    for (const item of itemsToProcess) {
      if (item.quantity <= 0) {
        toast.error(`Quantity for ${item.productName} must be greater than 0`);
        return;
      }
      if (item.quantity > item.availableQuantity) {
        toast.error(
          `Quantity for ${item.productName} exceeds available stock (${item.availableQuantity})`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        sourceType: "GRN" as const,
        sourceId: grnId,
        destinationType: "Storefront" as const,
        destinationId: selectedStorefrontId,
        lineItems: itemsToProcess.map((item) => ({
          productCode: item.productCode,
          quantity: item.quantity,
          ...(item.inventoryId && { inventoryId: item.inventoryId }),
          ...(item.notes && { notes: item.notes }),
        })),
        notes: notes || undefined,
      };

      const result = await transferGRN(payload);

      if (result.success) {
        toast.success("Transfer to storefront created successfully!");
        handleClose();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred while transferring");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Transfer to Storefront">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-slate-500">Loading...</span>
        </div>
      ) : grn ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Transfer Details */}
          <div className="space-y-4">
            {/* GRN Info */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                GRN Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">GRN Number:</span>
                  <span className="font-medium">{grn.grnNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium">
                    {new Date(grn.grnDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Items:</span>
                  <span className="font-medium">{grn.lineItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Good Qty:</span>
                  <span className="font-medium text-green-600">
                    {grn.totalGoodQuantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Storefront Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Store className="w-4 h-4" />
                Destination Storefront
              </label>
              <select
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedStorefrontId}
                onChange={(e) => setSelectedStorefrontId(e.target.value)}
              >
                <option value="">Select Storefront...</option>
                {storefronts.map((sf) => (
                  <option key={sf.id} value={sf.id}>
                    {sf.locationName} ({sf.locationCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="Enter transfer notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Right Panel - Transfer Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Transfer Items</h3>
              <button
                onClick={() => {
                  transferItems.forEach((item, index) => {
                    if (item.availableQuantity > 0) {
                      toggleItemSelection(index, true);
                    }
                  });
                }}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200 font-medium transition-colors"
              >
                Select All
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {transferItems.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-3 ${
                    item.isSelected
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.isSelected}
                      onChange={(e) =>
                        toggleItemSelection(index, e.target.checked)
                      }
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="font-medium text-slate-800">
                          {item.productName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.productCode}
                        </div>
                      </div>

                      {item.isSelected && (
                        <>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Item Notes:
                              </label>
                              <input
                                type="text"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                                value={item.notes || ""}
                                onChange={(e) =>
                                  updateTransferNotes(index, e.target.value)
                                }
                                placeholder="Optional notes..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-green-50 p-2 rounded border border-green-200">
                                <label className="text-xs text-green-600">
                                  Available:
                                </label>
                                <div className="font-semibold text-green-700">
                                  {item.availableQuantity}
                                </div>
                              </div>
                              <div className="bg-white p-2 rounded border border-blue-200">
                                <label className="text-xs text-blue-600">
                                  Transfer Qty:
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={item.availableQuantity}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      index,
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-full font-semibold text-blue-700 bg-transparent border-0 focus:ring-0 p-0 text-sm"
                                />
                              </div>
                            </div>
                            {item.quantity > item.availableQuantity && (
                              <div className="text-xs text-red-600 font-medium">
                                ⚠️ Quantity exceeds available stock
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleSubmit(true)}
                disabled={
                  !selectedStorefrontId ||
                  transferItems.filter(
                    (item) => item.isSelected && item.quantity > 0,
                  ).length === 0 ||
                  isSubmitting
                }
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Store className="w-5 h-5" />
                {isSubmitting ? "Transferring..." : "Transfer Selected"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          No GRN data available
        </div>
      )}
    </Modal>
  );
};
