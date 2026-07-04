import { useRef, useState } from "react";
import type { DragEvent } from "react";

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  selectedFileName: string | null;
  disabled?: boolean;
}

export default function FileDropzone({ onFileSelected, selectedFileName, disabled }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${
        isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />

      <svg className="mb-3 h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v9"
        />
      </svg>

      {selectedFileName ? (
        <>
          <p className="text-sm font-semibold text-slate-900">{selectedFileName}</p>
          <p className="mt-1 text-xs text-slate-500">Click or drop a new file to replace it</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-900">Drag & drop your resume here</p>
          <p className="mt-1 text-xs text-slate-500">or click to browse — PDF or TXT, up to 8MB</p>
        </>
      )}
    </div>
  );
}
