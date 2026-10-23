import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CloudUpload, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';
import { refreshPublicContent } from '../../lib/publicApi';

export interface UploadedImage {
  url: string;
  publicId: string;
}

interface ImageUploaderProps {
  /** Current image URL (from the server or a previously uploaded file). */
  value?: string;
  /** Called with the uploaded asset (or cleared with null). */
  onChange: (image: UploadedImage | null) => void;
  /** Hint shown under the drop zone. */
  hint?: string;
  /** Max file size in megabytes. */
  maxMB?: number;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPT_ATTR = 'image/jpeg,image/png,image/webp';

/** Turn an upload failure into a short, actionable inline message. */
function getUploadErrorMessage(error: unknown, maxMB: number): string {
  const status = (error as { response?: { status?: number } })?.response?.status;

  if (status === 503) {
    return 'Image uploads are not configured on the server yet. Paste an image URL below instead.';
  }
  if (status === 413) {
    return `This image is too large. Please use a file under ${maxMB} MB.`;
  }
  if (status === 415) {
    return 'Only JPG, PNG and WebP images are allowed.';
  }
  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (!(error as { response?: unknown })?.response) {
    return 'Network error — check your connection and try again, or paste an image URL below.';
  }
  return getApiErrorMessage(error, 'Upload failed. Please try again or paste an image URL below.');
}

/**
 * Drag-and-drop image uploader with client-side validation, live preview
 * and real upload progress (POST /api/admin/upload → Cloudinary).
 */
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  hint = 'Recommended 1920x900 px, JPG/WEBP, under 300 KB',
  maxMB = 10,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Revoke object URLs on unmount / change to avoid leaks.
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        const message = 'Only JPG, PNG and WebP images are allowed';
        setErrorMessage(message);
        toast.error(message);
        return;
      }
      if (file.size > maxMB * 1024 * 1024) {
        const message = `File is too large (max ${maxMB} MB)`;
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setErrorMessage(null);

      // Local preview while uploading
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      const objectUrl = URL.createObjectURL(file);
      previewUrlRef.current = objectUrl;
      setLocalPreview(objectUrl);

      const formData = new FormData();
      formData.append('image', file);

      setIsUploading(true);
      setProgress(0);

      try {
        const res = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
          },
        });
        const { url, publicId } = res.data.data as UploadedImage;
        onChange({ url, publicId });
        refreshPublicContent(queryClient);
        setErrorMessage(null);
        toast.success('Image uploaded');
      } catch (error) {
        setLocalPreview(null);
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        const message = getUploadErrorMessage(error, maxMB);
        setErrorMessage(message);
        toast.error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [maxMB, onChange, queryClient]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void uploadFile(file);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      handleFiles(event.dataTransfer.files);
    },
    [disabled, isUploading, handleFiles]
  );

  const clear = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setLocalPreview(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = '';
    onChange(null);
  };

  const previewSrc = localPreview || value || null;

  return (
    <div>
      {previewSrc ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={previewSrc}
            alt="Upload preview"
            className="w-full h-44 object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
              <div className="w-48 h-1.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-white font-semibold">{progress}%</span>
            </div>
          )}
          {!isUploading && !disabled && (
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 p-2 rounded-lg bg-white/90 text-slate-600 hover:text-red-600 shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled && !isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !disabled && !isUploading) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-2 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isDragging
              ? 'border-amber-400 bg-amber-50'
              : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/40'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          aria-label="Upload image"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">Uploading… {progress}%</p>
            </>
          ) : (
            <>
              {isDragging ? (
                <ImagePlus className="w-7 h-7 text-amber-500" />
              ) : (
                <CloudUpload className="w-7 h-7 text-slate-400" />
              )}
              <p className="text-sm font-semibold text-slate-600">
                {isDragging ? 'Drop it here' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-[11px] text-slate-400">JPG, PNG or WebP · max {maxMB} MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {errorMessage && (
        <p className="mt-2 text-[11px] font-semibold text-red-500" role="alert">
          {errorMessage}
        </p>
      )}
      <p className="mt-2 text-[11px] text-slate-400">{hint}</p>
    </div>
  );
};

export default ImageUploader;
