import axios from "../axios";

export interface CreateProductPayload {
  productName: string;
  productCode: string;
  saleCode: string;
  SKU?: string;
  barcode?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  unitOfMeasure: string;
  reorderPoint: number;
  reorderQuantity: number;
  taxRate: number;
  status: "active" | "inactive";
  tags?: string[];
}

interface CreateProductResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Create a new product via API
 * @param {CreateProductPayload} productData - Product data matching API schema
 * @param {File[]} images - Array of image files to upload
 * @returns {Promise<CreateProductResponse>} Response from API
 */
export const createProduct = async (
  productData: CreateProductPayload,
  images?: File[],
): Promise<CreateProductResponse> => {
  try {
    let response;

    if (images && images.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();

      // Add all product fields to FormData
      Object.keys(productData).forEach((key) => {
        const value = productData[key as keyof CreateProductPayload];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add images
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      response = await axios.post("/inventory", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // Use regular JSON payload if no images
      response = await axios.post("/inventory", productData);
    }

    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);

    if (axios.isAxiosError(error)) {
      if (
        error.response &&
        error.response.headers["content-type"] &&
        error.response.headers["content-type"].includes("text/html")
      ) {
        throw new Error(
          `API endpoint not found. Please check if the API is running and the endpoint "${error.config?.url}" is correct.`,
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
          "Network error: Unable to reach the API. Please check if the API server is running.",
        );
      }
    }

    throw error;
  }
};
