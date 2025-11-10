// frontend/src/app/products/[id]/page.tsx
// Página do produto. Busca o produto por ID (server component) e renderiza
// com a imagem correta (suporta URLs relativas e externas).

import React from 'react';
import ShippingCalculator from '@/components/ShippingCalculator';
import ProductImage from '@/components/ProductImage';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const PLACEHOLDER_URL = 'https://placehold.co/600x600/e0e0e0/555555?text=Sem+Imagem';

type Props = {
    params: { id: string };
};

export default async function ProductPage(props: any) {
    // Conforme aviso do Next.js, `params` deve ser awaited antes de acessar suas propriedades
    // (props pode ser um Thenable no contexto do App Router HMR). Então aguardamos props.
    // Isso resolve o warning: `params should be awaited before using its properties`.
        // Alguns ambientes do App Router (HMR/dev) podem fornecer `props` como Thenable.
        // Usamos Promise.resolve(props) e await para garantir compatibilidade sem alterar a tipagem.
    const { params } = (await Promise.resolve(props)) as Props;
    const id = Number(params.id);
    if (isNaN(id)) {
        return <div className="p-6">ID inválido</div>;
    }

    try {
        const res = await fetch(`${BACKEND}/products/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            return <div className="p-6">Produto não encontrado.</div>;
        }

        const product = await res.json();

        // Normaliza URL da imagem: se começar com '/', prefixa com BACKEND
        let imageSrc = product.image_url || null;
        if (imageSrc && imageSrc.startsWith('/')) {
            imageSrc = `${BACKEND}${imageSrc}`;
        }

        if (!imageSrc) imageSrc = PLACEHOLDER_URL;

        return (
            <div className="max-w-5xl mx-auto p-6 mt-90">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="col-span-2 bg-white rounded-2xl p-6 shadow">
                                    <div className="w-full h-[560px] flex items-center justify-center overflow-hidden rounded-xl">
                                        <ProductImage
                                            src={imageSrc}
                                            alt={product.name || 'Produto'}
                                            className="w-full h-full object-contain"
                                            placeholder={PLACEHOLDER_URL}
                                        />
                                    </div>

                        <div className="mt-6">
                            <h1 className="text-2xl font-extrabold text-gray-900">{product.name}</h1>
                            <p className="text-[#9061FA] text-4xl font-extrabold mt-2">R$ {Number(product.price).toFixed(2)}</p>
                            <p className="text-gray-600 mt-4">{product.description}</p>
                        </div>
                    </div>

                    <aside className="col-span-1">
                        {/* ShippingCalculator é um componente cliente */}
                        <ShippingCalculator productId={id} productPrice={Number(product.price)} quantity={1} />
                    </aside>
                </div>
            </div>
        );
    } catch (err) {
        console.error('Erro ao carregar produto:', err);
        return <div className="p-6">Erro ao carregar produto.</div>;
    }
}