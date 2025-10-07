import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPageNew from './pages/ContactsPageNew';
import BlastPageNew from './pages/BlastPageNew';
import CampaignsPage from './pages/CampaignsPage';
import SettingsPage from './pages/SettingsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/contacts" element={<PrivateRoute><ContactsPageNew /></PrivateRoute>} />
          <Route path="/blast" element={<PrivateRoute><BlastPageNew /></PrivateRoute>} />
          <Route path="/campaigns" element={<PrivateRoute><CampaignsPage /></PrivateRoute>} />
          <Route path="/whatsapp" element={<PrivateRoute><WhatsAppPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
