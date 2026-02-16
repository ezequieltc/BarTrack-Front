import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Coffee, UtensilsCrossed, Receipt } from 'lucide-react';

const Layout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Tables', icon: <LayoutDashboard size={20} /> },
        { path: '/products', label: 'Products', icon: <Coffee size={20} /> },
        { path: '/orders', label: 'Orders', icon: <UtensilsCrossed size={20} /> },
        { path: '/invoices', label: 'Invoices', icon: <Receipt size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">BarTrack</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
