interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div className="state-card" role="status">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};
