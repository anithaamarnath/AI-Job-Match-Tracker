import { useEffect, useState } from "react";
import axios from "axios";

import { getResumePreview } from "../api/resumesApi";
import { LoadingState } from "./LoadingState";

interface ResumePreviewProps {
  resumeId: string;
  fileName: string;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? "The resume preview could not be loaded."
    );
  }

  return "The resume preview could not be loaded.";
};

export const ResumePreview = ({ resumeId, fileName }: ResumePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const loadPreview = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const blob = await getResumePreview(resumeId);

        objectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setPreviewUrl(objectUrl);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPreview();

    return () => {
      isMounted = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resumeId]);

  if (isLoading) {
    return <LoadingState message="Loading resume preview..." />;
  }

  if (errorMessage) {
    return (
      <div className="preview-error" role="alert">
        <h2>Preview unavailable</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!previewUrl) {
    return null;
  }

  return (
    <section className="resume-preview-panel">
      <div className="resume-preview-header">
        <div>
          <p className="page-eyebrow">Document preview</p>

          <h2>{fileName}</h2>
        </div>

        <a href={previewUrl} target="_blank" rel="noreferrer">
          Open in new tab
        </a>
      </div>

      <iframe
        className="resume-preview-frame"
        src={previewUrl}
        title={`Preview of ${fileName}`}
      />
    </section>
  );
};
