import axios from "../axios";

export interface SocialMediaInventoryItem {
  id: string;
  inventoryId: {
    productName: string;
    productCode: string;
    SKU: string;
    barcode: string;
    category: string;
    sellingPrice: number;
    profitMargin: number | null;
    profitAmount: number | null;
    id: string;
  };
  quantity: number;
  sellingGuidePrompt: string;
  buyingGuidePrompt: string;
  isLowStock: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaInventoryResponse {
  success: boolean;
  socialMediaSaleInventories: SocialMediaInventoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message: string;
}

/**
 * Fetch all social media inventory items
 * @returns {Promise<SocialMediaInventoryResponse>} Response from API
 */
export const fetchSocialMediaInventory = async (): Promise<SocialMediaInventoryResponse> => {
  try {
    const response = await axios.get("/social-inventory");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching social media inventory:", error);

    if (axios.isAxiosError(error)) {
      if (
        error.response &&
        error.response.headers["content-type"] &&
        error.response.headers["content-type"].includes("text/html")
      ) {
        throw new Error(
          `API endpoint not found. Please check if the API is running and the endpoint "${error.config?.url}" is correct.`
        );
      }

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `HTTP error! status: ${error.response.status}`;
        throw new Error(errorMessage);
      }

      if (error.request) {
        throw new Error(
          "Network error: Unable to reach the API. Please check if the API server is running."
        );
      }
    }

    throw error;
  }
};
