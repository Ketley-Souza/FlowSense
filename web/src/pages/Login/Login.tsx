import "./Login.css";

export default function Login() {
  return (
    <div className="login-page">
      <div className="container">

        {/* ESQUERDA */}
        <div className="left">
          <h1>Bem-vindo de volta!</h1>

          <p>
            Acesse sua conta e continue sua jornada conosco.
            Gerencie seus projetos, conecte-se com sua equipe e alcance seus objetivos.
          </p>

          <div className="start">
            <span>→</span>
            <span>Seu sucesso começa aqui</span>
          </div>
        </div>

        {/* DIREITA */}
        <div className="right">
          <div className="form-box">
            <h2>Entrar</h2>
            <p className="subtitle">Entre na sua conta para continuar</p>

            <label>Email</label>
            <div className="input-group">
              <span className="icon">✉</span>
              <input type="email" placeholder="seu@email.com" />
            </div>

            <label>Senha</label>
            <div className="input-group">
              <span className="icon">🔒︎</span>
              <input type="password" placeholder="••••••••" />
            </div>

            <a href="#" className="forgot">Esqueceu a senha?</a>

            <button className="btn-login">Entrar</button>

            <div className="divider">
              <span>ou continue com</span>
            </div>

            <button className="btn-google">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                alt="google"
              />
              <span>Entrar com Google</span>
            </button>

            <p className="signup">
              Não tem uma conta? <a href="#">Criar conta</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}