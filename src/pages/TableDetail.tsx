import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ShoppingCart, FileText, DollarSign } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    priceAtOrder: number;
}

interface Order {
    id: number;
    items: OrderItem[];
    createdAt: string;
}

interface TableSession {
    id: number;
    startTime: string;
    totalAmount: number;
    orders: Order[];
}

interface Table {
    id: number;
    number: number;
    status: 'FREE' | 'OCCUPIED' | 'DISABLED';
    currentSession: TableSession | null;
}

const TableDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [table, setTable] = useState<Table | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTable = async () => {
        try {
            const res = await api.get(`/tables/${id}`);
            console.log(res.data);
            setTable(res.data);

            const productsRes = await api.get('/products');
            setProducts(productsRes.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Error loading table');
        } finally {
            setLoading(false);
        }
    };

    // We need to poll or re-fetch to get order details. 
    // Actually, I should update the backend to support GET /api/tables/:id

    useEffect(() => {
        fetchTable();
    }, [id]);

    const handleOpenTable = async () => {
        try {
            await api.post(`/tables/${id}/open`);
            fetchTable();
        } catch (error) {
            console.error(error);
        }
    };

    const closeTable = async () => {
        if (!confirm('Close table and generate invoice?')) return;
        try {
            const res = await api.post(`/tables/${id}/close`, {}, { responseType: 'blob' });

            // Check if response is actually JSON error
            if (res.data.type === 'application/json') {
                const text = await res.data.text();
                const json = JSON.parse(text);
                alert('Error closing table: ' + (json.error || 'Unknown error'));
                return;
            }

            // Download PDF
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-table-${table?.number}.pdf`);
            document.body.appendChild(link);
            link.click();
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to close table or generate PDF.');
        }
    };

    const addToOrder = async (productId: number) => {
        if (!table || !table.currentSession) return;

        try {
            await api.post(`/orders/table/${table.id}`, {
                items: [{ productId, quantity: 1 }]
            });
            // Refresh table data to show new item
            fetchTable();
        } catch (error) {
            console.error('Error adding item to order:', error);
            alert('Failed to add item');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading table...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;
    if (!table) return <div className="p-8 text-center text-red-500">Table not found (No data)</div>;

    // Calculate total from session
    const currentTotal = table.currentSession?.totalAmount || 0;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        Table {table.number}
                        <span className={`px-3 py-1 rounded-full text-sm ${table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {table.status}
                        </span>
                    </h2>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        Back to Tables
                    </button>
                    {table.status === 'FREE' ? (
                        <button onClick={handleOpenTable} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                            Open Table
                        </button>
                    ) : (
                        <button
                            onClick={closeTable}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <DollarSign size={20} /> Close Table
                        </button>
                    )}
                </div>
            </div>

            {table.status === 'OCCUPIED' && (
                <div className="flex flex-1 overflow-hidden gap-6">
                    {/* LEFT: Menu - Takes more space */}
                    <div className="flex-[2] bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-bold text-lg">Menu</h3>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start">
                            {products.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToOrder(product.id)}
                                    className="p-4 border dark:border-gray-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between h-32 shadow-sm"
                                >
                                    <span className="font-bold text-lg leading-tight text-left text-gray-800 dark:text-white">{product.name}</span>
                                    <div className="w-full flex justify-between items-end mt-2">
                                        <span className="text-gray-500 text-xs uppercase tracking-wide">{product.category}</span>
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">${product.price}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Current Order - Fixed width or smaller ratio */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden border-l-4 border-indigo-500">
                        <div className="p-4 border-b dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-900 dark:text-white">
                                <FileText size={20} /> Current Order
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            {!table.currentSession || !table.currentSession.orders || table.currentSession.orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                                    <ShoppingCart size={48} className="mb-2" />
                                    <span className="text-sm italic">Empty Order</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {table.currentSession.orders.flatMap(order =>
                                        order.items.map(item => (
                                            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white text-lg">{item.product.name}</span>
                                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white text-lg">
                                                    ${item.priceAtOrder * item.quantity}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-900 text-white mt-auto">
                            <div className="flex justify-between items-center text-2xl font-bold">
                                <span>Total</span>
                                <span>${currentTotal}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableDetail;
