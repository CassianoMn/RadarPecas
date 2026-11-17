import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  totalCount?: number;
  loading?: boolean;
  children: ReactNode;
}

export function FilterSheet({
  open,
  onClose,
  totalCount,
  loading = false,
  children,
}: FilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }

    if (dialog.open) {
      dialog.close();
    }
    return undefined;
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id="mobile-filter-sheet"
      className="filter-sheet-dialog"
      aria-labelledby="filter-sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="filter-sheet-header">
        <h2 id="filter-sheet-title" style={{ margin: 0, fontSize: '1.15rem' }}>
          Filtros
        </h2>
        <button
          type="button"
          className="filter-sheet-close"
          onClick={onClose}
          aria-label="Fechar filtros"
        >
          <X size={20} />
        </button>
      </div>

      <div className="filter-sheet-scroll">{children}</div>

      <div className="filter-sheet-footer">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onClose}
          aria-live="polite"
          style={{ minHeight: 48, fontSize: '0.92rem' }}
        >
          {loading
            ? 'Atualizando resultados...'
            : totalCount != null
              ? `Ver resultados (${totalCount})`
              : 'Ver resultados'}
        </button>
      </div>
    </dialog>
  );
}
