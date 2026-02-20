import axios from "axios";
import { getFacebookAuthHeader } from "../../utils/facebookAuth";

// Create a separate axios instance for Facebook API calls
const facebookAxios = axios.create();

export interface MessengerUser {
  id: string;
  psid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  profilePicUrl?: string;
  isAutoResponseEnabled: boolean;
  status: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessengerUserPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface MessengerUserResponse {
  success: boolean;
  message: string;
  data: MessengerUser[];
  pagination: MessengerUserPagination;
}

export const fetchMessengerUsers = async (): Promise<MessengerUserResponse> => {
  try {
    // Get Facebook authentication headers
    const authHeaders = getFacebookAuthHeader();
    console.log("authHeaders", authHeaders);

    // Make request with authentication using separate axios instance
    const response = await facebookAxios.get(`messenger/users`, {
      headers: {
        ...authHeaders,
      },
    });

    return {
      success: true,
      message: "Messenger users retrieved successfully",
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    console.error("Error fetching messenger users:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch messenger users",
      data: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      },
    };
  }
};
