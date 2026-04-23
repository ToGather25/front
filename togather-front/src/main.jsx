import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChurchProvider } from "@/contexts/ChurchContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChurchProvider>
      <App />
    </ChurchProvider>
  </StrictMode>
);
