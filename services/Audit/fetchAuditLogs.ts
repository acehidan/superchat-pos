import axios from "../axios";

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  changes: {
    action: string;
    requestData: any;
    result: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AuditLog[];
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
}

export const fetchAuditLogs = async (
  page: number = 1,
  limit: number = 20
): Promise<AuditLogResponse> => {
  try {
    const response = await axios.get(`/auditlog?page=${page}&limit=${limit}`);
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return {
      success: false,
      statusCode: 500,
      message: error.response?.data?.message || "Failed to fetch audit logs",
      data: [],
      pagination: {
        total: 0,
        limit: 20,
        page: 1,
        totalPages: 0,
      },
    };
  }
};
