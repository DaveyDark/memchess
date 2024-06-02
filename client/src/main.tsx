import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastProvider } from "./components/toasts/ToastProvider.tsx";
import { SocketProvider } from "./context/SocketProvider.tsx";
import { GameStateProvider } from "./context/GameStateProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <SocketProvider>
        <GameStateProvider>
          <App />
        </GameStateProvider>
      </SocketProvider>
    </ToastProvider>
  </React.StrictMode>,
);
