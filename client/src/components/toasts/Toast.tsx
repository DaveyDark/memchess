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
    setTimeout(() => {
      self.current?.remove();
    }, duration);
  }, []);

  switch (type) {
    case "error":
      return (
        <div ref={self} className="toast z-50">
          <div role="alert" className="alert alert-error">
            <AlertCircle color="white" />
            <span className="text-white">{content}</span>
          </div>
        </div>
      );
    case "success":
      return (
        <div ref={self} className="toast z-50">
          <div role="alert" className="alert alert-success">
            <CheckCircle color="white" />
            <span className="text-white">{content}</span>
          </div>
        </div>
      );
    case "info":
      return (
        <div ref={self} className="toast z-50">
          <div role="alert" className="alert alert-info">
            <Info color="white" />
            <span className="text-white">{content}</span>
          </div>
        </div>
      );
    case "warning":
      return (
        <div ref={self} className="toast z-50">
          <div role="alert" className="alert alert-warning">
            <AlertCircle color="white" />
            <span className="text-white">{content}</span>
          </div>
        </div>
      );
  }
};

export default Toast;
