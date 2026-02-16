import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';

interface Table {
    id: number;
    number: number;
    status: 'FREE' | 'OCCUPIED' | 'DISABLED';
    currentSessionId: number | null;
}

const Dashboard = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [isManageMode, setIsManageMode] = useState(false);

    const fetchTables = async () => {
        try {
            const res = await api.get('/tables');
            // Filter out disabled tables unless in manage mode? 
            // Better to show them as dimmed in manage mode, and hide in normal mode.
            setTables(res.data);
        } catch (error) {
            console.error('Error fetching tables', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleCreateTable = async () => {
        const numberStr = prompt('Enter new table number:');
        if (!numberStr) return;
        const number = parseInt(numberStr);
        if (isNaN(number)) {
            alert('Invalid number');
            return;
        }

        try {
            await api.post('/tables', { number });
            fetchTables();
        } catch (error) {
            alert('Error creating table (maybe number exists?)');
        }
    };

    const toggleTableStatus = async (table: Table) => {
        const newStatus = table.status === 'DISABLED' ? 'FREE' : 'DISABLED';
        if (!confirm(`Mark Table ${table.number} as ${newStatus}?`)) return;

        try {
            await api.put(`/tables/${table.id}/status`, { status: newStatus });
            fetchTables();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const visibleTables = isManageMode ? tables : tables.filter(t => t.status !== 'DISABLED');
    // Sort tables by number
    visibleTables.sort((a, b) => a.number - b.number);

    if (loading) return <div className="p-8">Loading tables...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Floor Plan</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsManageMode(!isManageMode)}
                        className={`px-4 py-2 rounded font-medium ${isManageMode ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                    >
                        {isManageMode ? 'Exit Manage Mode' : 'Manage Tables'}
                    </button>
                    {isManageMode && (
                        <button
                            onClick={handleCreateTable}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold shadow-sm"
                        >
                            + Add Table
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleTables.map((table) => (
                    <div key={table.id} className="relative group">
                        <Link
                            to={`/table/${table.id}`}
                            className={`p-6 rounded-xl shadow-lg border-2 transition-transform hover:scale-105 cursor-pointer flex flex-col items-center justify-center h-48 w-full ${table.status === 'FREE' ? 'bg-white border-green-400 dark:bg-gray-800' :
                                table.status === 'OCCUPIED' ? 'bg-red-50 border-red-400 dark:bg-gray-800' :
                                    'bg-gray-200 border-gray-400 opacity-75' // DISABLED
                                }`}
                            onClick={(e) => {
                                if (isManageMode && table.status === 'DISABLED') e.preventDefault();
                            }}
                        >
                            <span className="text-4xl font-bold mb-2">#{table.number}</span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${table.status === 'FREE' ? 'bg-green-100 text-green-700' :
                                    table.status === 'OCCUPIED' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-400 text-white'
                                    }`}
                            >
                                {table.status}
                            </span>
                        </Link>

                        {isManageMode && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleTableStatus(table);
                                }}
                                className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {table.status === 'DISABLED' ? 'Enable' : 'Disable'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {visibleTables.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                    No tables found. {isManageMode && "Click 'Add Table' to create one."}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
