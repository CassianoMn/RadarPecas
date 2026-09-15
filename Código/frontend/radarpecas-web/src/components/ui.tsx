import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

export function Button({ variant = 'primary', block = false, ...rest }: ButtonProps) {
  const classes = ['btn', variant === 'ghost' && 'btn-ghost', variant === 'outline' && 'btn-outline', block && 'btn-block']
    .filter(Boolean)
    .join(' ');
  return <button className={classes} {...rest} />;
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

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  action?: ReactNode;
}

export function InputWithIcon({ icon, action, ...rest }: InputWithIconProps) {
  return (
    <div className="input-wrap">
      <span className="input-icon" aria-hidden="true">
        {icon}
      </span>
      <input className="input" {...rest} />
      {action}
    </div>
  );
}

export function Chip({
  children,
  variant,
}: {
  children: ReactNode;
  variant?: 'promo' | 'muted';
}) {
  const classes = ['chip', variant === 'promo' && 'chip-promo', variant === 'muted' && 'chip-muted']
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
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
  distance,
  compatible = true,
}: {
  title: string;
  price: string;
  store: string;
  distance: string;
  compatible?: boolean;
}) {
  return (
    <Card
      title={title}
      footer={
        <Link className="btn btn-outline" to="/busca">
          Ver Detalhes
        </Link>
      }
    >
      <div className="chips-row">
        {compatible ? <Chip>Compativel</Chip> : null}
        <Chip variant="muted">{distance}</Chip>
      </div>
      <p className="price">{price}</p>
      <p className="store-line">{store}</p>
    </Card>
  );
}

export function StoreCard({
  name,
  distance,
  rating,
  reviews,
  tags,
}: {
  name: string;
  distance: string;
  rating: string;
  reviews: string;
  tags: string[];
}) {
  return (
    <Card
      title={name}
      footer={
        <Link className="btn btn-outline" to="/lojas">
          Ver Estoque
        </Link>
      }
    >
      <div className="chips-row">
        <Chip variant="muted">{distance}</Chip>
        <span className="rating">
          {'★'} {rating} <span className="store-line">({reviews})</span>
        </span>
      </div>
      <div className="chips-row">
        {tags.map((tag) => (
          <Chip key={tag} variant="muted">
            {tag}
          </Chip>
        ))}
      </div>
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
        <Button type="button" onClick={onRetry}>
          Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}
