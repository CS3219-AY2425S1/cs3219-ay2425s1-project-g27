import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { AuthProvider } from "./contextProviders/AuthContext";
import { ToastProvider } from "./contextProviders/ToastProvider";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  );
}
