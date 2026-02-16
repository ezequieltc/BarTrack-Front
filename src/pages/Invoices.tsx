import { useEffect, useState } from 'react';
import api from '../lib/api';
import { TrendingUp, FileText, DollarSign } from 'lucide-react';

const Invoices = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/invoices')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Loading metrics...</div>;
    if (!data) return <div className="p-8 text-red-500">Error loading data or no data available.</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Sales Dashboard</h2>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Sales</div>
                        <div className="text-2xl font-bold">${data.totalSales}</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <FileText size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Total Invoices</div>
                        <div className="text-2xl font-bold">{data.totalOrders}</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Average Ticket</div>
                        <div className="text-2xl font-bold">
                            ${data.totalOrders > 0 ? (data.totalSales / data.totalOrders).toFixed(2) : 0}
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Recent Invoices (Closed Sessions)</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 font-medium">Session ID</th>
                            <th className="px-6 py-3 font-medium">Table</th>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.sessions.map((session: any) => (
                            <tr key={session.id}>
                                <td className="px-6 py-4">#{session.id}</td>
                                <td className="px-6 py-4">Table #{session.tableHistory?.number}</td>
                                <td className="px-6 py-4">{new Date(session.endTime).toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">${session.totalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.sessions.length === 0 && <div className="p-6 text-center text-gray-500">No invoices found.</div>}
            </div>
        </div>
    );
};

export default Invoices;
