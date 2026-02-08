import React, { FC } from "react";
import { X, Package, Calendar, Tag, CreditCard, Box, TrendingUp, Info, MessageSquare, Bot } from "lucide-react";
import { SocialMediaInventoryDetail } from "../../services/SocialMedia/fetchSocialMediaInventoryDetail";

interface SocialMediaInventoryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventoryItem: SocialMediaInventoryDetail | null;
    loading: boolean;
}

export const SocialMediaInventoryDetailModal: FC<SocialMediaInventoryDetailModalProps> = ({
    isOpen,
    onClose,
    inventoryItem,
    loading,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        Product Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium">Loading details...</p>
                        </div>
                    ) : inventoryItem ? (
                        <div className="space-y-8">
                            {/* Product Header Info */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                                        {inventoryItem.inventoryId.productName}
                                    </h3>
                                    <div className="flex gap-2 text-sm text-slate-500">
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                            <Tag className="w-3 h-3" />
                                            {inventoryItem.inventoryId.productCode}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                            <Box className="w-3 h-3" />
                                            {inventoryItem.inventoryId.SKU}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${inventoryItem.isLowStock
                                            ? 'bg-amber-100 text-amber-700'
                                            : inventoryItem.quantity === 0
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                        {inventoryItem.isLowStock ? 'Low Stock' : inventoryItem.quantity === 0 ? 'Out of Stock' : 'In Stock'}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Updated: {new Date(inventoryItem.lastUpdated).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Grid Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Financials */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Financials</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Buying Price</p>
                                            <p className="font-semibold text-slate-800">{inventoryItem.inventoryId.buyingPrice.toLocaleString()} MMK</p>
                                        </div>
                                        <div className="bg-indigo-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Selling Price</p>
                                            <p className="font-semibold text-indigo-700">{inventoryItem.inventoryId.sellingPrice.toLocaleString()} MMK</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Profit Amount</p>
                                            <p className="font-semibold text-green-700">+{inventoryItem.inventoryId.profitAmount.toLocaleString()} MMK</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
                                            <p className="font-semibold text-blue-700">{inventoryItem.inventoryId.profitMargin.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Inventory Info */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Inventory Info</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-600">Current Quantity</span>
                                            <span className="font-bold text-slate-900 text-lg">{inventoryItem.quantity} <span className="text-xs font-normal text-slate-500">units</span></span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-600">Category</span>
                                            <span className="font-medium text-slate-800 capitalize">{inventoryItem.inventoryId.category}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Guides */}
                            <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        Selling Guide Prompt
                                    </h4>
                                    <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed italic">
                                        "{inventoryItem.sellingGuidePrompt}"
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Bot className="w-4 h-4 text-green-500" />
                                        Buying Guide Prompt
                                    </h4>
                                    <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed italic">
                                        "{inventoryItem.buyingGuidePrompt}"
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Info className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No details found for this item.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
