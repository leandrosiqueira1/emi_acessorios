// frontend/src/app/types/products.ts
export interface Category {
id: number;
name: string;
}

export type Product {
id: number;
name: string;
price: number;
image_url: string | null;
is_featured: boolean; 
category: Category | null;
}

