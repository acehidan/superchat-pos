import React, { useState, useEffect } from "react";
import {
  Users,
  MessageCircle,
  Bot,
  ToggleLeft,
  ToggleRight,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Power,
  PowerOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  MessengerUser,
  fetchMessengerUsers,
} from "../services/Messenger/fetchMessengerUsers";
import { toggleAIForUser } from "../services/Messenger/toggleAIForUser";
import {
  isFacebookAuthenticated,
  getFacebookAuthData,
} from "../utils/facebookAuth";

export const MessengerUsersPage: React.FC = () => {
  const [users, setUsers] = useState<MessengerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "blocked"
  >("all");

  // Check Facebook authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<{
    token: string | null;
    pageId: string | null;
  }>({ token: null, pageId: null });
  const [togglingAI, setTogglingAI] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authenticated = isFacebookAuthenticated();
      const data = getFacebookAuthData();
      setIsAuthenticated(authenticated);
      setAuthData(data);

      if (authenticated) {
        loadUsers();
      }
    };

    checkAuth();
  }, [currentPage, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchMessengerUsers();
      console.log("response", response);

      if (response.success && response.data) {
        setUsers(response.data);
        setTotalUsers(response.pagination.totalItems);
      } else {
        toast.error(response.message || "Failed to load messenger users");
      }
    } catch (error) {
      console.error("Error loading messenger users:", error);
      toast.error("Failed to load messenger users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      // user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.psid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalUsers / limit);
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalUsers);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-slate-100 text-slate-700";
      case "blocked":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case "male":
        return "bg-blue-100 text-blue-700";
      case "female":
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing users...");
    loadUsers();
  };

  const handleToggleAI = async (user: MessengerUser) => {
    setTogglingAI(user.psid);
    try {
      const response = await toggleAIForUser(
        user.psid,
        !user.isAutoResponseEnabled,
      );

      if (response.success) {
        toast.success(
          `AI ${response.data?.status === "enabled" ? "enabled" : "disabled"} for ${user.fullName}`,
        );

        // Update user in local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.psid === user.psid
              ? {
                  ...u,
                  isAutoResponseEnabled: response.data?.status === "enabled",
                }
              : u,
          ),
        );
      } else {
        toast.error(response.message || "Failed to toggle AI");
      }
    } catch (error) {
      console.error("Error toggling AI:", error);
      toast.error("Failed to toggle AI");
    } finally {
      setTogglingAI(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Messenger Users
        </h1>
        <button
          onClick={handleRefresh}
          // disabled={loading || !isAuthenticated}
          className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Authentication Status */}
      {isAuthenticated ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center mb-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Facebook Authentication Required
          </h3>
          <p className="text-slate-600 mb-4">
            To access messenger users, you need to authenticate with Facebook
            first.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
            <h4 className="font-medium text-slate-700 mb-2">
              How to authenticate:
            </h4>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
              <li>Navigate to the POS page</li>
              <li>Complete Facebook login process</li>
              <li>Return to this page to access messenger users</li>
            </ol>
          </div>
          <a
            href="/facebook-login"
            className="inline-flex items-center gap-2 bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Go to facebook login Page for Authentication
          </a>
        </div>
      ) : (
        <>
          {/* Authenticated Status Bar */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Facebook Authentication Active
                </p>
                <p className="text-xs text-green-600">
                  Page ID: {authData.pageId}
                </p>
              </div>
              <a
                href="/facebook-login"
                className="text-xs text-green-600 hover:text-green-800 underline"
              >
                Re-authenticate
              </a>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, PSID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-end text-sm text-slate-600">
                {filteredUsers.length} of {totalUsers} users
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-slate-500">Loading messenger users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No messenger users found matching your criteria"
                  : "No messenger users found"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Users List */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          PSID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Auto Response
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          AI Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {user.fullName}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {user.firstName} {user.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                              {user.psid}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                                user.status,
                              )}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {user.isAutoResponseEnabled ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600">
                                    Enabled
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    Disabled
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getGenderColor(
                                user.gender,
                              )}`}
                            >
                              {user.gender}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {user.isAutoResponseEnabled ? (
                                <>
                                  <Bot className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-green-600">
                                    AI Active
                                  </span>
                                </>
                              ) : (
                                <>
                                  <PowerOff className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    AI Inactive
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleAI(user)}
                                disabled={togglingAI === user.psid}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                  user.isAutoResponseEnabled
                                    ? "bg-red-100 hover:bg-red-200 text-red-700"
                                    : "bg-green-100 hover:bg-green-200 text-green-700"
                                } disabled:opacity-50`}
                              >
                                {togglingAI === user.psid ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : user.isAutoResponseEnabled ? (
                                  <PowerOff className="w-3 h-3" />
                                ) : (
                                  <Power className="w-3 h-3" />
                                )}
                                {user.isAutoResponseEnabled
                                  ? "Stop AI"
                                  : "Start AI"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border p-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Showing {startIndex} to {endIndex} of {totalUsers} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-primary text-white"
                                : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
