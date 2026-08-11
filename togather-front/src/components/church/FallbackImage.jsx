import { useState } from "react";

export default function FallbackImage({ src, alt, className, fallback }) {
  const [error, setError] = useState(false);
  if (!src || error) return fallback;
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}
