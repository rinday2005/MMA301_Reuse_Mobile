import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartWishlistProvider } from "./context/CartWishlistContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartWishlistProvider>
          <App />
        </CartWishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);