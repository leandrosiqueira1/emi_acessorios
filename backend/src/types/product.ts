// src/types/product.ts

// Tipos já existentes (ou similares)
export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    category_id: number;
    is_featured: boolean;
    weight_g: number;
    length_cm: number;
    height_cm: number;
    width_cm: number;
};

export interface ProductBody {
  name: string;
  price: string; 
  category_id: string;
  is_featured?: string | boolean;
  description?: string;
  weight_kg: string;
  length_cm: string;
  height_cm: string;
  width_cm: string;
}

export interface ProductUpdateBody {
  name?: string;
  price?: string;
  category_id?: string;
  is_featured?: string | boolean;
  description?: string;
  weight_kg?: string;
  length_cm?: string;
  height_cm?: string;
  width_cm?: string;
}

// 🆕 Nova Interface Exportada
export interface ProductCreateData {
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: number;
  is_featured: boolean;
  weight_g: number;
  length_cm: number;
  height_cm: number;
  width_cm: number;
}