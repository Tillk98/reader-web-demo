import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Reader from "./Reader.jsx";
import "./reader.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Reader />
  </StrictMode>,
);
