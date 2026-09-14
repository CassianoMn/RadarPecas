import { Link } from 'react-router-dom';
import { OfferCard } from '../components/ui';

export function HomePage() {
  return (
    <section>
      <h1>Ache a peça perto de você</h1>
      <p>Busque, compare preço e distância e veja se é compatível com sua moto.</p>
      <div className="actions">
        <Link className="btn" to="/busca">
          Buscar peças
        </Link>
        <Link className="btn btn-ghost" to="/garagem">
          Minha garagem
        </Link>
      </div>
      <div className="grid">
        <OfferCard title="Pastilha de freio" price="R$ 89,90" store="Moto Peças Centro" />
        <OfferCard title="Óleo 10W-30" price="R$ 42,50" store="Oficina do Bairro" />
      </div>
    </section>
  );
}
