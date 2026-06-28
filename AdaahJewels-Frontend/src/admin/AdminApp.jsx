import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminThemeProvider } from './context/ThemeContext';
import AdminRouter from './AdminRouter';

/**
 * Main Admin Application Component
 * Wraps admin panel with necessary providers
 */
export const AdminApp = () => {
  return (
    <Router>
      <AdminThemeProvider>
        <AdminAuthProvider>
          <Routes>
            <Route path="/*" element={<AdminRouter />} />
          </Routes>
        </AdminAuthProvider>
      </AdminThemeProvider>
    </Router>
  );
};

export default AdminApp;
