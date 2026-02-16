import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const Orders = () => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We use the invoices endpoint as it provides the closed session history
        api.get('/invoices')
            .then(res => setSessions(res.data.sessions || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Loading history...</div>;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Order History (Closed Tables)</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 font-medium">Table</th>
                            <th className="px-6 py-3 font-medium">Opened At</th>
                            <th className="px-6 py-3 font-medium">Closed At</th>
                            <th className="px-6 py-3 font-medium text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-bold">Table {session.tableHistory?.number || '?'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(session.startTime).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {session.endTime ? new Date(session.endTime).toLocaleString() : 'Active'}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">
                                    ${session.totalAmount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sessions.length === 0 && <div className="p-6 text-center text-gray-500">No closed orders found.</div>}
            </div>
        </div>
    );
};

export default Orders;
