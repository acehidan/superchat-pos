import axios from "../axios";

export interface SocialMediaOrderProduct {
  id: string;
  inventoryId: string;
  quantity: number;
  unitPrice: string;
  inventory: {
    id: string;
    productName: string;
    productCode: string;
    SKU: string;
  };
}

export interface SocialMediaOrder {
  id: string;
  socialMediaSaleOrderNumber: string;
  orderProducts: SocialMediaOrderProduct[];
  platform: string;
  subTotal: number;
  tax: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  customerName: string;
  customerPhoneNumber: string;
  customerAddress: string;
  deliveryOption: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaOrderResponse {
  success: boolean;
  message: string;
  data: SocialMediaOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const fetchSocialMediaOrders = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  platform?: string,
  search?: string
): Promise<SocialMediaOrderResponse> => {
  try {
    let url = `social-media-sale-order?page=${page}&limit=${limit}`;
    if (status && status !== "all") url += `&orderStatus=${status}`;
    if (platform && platform !== "all") url += `&platform=${platform}`;
    if (search) url += `&search=${search}`;

    const response = await axios.get(url);

    return {
      success: true,
      message: response.data.message || "Social media sale orders retrieved successfully",
      data: response.data.data.data,
      pagination: response.data.data.pagination,
    };
  } catch (error: any) {
    console.error("Error fetching social media orders:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch social media orders",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
      },
    };
  }
};
