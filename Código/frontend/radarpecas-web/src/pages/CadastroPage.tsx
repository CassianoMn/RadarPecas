import { Link } from 'react-router-dom';

export function CadastroPage() {
  return (
    <section className="narrow">
      <h1>Criar conta</h1>
      <p>O cadastro completo vem no TODO 12. Por enquanto use a API ou o login.</p>
      <p>
        Já tem conta? <Link className="link" to="/login">Entrar</Link>
      </p>
    </section>
  );
}
