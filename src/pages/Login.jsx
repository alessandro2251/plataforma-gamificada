// src/pages/Login.jsx
import { useState } from "react";
import { useStudy } from "../hooks/useStudy";
import { Loader2, Mail, Lock, X, ShieldCheck, UserCircle } from "lucide-react";
import { cn } from "../utils/cn";

export function Login() {
  const { login } = useStudy();

  // Estado para controlar qual modal está aberto: null | 'admin' | 'student'
  const [activeModal, setActiveModal] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const closeModal = () => {
    setActiveModal(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLoginSubmission = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Faz o fetch de todos os utilizadores para validação de cargo prévia ou via context
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`);
      const users = await response.json();

      const foundUser = users.find(
        (u) => u.email === email && u.password === password,
      );

      if (!foundUser) {
        setError("Credenciais inválidas. Verifique o email e a senha.");
        setIsLoading(false);
        return;
      }

      // 2. Validação de Cargo (Role-Lock)
      if (activeModal === "admin" && foundUser.role !== "admin") {
        setError(
          "Sua conta é uma conta de aluno, faça login utilizando o menu correto.",
        );
        setIsLoading(false);
        return;
      }

      if (activeModal === "student" && foundUser.role !== "student") {
        setError(
          "Sua conta é uma conta de administrador, faça login utilizando o menu correto.",
        );
        setIsLoading(false);
        return;
      }

      // 3. Se passou nas validações, chama o login do contexto
      await login(email, password);
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-vapor-dark relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full"></div>

      <div className="z-10 text-center space-y-2">
        <h1 className="text-5xl font-black text-white tracking-tighter italic">
          ACADEMY<span className="text-neon-pink">WAVE</span>
        </h1>
        <p className="text-gray-400 uppercase tracking-[0.3em] text-sm">
          Portal de Acesso
        </p>
      </div>

      <div className="z-10 flex flex-col md:flex-row gap-6">
        {/* Botão Entrar como ADMIN */}
        <button
          onClick={() => setActiveModal("admin")}
          className="flex items-center gap-3 px-8 py-4 font-bold text-white rounded-xl bg-neon-purple shadow-neon-purple hover:opacity-80 transition-all active:scale-95 group">
          <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          PAINEL DO PROFESSOR
        </button>

        {/* Botão Entrar como ALUNO */}
        <button
          onClick={() => setActiveModal("student")}
          className="flex items-center gap-3 px-8 py-4 font-bold text-gray-900 rounded-xl bg-neon-blue shadow-neon-blue hover:opacity-80 transition-all active:scale-95 group">
          <UserCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          PAINEL DO ALUNO
        </button>
      </div>

      {/* MODAL DE LOGIN */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={cn(
              "relative w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300",
              activeModal === "admin" ? "bg-vapor-surface" : "bg-vapor-surface",
            )}>
      
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-2 rounded-t-2xl",
                activeModal === "admin" ? "bg-neon-purple" : "bg-neon-blue",
              )}></div>

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-1">
                Login {activeModal === "admin" ? "Administrativo" : "do Aluno"}
              </h2>
              <p className="text-sm text-gray-400">
                Insira as suas credenciais para continuar
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-neon-pink/10 border border-neon-pink text-neon-pink text-xs font-bold animate-in shake duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmission} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-900 border border-vapor-border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-purple transition-colors"
                    placeholder="exemplo@academywave.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900 border border-vapor-border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-purple transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-4 font-black rounded-xl transition-all disabled:opacity-50",
                  activeModal === "admin"
                    ? "bg-neon-purple text-white hover:shadow-neon-purple/40 shadow-lg"
                    : "bg-neon-blue text-gray-900 hover:shadow-neon-blue/40 shadow-lg",
                )}>
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "ENTRAR NA PLATAFORMA"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
