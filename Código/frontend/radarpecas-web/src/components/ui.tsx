import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Button({
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="btn" {...rest}>
      {children}
    </button>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Card({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <div>{children}</div>
      {footer ? <div className="card-footer">{footer}</div> : null}
    </article>
  );
}

export function OfferCard({
  title,
  price,
  store,
}: {
  title: string;
  price: string;
  store: string;
}) {
  return (
    <Card
      title={title}
      footer={
        <Link className="link" to="/busca">
          Ver oferta
        </Link>
      }
    >
      <p>
        <strong>{price}</strong> · {store}
      </p>
    </Card>
  );
}

export function Loading({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="state" role="status">
      {text}
    </div>
  );
}

export function EmptyState({ text = 'Nada por aqui ainda.' }: { text?: string }) {
  return <div className="state">{text}</div>;
}

export function ErrorState({
  text = 'Algo deu errado. Tente de novo.',
  onRetry,
}: {
  text?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state state-error" role="alert">
      <p>{text}</p>
      {onRetry ? (
        <button className="btn" type="button" onClick={onRetry}>
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}
