// frontend/src/app/types/products.ts - 07/10/2025
import { Category } from "./categories";

export interface Product {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
    is_featured: boolean; 
    category: Category | null;
    
    // 💡 CAMPOS ADICIONADOS PARA FRETE E CUBAGEM
    weight_kg: number; 
    length_cm: number;
    height_cm: number;
    width_cm: number;
}