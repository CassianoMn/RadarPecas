import { Link } from 'react-router-dom';
import { Chip, OfferCard, StoreCard } from '../components/ui';

const CATEGORIES = ['Filtros', 'Pneus', 'Óleos', 'Freios', 'Relação'];

export function HomePage() {
  return (
    <section>
      <div className="searchbar">
        <span aria-hidden="true">⌕</span>
        <input type="search" placeholder="Buscar peças, marcas ou lojas..." aria-label="Buscar peças, marcas ou lojas" />
      </div>
      <div className="chips-row">
        {CATEGORIES.map((cat) => (
          <Chip key={cat}>{cat}</Chip>
        ))}
      </div>

      <h2 className="section-label">Lojas próximas em destaque</h2>
      <div className="grid">
        <StoreCard
          name="MotoPeças Central"
          distance="1.2 km · Centro"
          rating="4.8"
          reviews="212"
          tags={['Pneu Michelin', 'Óleo Motul']}
        />
        <StoreCard
          name="Duas Rodas Autoparts"
          distance="3.5 km · Zona Sul"
          rating="4.5"
          reviews="98"
          tags={['Garagem Compatível']}
        />
      </div>

      <h2 className="section-label">Ofertas para sua garagem</h2>
      <div className="grid">
        <OfferCard title="Pastilha de freio" price="R$ 89,90" store="MotoPeças Central" distance="1.2 km" />
        <OfferCard title="Óleo 10W-30" price="R$ 42,50" store="Oficina do Bairro" distance="3.5 km" />
      </div>

      <div className="actions">
        <Link className="btn" to="/busca">
          Buscar peças
        </Link>
        <Link className="btn btn-ghost" to="/garagem">
          Minha garagem
        </Link>
      </div>
    </section>
  );
}
