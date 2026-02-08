import axios from "../axios";

export interface SocialMediaInventoryDetail {
    id: string;
    inventoryId: {
        productName: string;
        productCode: string;
        SKU: string;
        category: string;
        buyingPrice: number;
        sellingPrice: number;
        profitMargin: number;
        profitAmount: number;
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

interface FetchSocialMediaInventoryDetailResponse {
    success: boolean;
    message: string;
    data: SocialMediaInventoryDetail;
}

/**
 * Fetch social media inventory detail by ID
 * @param {string} id - The social media inventory ID
 * @returns {Promise<FetchSocialMediaInventoryDetailResponse>} API response
 */
export const fetchSocialMediaInventoryDetail = async (
    id: string
): Promise<FetchSocialMediaInventoryDetailResponse> => {
    try {
        const response = await axios.get(`/social-inventory/${id}`);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching social media inventory detail:", error);
        throw error;
    }
};
