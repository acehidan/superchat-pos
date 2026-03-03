import axios from "../axios";

export interface TransferLineItem {
  id: string;
  inventoryId: string;
  quantity: number;
  grnLineItemId: string;
  notes: string | null;
  inventory: {
    id: string;
    productCode: string;
    productName: string;
  };
}

export interface TransferData {
  id: string;
  transferNumber: string;
  sourceType: string;
  sourceId: string;
  destinationType: string;
  destinationId: string;
  lineItems: TransferLineItem[];
  status: string;
  transferDate: string;
  receivedDate: string | null;
  notes: string | null;
  totalQuantity: number;
  isDeleted: boolean;
  deletedAt: string | null;
  transferredBy: string;
  createdAt: string;
  updatedAt: string;
  admin: {
    id: string;
    name: string;
  };
}

interface FetchTransfersResponse {
  success: boolean;
  message: string;
  data: TransferData[];
}

export const fetchTransfers = async (): Promise<FetchTransfersResponse> => {
  try {
    const response = await axios.get("/transfer");

    return response.data;
  } catch (error: any) {
    console.error("Error fetching transfers:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch transfers",
      data: [],
    };
  }
};
