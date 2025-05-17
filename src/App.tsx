import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { AddProductPage } from '@/pages/AddProductPage';
import { EditProductPage } from '@/pages/EditProductPage';
// import { Navbar } from '@/components/layout/Navbar'; // Navbar is included in each page for now

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      {/* If a global Navbar is desired, place it here */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/add-product" element={<AddProductPage />} />
        <Route path="/product/:productId/edit" element={<EditProductPage />} />
        {/* Default fallback for any other route, could be a 404 page */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
