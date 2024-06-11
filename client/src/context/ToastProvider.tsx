import { ReactNode, createContext, useContext, useState } from "react";
import { IToast } from "../types";
import Toast from "../components/Toast";
import { useSFX } from "./SFXProvider";

const ToastContext = createContext<(toast: IToast) => void>(() => {});

export const useToaster = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<IToast[]>([]);
  const sfx = useSFX();

  const createToast = (toast: IToast) => {
    setToasts((prev) => [...prev, toast]);
    sfx.play("alert");
  };

  return (
    <ToastContext.Provider value={createToast}>
      {children}
      <div className="toast z-50">
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
