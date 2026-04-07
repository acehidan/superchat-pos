import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Role } from "../types";
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Truck,
  FileText,
  Activity,
} from "lucide-react";
import {
  fetchStockAuditLogs,
  StockAuditLog,
} from "../services/StockAudit/fetchStockAuditLogs";
import {
  fetchTransfers,
  TransferData,
} from "../services/Purchase/fetchTransfers";
import { fetchAuditLogs, AuditLog } from "../services/Audit/fetchAuditLogs";
import { toast } from "sonner";
import { TransferList } from "../components/Purchasing/TransferList";
import { TransferDetailModal } from "../components/Purchasing/TransferDetailModal";

export const Settings: React.FC = () => {
  const { currentUser, setUserRole, logs } = useApp();
  const [stockAuditLogs, setStockAuditLogs] = useState<StockAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferList, setTransferList] = useState<TransferData[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(
    null,
  );
  const [isTransferDetailModalOpen, setIsTransferDetailModalOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState<"audit" | "transfer" | "activity">(
    "audit",
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const loadStockAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await fetchStockAuditLogs();
      console.log(response);
      if (response.success && response.data) {
        setStockAuditLogs(response.data);
      } else {
        toast.error(response.message || "Failed to load stock audit logs");
      }
    } catch (error) {
      console.error("Error loading stock audit logs:", error);
      toast.error("Failed to load stock audit logs");
    } finally {
      setLoading(false);
    }
  };

  const loadTransfers = async () => {
    try {
      const res = await fetchTransfers();
      if (res.success) {
        setTransferList(res.data.reverse());
      }
    } catch (error) {
      console.error("Failed to load transfers", error);
      toast.error("Failed to load transfers");
    }
  };

  const loadAuditLogs = async () => {
    setLoadingActivity(true);
    try {
      const response = await fetchAuditLogs();
      if (response.success && response.data) {
        setAuditLogs(response.data);
      } else {
        toast.error(response.message || "Failed to load audit logs");
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleViewTransfer = (transfer: TransferData) => {
    setSelectedTransferId(transfer._id);
    setIsTransferDetailModalOpen(true);
  };

  useEffect(() => {
    loadStockAuditLogs();
    loadTransfers();
    loadAuditLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">
        System Settings
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 font-semibold flex items-center gap-2 ${
            activeTab === "audit"
              ? "border-b-2 border-blue-800 text-blue-800"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" /> Stock Audit Logs
        </button>
        <button
          onClick={() => setActiveTab("transfer")}
          className={`px-4 py-2 font-semibold flex items-center gap-2 ${
            activeTab === "transfer"
              ? "border-b-2 border-blue-800 text-blue-800"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Truck className="w-4 h-4" /> Transfer Management
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 font-semibold flex items-center gap-2 ${
            activeTab === "activity"
              ? "border-b-2 border-blue-800 text-blue-800"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Activity className="w-4 h-4" /> Activity Log
        </button>
      </div>

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-primary" /> Stock
              Audit Logs
            </h2>
            <button
              onClick={loadStockAuditLogs}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p>Loading stock audit logs...</p>
            </div>
          ) : stockAuditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No stock audit logs found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="">
                <div className="overflow-x-auto h-[calc(100vh-330px)] overflow-y-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Date
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Product
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Location
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Action
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                          Before
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                          After
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                          Change
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Admin
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stockAuditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">
                              {log.inventoryId.productName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {log.inventoryId.productCode} |{" "}
                              {log.inventoryId.SKU}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">
                              {log?.locationId?.locationName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {log?.locationId?.locationCode} (
                              {log?.locationType})
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                log.action === "add"
                                  ? "bg-green-100 text-green-700"
                                  : log.action === "remove"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-700">
                            {log.beforeQuantity.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-700">
                            {log.afterQuantity.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {log.isIncrease ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : log.isDecrease ? (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              ) : null}
                              <span
                                className={`font-bold ${
                                  log.isIncrease
                                    ? "text-green-600"
                                    : log.isDecrease
                                      ? "text-red-600"
                                      : "text-slate-600"
                                }`}
                              >
                                {log.quantityChange > 0 ? "+" : ""}
                                {log.quantityChange.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {log?.adminId?.name ? log?.adminId?.name : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">
                            {log?.reason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Management Tab */}
      {activeTab === "transfer" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Truck className="w-5 h-5 mr-2 text-blue-600" /> Transfer
              Management
            </h2>
            <button
              onClick={loadTransfers}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <TransferList
            transferList={transferList}
            onViewTransfer={handleViewTransfer}
            onStatusChange={loadTransfers}
          />
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" /> Activity Log
            </h2>
            <button
              onClick={loadAuditLogs}
              disabled={loadingActivity}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingActivity ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loadingActivity ? (
            <div className="p-8 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              <p>Loading activity logs...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No activity logs found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto h-[calc(100vh-330px)] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Action
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Resource
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Admin ID
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action === "CREATE"
                                ? "bg-green-100 text-green-700"
                                : log.action === "UPDATE"
                                  ? "bg-blue-100 text-blue-700"
                                  : log.action === "DELETE"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {log.resource}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                          {log.adminId?.substring(0, 8)}...
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            <p className="text-xs text-slate-600 truncate">
                              {log.changes?.requestData?.name ||
                                log.changes?.requestData?.productName ||
                                JSON.stringify(
                                  log.changes?.requestData,
                                ).substring(0, 50)}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transfer Detail Modal */}
      <TransferDetailModal
        isOpen={isTransferDetailModalOpen}
        onClose={() => setIsTransferDetailModalOpen(false)}
        transferId={selectedTransferId}
      />
    </div>
  );
};
