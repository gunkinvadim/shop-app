export interface ProductFormData {
    name: string,
    description: string;
    price: number;
    sellerId: number,
    categoryId: number;
    // image: FormData
}

export interface ProductCategory {
    id: number,
    name: string;
}