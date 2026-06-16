import { ToastContainer } from "react-toastify";
import { AuthProvider } from "../features/auth/AuthContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        newestOnTop
        theme="light"
        toastClassName="!rounded-xl !font-sans"
      />
    </AuthProvider>
  );
}
