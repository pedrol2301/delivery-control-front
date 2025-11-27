import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deliverers from './pages/Deliverers';
import DelivererLogin from './pages/DelivererLogin';
import DelivererDeliveries from './pages/DelivererDeliveries';
import DelivererMap from './pages/DelivererMap';
import ChangePassword from './pages/ChangePassword';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, userType } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect deliverers to their own dashboard
  if (userType === 'deliverer') {
    return <Navigate to="/deliverer/deliveries" />;
  }

  return children;
}

function DelivererPrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, userType } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/deliverer/login" />;
  }

  // Redirect regular users to their dashboard
  if (userType === 'user') {
    return <Navigate to="/" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/deliverer/login" element={<DelivererLogin />} />
      <Route
        path="/deliverer/change-password"
        element={
          <DelivererPrivateRoute>
            <ChangePassword />
          </DelivererPrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/deliverers"
        element={
          <PrivateRoute>
            <Deliverers />
          </PrivateRoute>
        }
      />
      <Route
        path="/deliverer/deliveries"
        element={
          <DelivererPrivateRoute>
            <DelivererDeliveries />
          </DelivererPrivateRoute>
        }
      />
      <Route
        path="/deliverer/map"
        element={
          <DelivererPrivateRoute>
            <DelivererMap />
          </DelivererPrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
