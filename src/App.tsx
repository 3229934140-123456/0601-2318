import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from '@/store';
import MainLayout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Monitor from "@/pages/Monitor";
import FarmDetail from "@/pages/FarmDetail";
import AlertCenter from "@/pages/AlertCenter";
import Forecast from "@/pages/Forecast";
import Approval from "@/pages/Approval";
import Reports from "@/pages/Reports";
import System from "@/pages/System";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppStore();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const { user } = useAppStore();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitor" element={<Monitor />} />
          <Route path="farm/:id" element={<FarmDetail />} />
          <Route path="alert" element={<AlertCenter />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="approval" element={<Approval />} />
          <Route path="report" element={<Reports />} />
          <Route path="system/users" element={<System />} />
          <Route path="system/dict" element={<System />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
