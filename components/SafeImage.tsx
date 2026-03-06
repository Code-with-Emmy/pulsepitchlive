"use client";

import { useState } from "react";

interface SafeImageProps {
  src?: string;
  alt?: string;
  className: string;
  fallbackClassName?: string;
  loading?: "eager" | "lazy";
  hideOnError?: boolean;
}

export default function SafeImage({
  src,
  alt = "",
  className,
  fallbackClassName,
  loading = "lazy",
  hideOnError = false,
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);

  if (!src || failed) {
    if (hideOnError) {
      return null;
    }

    return (
      <span
        aria-hidden="true"
        className={fallbackClassName ?? `inline-block ${className} bg-slate-700`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        setFailedSrc(src);
      }}
    />
  );
}
