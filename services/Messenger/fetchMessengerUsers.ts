import axios from "../axios";
import { getFacebookAuthHeader } from "../../utils/facebookAuth";

export interface MessengerUser {
  id: string;
  psid: string;
  pageId: string;
  isAutoResponseEnabled: boolean;
  status: "active" | "inactive" | "blocked";
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  gender: "male" | "female" | "other";
  createdAt: string;
  updatedAt: string;
}

export interface MessengerUserPagination {
  total: number;
  limit: number;
  offset: number;
}

export interface MessengerUserResponse {
  success: boolean;
  message: string;
  data: MessengerUser[];
  pagination: MessengerUserPagination;
}

export const fetchMessengerUsers = async (
  limit: number = 10,
  offset: number = 0,
): Promise<MessengerUserResponse> => {
  try {
    // Get Facebook authentication headers
    const authHeaders = getFacebookAuthHeader();

    // Make request with authentication
    const response = await axios.get(`messenger/users`, {
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
        total: 0,
        limit: 10,
        offset: 0,
      },
    };
  }
};
