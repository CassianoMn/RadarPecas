import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

interface SmartImageProps {
  src?: string | null;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  fallback?: string;
}

const DEFAULT_FALLBACK = '/placeholder-peca.svg';
const DEFAULT_SIZES = '(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 300px';

function buildUnsplashSrcSet(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('images.unsplash.com')) {
      return undefined;
    }
    const widths = [320, 640, 960];
    return widths
      .map((w) => {
        const clone = new URL(parsed.toString());
        clone.searchParams.set('w', String(w));
        clone.searchParams.set('q', '75');
        clone.searchParams.set('auto', 'format');
        return `${clone.toString()} ${w}w`;
      })
      .join(', ');
  } catch {
    return undefined;
  }
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  sizes = DEFAULT_SIZES,
  priority = false,
  fallback = DEFAULT_FALLBACK,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const effectiveSrc = !src || failed ? fallback : src;
  const isUsingFallback = !src || failed;
  const srcSet = !isUsingFallback ? buildUnsplashSrcSet(effectiveSrc) : undefined;

  return (
    <img
      src={effectiveSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      data-fallback={isUsingFallback ? 'true' : undefined}
      onError={() => {
        if (!failed) {
          setFailed(true);
        }
      }}
    />
  );
}
