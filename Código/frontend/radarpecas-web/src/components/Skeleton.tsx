import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-shimmer ${className}`.trim()}
      style={{
        display: 'block',
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <div className="product-card-img-wrap" style={{ padding: 0 }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </div>
      <div className="product-card-body">
        <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={18} style={{ marginBottom: 6 }} />
        <Skeleton width="65%" height={18} style={{ marginBottom: 12 }} />
        <Skeleton width="45%" height={24} style={{ marginBottom: 10 }} />
        <Skeleton width="75%" height={14} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={36} borderRadius="var(--radius)" style={{ marginTop: 'auto' }} />
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="store-catalog-card" aria-hidden="true">
      <div className="store-catalog-img-wrap" style={{ padding: 0 }}>
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </div>
      <div className="store-catalog-body">
        <Skeleton width="78%" height={20} style={{ marginBottom: 10 }} />
        <Skeleton width="35%" height={20} borderRadius="var(--radius-pill)" style={{ marginBottom: 12 }} />
        <Skeleton width="92%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="68%" height={14} style={{ marginBottom: 18 }} />
        <Skeleton width="100%" height={36} borderRadius="var(--radius)" style={{ marginTop: 'auto' }} />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} style={{ padding: '14px 16px' }}>
          <Skeleton width={idx === 0 ? '80%' : '60%'} height={16} />
        </td>
      ))}
    </tr>
  );
}

export function PageSkeleton() {
  return (
    <div className="content-wrap" aria-busy="true" aria-label="Carregando conteúdo">
      <Skeleton width="220px" height={28} style={{ marginBottom: 10 }} />
      <Skeleton width="320px" height={16} style={{ marginBottom: 24 }} />
      <div className="search-results-grid">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}
