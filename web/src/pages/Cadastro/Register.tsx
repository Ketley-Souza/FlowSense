export default function Register() {
  return (
    <div className="h-screen bg-gradient-to-r from-[#cfd5df] to-[#e4e7ec] flex items-center justify-center">

      <div className="bg-white w-[350px] p-8 rounded-xl shadow-[0_5px_20px_rgba(0,0,0,0.1)] text-center">

        <h2 className="text-xl font-semibold mb-1">
          Crie sua conta
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          Preencha os dados abaixo para começar
        </p>

        {/* AVATAR */}
        <div className="mb-5">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-2xl relative">
            <span></span>

            {/* BOTÃO EM CIMA DO CÍRCULO */}
            <button className="absolute bottom-0 right-0 bg-[#5a4bff] text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:opacity-90">
              +
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Clique no ícone para adicionar foto
          </p>
        </div>

        {/* FORM */}
        <form className="flex flex-col gap-2">

          <input
            type="text"
            placeholder="Seu nome completo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="text"
            placeholder="usuario123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="email"
            placeholder="nome@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#5a4bff] focus:ring-2 focus:ring-[#5a4bff]/10 outline-none"
          />

          <button className="w-full mt-3 py-3 bg-[#5a4bff] text-white rounded-lg text-sm hover:bg-[#4838d1] transition">
            Criar conta
          </button>

        </form>

        <p className="mt-4 text-sm text-gray-500">
          Já tem uma conta?{" "}
          <a href="/" className="text-[#5a4bff] font-medium">
            Entrar
          </a>
        </p>

      </div>
    </div>
  );
}