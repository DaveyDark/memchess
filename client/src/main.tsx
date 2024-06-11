import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SocketProvider } from "./context/SocketProvider.tsx";
import { GameStateProvider } from "./context/GameStateProvider.tsx";
import { HistoryProvider } from "./context/HistoryProvider.tsx";
import { SFXProvider } from "./context/SFXProvider.tsx";
import { ToastProvider } from "./context/ToastProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SFXProvider>
      <ToastProvider>
        <SocketProvider>
          <GameStateProvider>
            <HistoryProvider>
              <App />
            </HistoryProvider>
          </GameStateProvider>
        </SocketProvider>
      </ToastProvider>
    </SFXProvider>
  </React.StrictMode>,
);
