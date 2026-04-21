
import "./Register.css";

export default function Register() {
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Crie sua conta</h2>
        <p className="subtitle">
          Preencha os dados abaixo para começar
        </p>

        <div className="avatar">
          <div className="circle">
            <span>  </span>
          </div>
          <button className="upload-btn"> uppar fotoo </button> 
        
          <p>Clique no ícone para adicionar foto</p>
        </div>

        <form>
          <input type="text" placeholder="Seu nome completo" />
          <input type="text" placeholder="usuario123" />
          <input type="email" placeholder="nome@email.com" />
          <input type="password" placeholder="Senha" />
          <input type="password" placeholder="Confirmar senha" />

          <button className="btn-primary">Criar conta</button>
        </form>

        <p className="login-link">
          Já tem uma conta? <a href="/">Entrar</a>
        </p>
      </div>
    </div>
  );
}