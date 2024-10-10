import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
