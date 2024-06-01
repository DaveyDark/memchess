import { ReactNode, createContext, useContext, useState } from "react";
import Toast from "./Toast";
import { IToast } from "../../types";

const ToastContext = createContext<(toast: IToast) => void>(() => {});

export const useToaster = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const createToast = (toast: IToast) => {
    setToasts((prev) => [...prev, toast]);
  };

  return (
    <ToastContext.Provider value={createToast}>
      {children}
      <div className="toast">
        {toasts?.map((t, i) => (
          <Toast
            content={t.content}
            duration={t.duration}
            type={t.type}
            key={i}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
