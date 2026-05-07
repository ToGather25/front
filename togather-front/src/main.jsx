import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChurchProvider } from "@/contexts/ChurchContext";
import { SearchProvider } from "@/contexts/SearchContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChurchProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </ChurchProvider>
  </StrictMode>
);
