import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="narrow">
      <h1>Página não encontrada</h1>
      <Link className="btn" to="/">
        Voltar ao início
      </Link>
    </section>
  );
}
