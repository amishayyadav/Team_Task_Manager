import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import App from "./App";
import { queryClient } from "@/lib/queryClient";
import AuthBootstrap from "@/components/auth/AuthBootstrap";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthBootstrap>
        <Toaster richColors position="top-right" closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
