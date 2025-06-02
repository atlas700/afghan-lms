"use client";

import "react-quill/dist/quill.bubble.css";

interface PreviewProps {
  value: string;
  className?: string;
}

export const Preview = ({ value, className = "" }: PreviewProps) => {
  return (
    <div
      className={`ql-editor ql-bubble ${className}`}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};
