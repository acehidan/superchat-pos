import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ReceiptItem {
  name: string;
  code?: string;
  qty: number;
  price: number;
}

interface ReceiptData {
  invoiceNumber: string;
  storefrontName: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  discountPercent: number;
  total: number;
  paymentMethod: string;
  paidAmount?: number;
  change?: number;
  note?: string;
}

const PrintReceipt: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get receipt data from localStorage or URL params
    const storedData = localStorage.getItem(`receipt_${orderId}`);
    console.log(`receipt_${orderId}`);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setReceiptData(data);
      } catch (error) {
        console.error("Failed to parse receipt data:", error);
        toast.error("Failed to load receipt data");
      }
    } else {
      // Try to get from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get("data");
      if (dataParam) {
        try {
          const data = JSON.parse(atob(dataParam));
          setReceiptData(data);
        } catch (error) {
          console.error("Failed to parse URL data:", error);
          toast.error("Failed to load receipt data");
        }
      }
    }
    setLoading(false);
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  console.log(receiptData);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🧾</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Receipt Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested receipt could not be found or has expired.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-receipt {
            margin: 0;
            padding: 20px;
            background: white;
            min-height: 100vh;
          }
          .print-receipt * {
            font-family: 'Courier New', monospace;
          }
        }
      `}</style>

      {/* Header - Hidden during print */}
      <div className="no-print bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            Receipt #{receiptData.invoiceNumber}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🖨️ Print Receipt
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="print-receipt max-w-2xl mx-auto p-8 bg-white min-h-screen">
        {/* Store Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h2 className="text-2xl font-bold mb-2">
            {receiptData.storefrontName}
          </h2>
          <div className="text-gray-600">RECEIPT</div>
          <div className="text-sm text-gray-500 mt-2">
            {formatDate(receiptData.date)}
          </div>
        </div>

        {/* Order Info */}
        <div className="mb-6">
          <div className="font-bold text-lg mb-2">
            Invoice: {receiptData.invoiceNumber}
          </div>
          <div className="text-sm text-gray-600">
            Payment Method: {receiptData.paymentMethod}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Price</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    <div className="font-medium">{item.name}</div>
                    {item.code && (
                      <div className="text-xs text-gray-500">
                        Code: {item.code}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-2">{item.qty}</td>
                  <td className="text-right py-2">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="text-right py-2 font-medium">
                    {formatCurrency(item.qty * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(receiptData.subtotal)}</span>
          </div>
          {receiptData.discountPercent > 0 && (
            <div className="flex justify-between">
              <span>Discount ({receiptData.discountPercent}%):</span>
              <span className="text-red-600">
                -
                {formatCurrency(
                  receiptData.subtotal * (receiptData.discountPercent / 100),
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
            <span>Total:</span>
            <span>{formatCurrency(receiptData.total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        {(receiptData.paidAmount !== undefined ||
          receiptData.change !== undefined) && (
          <div className="mb-6 space-y-2 border-t pt-2">
            {receiptData.paidAmount !== undefined && (
              <div className="flex justify-between">
                <span>Paid Amount:</span>
                <span>{formatCurrency(receiptData.paidAmount)}</span>
              </div>
            )}
            {receiptData.change !== undefined && (
              <div className="flex justify-between font-bold">
                <span>Change:</span>
                <span className="text-green-600">
                  {formatCurrency(receiptData.change)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        {receiptData.note && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold mb-1">Note:</div>
            <div className="text-gray-700">{receiptData.note}</div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t">
          <div className="text-lg font-bold mb-2">Thank you!</div>
          <div className="text-sm text-gray-500">IMAS POS System Receipt</div>
          <div className="text-xs text-gray-400 mt-2">
            Printed on {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;
