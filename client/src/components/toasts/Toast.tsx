import { useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, Info } from "react-feather";

interface ToastProps {
  duration: number;
  content: string;
  type: "info" | "success" | "error" | "warning";
}

const Toast = ({ duration, type, content }: ToastProps) => {
  const self = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toastTImeout = setTimeout(() => {
      self.current?.remove();
    }, duration);

    return () => clearTimeout(toastTImeout);
  }, []);

  switch (type) {
    case "error":
      return (
        <div role="alert" className="alert alert-error z-50" ref={self}>
          <AlertCircle color="white" />
          <span className="text-white">{content}</span>
        </div>
      );
    case "success":
      return (
        <div role="alert" className="alert alert-success z-50" ref={self}>
          <CheckCircle color="white" />
          <span className="text-white">{content}</span>
        </div>
      );
    case "info":
      return (
        <div role="alert" className="alert alert-info z-50" ref={self}>
          <Info color="white" />
          <span className="text-white">{content}</span>
        </div>
      );
    case "warning":
      return (
        <div role="alert" className="alert alert-warning z-50" ref={self}>
          <AlertCircle color="white" />
          <span className="text-white">{content}</span>
        </div>
      );
  }
};

export default Toast;
