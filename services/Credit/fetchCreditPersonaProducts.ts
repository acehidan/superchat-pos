import axios from "../axios";

export interface CreditPersonaProduct {
  inventoryId: string;
  productName: string;
  productCode: string;
  SKU: string;
  unitOfMeasure: string;
  totalQuantity: number;
  orderCount: number;
}

export interface CreditPersonaProductReport {
  creditPersona: {
    id: string;
    name: string;
    phone: string;
  };
  totals: {
    totalQuantity: number;
    totalUniqueProducts: number;
    totalOrderCount: number;
  };
  products: CreditPersonaProduct[];
}

interface FetchCreditPersonaProductsResponse {
  success: boolean;
  message: string;
  data: CreditPersonaProductReport;
}

export const fetchCreditPersonaProducts = async (
  creditPersonId: string,
): Promise<FetchCreditPersonaProductsResponse> => {
  try {
    const response = await axios.get(
      `/sale-report/credit-persona-products?creditPersonId=${creditPersonId}`,
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching credit persona products:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to fetch credit persona products",
      data: {
        creditPersona: {
          id: "",
          name: "",
          phone: "",
        },
        totals: {
          totalQuantity: 0,
          totalUniqueProducts: 0,
          totalOrderCount: 0,
        },
        products: [],
      },
    };
  }
};
