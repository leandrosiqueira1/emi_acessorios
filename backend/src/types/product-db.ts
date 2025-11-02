// src/types/product-db.ts

import { QueryResultRow } from "pg";

export interface ProductRow extends QueryResultRow {
    id: number;
    name: string;
    price: string; 
    image_url: string | null;
    description: string;
    category_id: number;
    is_featured: boolean;
    weight_g: number | null;
    length_cm: number | null;
    height_cm: number | null;
    width_cm: number | null;
    category_name: string | null;
}

export interface MappedProduct {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
    category_id: number;
    is_featured: boolean;
    weight_kg: number;
    length_cm: number;
    height_cm: number;
    width_cm: number;
    category?: { id: number; name: string };
}


export interface CreateProductInput {
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    category_id: number;
    is_featured?: boolean;
    weight_g?: number;
    length_cm?: number;
    height_cm?: number;
    width_cm?: number;
}