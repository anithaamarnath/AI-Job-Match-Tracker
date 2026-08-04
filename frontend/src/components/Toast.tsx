export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
}

export const Toast = ({ message, variant = "info", onClose }: ToastProps) => {
  return (
    <div className={`toast toast-${variant}`}>
      <span>{message}</span>

      <button type="button" className="toast-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};
