interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <h2 id="confirm-modal-title">{title}</h2>

        <p id="confirm-modal-description">{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="modal-cancel-button"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};
