"use client";
import React, { useState, useCallback } from 'react';

// 1. Tipos de dados (poderiam ser movidos para src/types/product.ts)
interface ProductOption {
    label: string;
    value: string; // Representa o código da cor ou nome
    hex: string;  // Código hexadecimal para visualização
}

// 2. Dados Fictícios (Isto viria de uma API ou de Props)
const COR_OPTIONS: ProductOption[] = [
    { label: 'Branco', value: 'branco', hex: '#FFFFFF' },
    { label: 'Preto', value: 'preto', hex: '#000000' },
    { label: 'Vermelho', value: 'vermelho', hex: '#FF0000' },
    { label: 'Marrom Café', value: 'marrom-cafe', hex: '#6F4E37' },
];

const PRECO_POR_METRO = 5.90; // R$/Metro

/**
 * Componente React para exibição e seleção do produto Tira de Napa.
 */
const ProdutoFitaNapa: React.FC = () => {
    // Estados para gerenciar a seleção do usuário
    const [selectedColor, setSelectedColor] = useState<string>(COR_OPTIONS[0].value);
    const [quantity, setQuantity] = useState<number>(1);
    
    // Calcula o valor total com base na quantidade
    const totalValue = (quantity * PRECO_POR_METRO).toFixed(2);
    
    // Handler para a mudança da quantidade
    const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        // Garante que a quantidade seja um número positivo
        setQuantity(value > 0 ? value : 1);
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            
            {/* Título e Imagem (Componentes separados seriam ideais) */}
            <div style={{ display: 'flex', gap: '40px' }}>
                {/* Imagem (Mock) */}
                <div style={{ flex: '1' }}>
                    <div style={{ 
                        width: '100%', 
                        height: '300px', 
                        backgroundColor: '#eee', 
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px'
                    }}>
                        [Imagem da Tira de Napa]
                    </div>
                </div>

                {/* Detalhes e Controles */}
                <div style={{ flex: '1' }}>
                    <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>
                        Tira de Napa 10mm no Metro - Ref. 5007
                    </h1>
                    <p style={{ color: '#555', fontSize: '14px' }}>
                        <strong>Material:</strong> Napa Sintética | <strong>Largura:</strong> 10mm
                    </p>

                    <hr style={{ margin: '15px 0' }}/>
                    
                    {/* Preço */}
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '16px', margin: 0, color: '#888' }}>Preço por Metro:</p>
                        <strong style={{ fontSize: '32px', color: '#000' }}>
                            R$ {PRECO_POR_METRO.toFixed(2)}
                        </strong>
                        <span style={{ fontSize: '18px', color: '#555', marginLeft: '10px' }}>/ Metro</span>
                    </div>

                    {/* Seleção de Cor */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                            COR: {COR_OPTIONS.find(c => c.value === selectedColor)?.label}
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {COR_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    title={option.label}
                                    onClick={() => setSelectedColor(option.value)}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        backgroundColor: option.hex,
                                        border: `2px solid ${selectedColor === option.value ? '#333' : '#ccc'}`,
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Seleção de Quantidade */}
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="quantity" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                            QUANTIDADE (Metros)
                        </label>
                        <input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={handleQuantityChange}
                            style={{ padding: '8px', width: '80px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    
                    {/* Resumo e Botão Comprar */}
                    <div style={{ 
                        borderTop: '1px solid #eee', 
                        paddingTop: '15px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px'
                    }}>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                            Total: R$ {totalValue}
                        </p>
                        <button
                            onClick={() => alert(`Adicionado ${quantity}m de ${selectedColor} ao carrinho!`)}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: '#9061FA',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            ADICIONAR AO CARRINHO
                        </button>
                    </div>

                </div>
            </div>

            {/* Descrição do Produto (área abaixo) */}
            <div style={{ marginTop: '40px' }}>
                <h2>Descrição</h2>
                <p>Esta tira de napa sintética de 10mm é ideal para acabamentos, alças de bolsas, cintos finos e trabalhos artesanais. Vendida por metro para maior flexibilidade em seus projetos.</p>
            </div>
        </div>
    );
};

export default ProdutoFitaNapa;
