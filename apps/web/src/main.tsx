import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { bootTheme } from "@codellyson/justui/boot";
import App from "./App";
import "./styles/global.css";

// Apply the user's stored theme/mode to <html> before React's first
// paint. Stamps window.__JUSTUI__ so useTheme() in React components
// knows which localStorage keys to read/write. Default is espresso/dark
// (configured inside @codellyson/justui).
bootTheme({ keyPrefix: "justanotetaker" });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
