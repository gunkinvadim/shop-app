import { UserData } from "./auth.models";

export interface ProductFormData {
    name: string,
    description: string;
    price: number;
    sellerId: number,
    categoryId: number,
    imageUrl?: string,
}

export interface ProductCategory {
    id: number,
    name: string;
}

export interface ProductData {
    id: number;
    name: string,
    description: string;
    price: number;
    seller: UserData,
    category: ProductCategory,
    imageUrl?: string,
}

export interface ProductListFilters {
    categoryId?: number | null,
    sellerId?: number | null
}

export interface ListPagination {
    pageNumber: number,
    pageSize: number
}