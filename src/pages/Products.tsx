import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    isActive: boolean;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '' });

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price || !newProduct.category) return;

        try {
            const res = await api.post('/products', newProduct);
            setProducts([...products, res.data]);
            setNewProduct({ name: '', price: '', category: '' });
        } catch (error) {
            console.error('Error creating product', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Products</h2>

            {/* Create Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Product Name"
                        />
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                            type="number"
                            value={newProduct.price}
                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={newProduct.category}
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">Select...</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Comidas">Comidas</option>
                            <option value="Postres">Postres</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={20} /> Add
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Category</th>
                            <th className="px-6 py-3 font-medium">Price</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
                        ) : products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4">{product.name}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold">${product.price}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
