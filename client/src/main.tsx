import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SocketProvider } from "./components/SocketProvider.tsx";
import { ToastProvider } from "./components/toasts/ToastProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SocketProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SocketProvider>
  </React.StrictMode>,
);
