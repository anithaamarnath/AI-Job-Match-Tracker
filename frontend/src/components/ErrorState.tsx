interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="state-card error-state" role="alert">
      <h2>Unable to load data</h2>
      <p>{message}</p>

      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
};
