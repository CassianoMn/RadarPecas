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

const SEED_RESPONSIVE_NAMES = new Set([
  'bateria-moto',
  'cabo-embreagem',
  'correia-cvt',
  'filtro-oleo',
  'honda-cg160-titan',
  'kit-relacao',
  'lampada-led-h4',
  'oleo-mobil-4t',
  'pastilha-freio',
  'pneu-traseiro',
  'vela-ignicao',
  'yamaha-fazer-fz25',
]);

function buildResponsiveSrcSet(url: string): string | undefined {
  const seedMatch = /^\/seed\/([a-z0-9-]+)\.webp$/i.exec(url.trim());
  if (seedMatch && SEED_RESPONSIVE_NAMES.has(seedMatch[1])) {
    const base = seedMatch[1];
    return `/seed/${base}-320.webp 320w, /seed/${base}.webp 640w`;
  }

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
  const srcSet = !isUsingFallback ? buildResponsiveSrcSet(effectiveSrc) : undefined;

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
