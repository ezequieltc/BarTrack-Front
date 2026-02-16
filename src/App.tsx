import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import TableDetail from './pages/TableDetail';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="table/:id" element={<TableDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
