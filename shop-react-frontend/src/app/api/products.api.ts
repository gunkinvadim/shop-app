import { environment } from "../../environments/environment";
import { ProductCategory, ProductFormData } from "../models/products.model";
import axios from "axios";

// helper to read `token` cookie value
const getTokenFromCookie = () => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(^|;)\s*token=([^;]+)/);
    debugger
    return match ? decodeURIComponent(match[2]) : null;
}

export const fetchCategoriesList = async () => {
    try {
        return await axios.get<ProductCategory[]>(environment.baseUrl + "/products/categories");
    } catch (error) {
        console.error("Error fetchin categories:", error);
        throw error;
    }
}

export const fetchProductsList = () => {
    
}

export const createNewProduct = async (req: ProductFormData | FormData) => {
    try {
        if (req instanceof FormData) {
            const token = getTokenFromCookie();
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Let the browser set Content-Type with the correct boundary;
            // attach Authorization header per-request to avoid relying on axios.defaults
            return await axios.post<any>(environment.baseUrl + "/products", req, { headers });
        }

        return await axios.post<any>(environment.baseUrl + "/products", req);
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}