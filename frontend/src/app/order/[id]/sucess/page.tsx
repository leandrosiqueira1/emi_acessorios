//frontend/src/app/order/[id]/sucess
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, XCircle, Truck, MapPin, Package, CreditCard } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// Interface para os dados que esperamos do Backend
interface OrderItem {
    quantity: number;
    unit_price: string;
    product_name: string;
    image_url: string;
}

interface OrderData {
    id: number;
    total_amount: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address_json: {
        zip: string;
        street: string;
        number: string;
        city: string;
        // Adicione outros campos do seu endereço aqui
    };
    shipping_cost: string;
    payment_method: string;
    tracking_code: string | null;
    created_at: string; // ISO string
    items: OrderItem[];
}


export default function OrderSuccessPage() {
    const params = useParams();
    const orderId = params.id as string;
    
    const [order, setOrder] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const BACKEND_URL = `${BACKEND}/orders/${orderId}`;


    useEffect(() => {
        if (!orderId || !token) {
            setError("Pedido inválido ou token de autenticação ausente.");
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await fetch(BACKEND_URL, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}` 
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Falha ao carregar os detalhes do pedido.');
                }
                
                // O JSONB do endereço deve ser tratado
                data.shipping_address_json = typeof data.shipping_address_json === 'string' 
                    ? JSON.parse(data.shipping_address_json) 
                    : data.shipping_address_json;

                setOrder(data);
            } catch (err: any) {
                console.error("Erro ao buscar pedido:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, token, BACKEND_URL]);


    const StatusIcon = useMemo(() => {
        if (!order) return Clock;
        switch (order.status) {
            case 'paid':
            case 'delivered':
                return CheckCircle;
            case 'cancelled':
                return XCircle;
            default:
                return Clock;
        }
    }, [order]);

    const statusMap: Record<OrderData['status'], { text: string, color: string }> = {
        pending: { text: "Pagamento Pendente", color: "text-yellow-600" },
        paid: { text: "Pagamento Confirmado", color: "text-green-600" },
        shipped: { text: "Enviado", color: "text-blue-600" },
        delivered: { text: "Entregue", color: "text-indigo-600" },
        cancelled: { text: "Cancelado", color: "text-red-600" },
    };

    if (isLoading) {
        return <div className="max-w-xl mx-auto p-6 text-center py-20">Carregando detalhes do pedido...</div>;
    }

    if (error || !order) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center py-20">
                <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-red-700">Erro ao carregar pedido</h1>
                <p className="text-gray-600 mt-2">{error}</p>
            </div>
        );
    }

    const currentStatus = statusMap[order.status] || { text: 'Status Desconhecido', color: 'text-gray-500' };

    return (
        <div className="max-w-5xl mx-auto p-6 pt-10">
            <div className="text-center mb-8">
                <StatusIcon size={64} className={`mx-auto mb-3 ${currentStatus.color}`} />
                <h1 className="text-3xl font-extrabold text-[#9061FA]">
                    Pedido #{order.id} Concluído!
                </h1>
                <p className="text-xl font-semibold mt-2">{currentStatus.text}</p>
                <p className="text-gray-500 text-sm">Realizado em: {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Coluna 1: Detalhes do Pedido e Itens */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Status e Rastreio */}
                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800"><Truck size={20}/> Entrega & Rastreio</h2>
                        <p className="text-lg font-semibold">Custo do Frete: R$ {parseFloat(order.shipping_cost).toFixed(2)}</p>
                        
                        <div className="mt-3 p-3 bg-gray-100 rounded">
                            <span className="font-medium text-gray-700">
                                {order.tracking_code ? (
                                    <>
                                        Código de Rastreio: 
                                        <a 
                                            href={`https://rastreio.com/${order.tracking_code}`} // Substitua pelo link real
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 ml-2 hover:underline"
                                        >
                                            {order.tracking_code}
                                        </a>
                                    </>
                                ) : (
                                    "O código de rastreio será disponibilizado assim que o pedido for enviado."
                                )}
                            </span>
                        </div>
                    </div>
                    
                    {/* Itens do Pedido */}
                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><Package size={20}/> Itens Comprados</h2>
                        <ul className="space-y-4">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        {/* Imagem (Se disponível) */}
                                        <img 
                                            src={item.image_url || "/placeholder.png"} 
                                            alt={item.product_name} 
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-semibold">{item.product_name}</p>
                                            <p className="text-sm text-gray-600">Qtd: {item.quantity} | Unitário: R$ {parseFloat(item.unit_price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg">
                                        R$ {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Coluna 2: Endereço e Resumo Total */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Endereço de Entrega */}
                    <div className="bg-white p-5 rounded-lg shadow-xl border border-mini-roxo/30 sticky top-24">
                        <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-800"><MapPin size={20}/> Endereço de Entrega</h2>
                        <p className="font-medium">{order.shipping_address_json?.street}, {order.shipping_address_json?.number}</p>
                        <p className="text-gray-600">{order.shipping_address_json?.city} - CEP: {order.shipping_address_json?.zip}</p>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="bg-white p-5 rounded-lg shadow-xl border border-mini-roxo/30">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800"><CreditCard size={20}/> Resumo do Pagamento</h2>
                        
                        <div className="space-y-1 text-gray-700 mb-4 border-b pb-3">
                            {/* Calculando o subtotal no frontend para fins de exibição */}
                            {(() => {
                                const subtotal = order.items.reduce((acc, item) => 
                                    acc + (parseFloat(item.unit_price) * item.quantity), 0
                                );
                                const total = parseFloat(order.total_amount);
                                const frete = parseFloat(order.shipping_cost);
                                const desconto = subtotal + frete - total;

                                return (
                                    <>
                                        <div className="flex justify-between"><span>Subtotal dos Itens:</span><span>R$ {subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span>Frete:</span><span>R$ {frete.toFixed(2)}</span></div>
                                        {desconto > 0.01 && (
                                            <div className="flex justify-between text-green-600 font-medium"><span>Desconto:</span><span>- R$ {desconto.toFixed(2)}</span></div>
                                        )}
                                        <div className="flex justify-between pt-2 text-xl font-bold text-[#9061FA]">
                                            <span>Total Final Pago:</span>
                                            <span>R$ {total.toFixed(2)}</span>
                                        </div>
                                        <p className="pt-2 text-sm">Método: <span className="uppercase font-medium">{order.payment_method}</span></p>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}