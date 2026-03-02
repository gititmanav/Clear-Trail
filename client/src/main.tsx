import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@context/AuthContext";
import App from "./App";
import "@styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: "0.875rem",
              borderRadius: "8px",
              padding: "12px 16px",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
