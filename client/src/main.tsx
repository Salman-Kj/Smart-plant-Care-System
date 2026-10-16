import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" storageKey="smart-plant-care-theme" enableSystem>
    <App />
  </ThemeProvider>
);
