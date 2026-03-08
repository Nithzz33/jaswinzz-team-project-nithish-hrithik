import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import AssetRegister from "@/pages/AssetRegister";
import AddAsset from "@/pages/AddAsset";
import Categories from "@/pages/Categories";
import AuditWorkflow from "@/pages/AuditWorkflow";
import AuditScan from "@/pages/AuditScan";
import Reports from "@/pages/Reports";
import Reorder from "@/pages/Reorder";
import Products from "@/pages/Products";
import StockCheck from "@/pages/StockCheck";
import Sales from "@/pages/Sales";
import SalesReport from "@/pages/SalesReport";
import ActivityLog from "@/pages/ActivityLog";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";
import InventoryDashboard from "./pages/InventoryDashboard";
const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

const LoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory-dashboard" element={<InventoryDashboard />} />
              <Route path="/stock-check" element={<StockCheck />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales-report" element={<SalesReport />} />
              <Route path="/register" element={<AssetRegister />} />
              <Route path="/add-asset" element={<AddAsset />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/audit" element={<AuditWorkflow />} />
              <Route path="/audit/scan" element={<AuditScan />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reorder" element={<Reorder />} />
              <Route path="/activity-log" element={<ActivityLog />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
