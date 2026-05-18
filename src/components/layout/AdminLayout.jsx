// src/components/layout/AdminLayout.jsx
import { LayoutDashboard, Library, LogOut, Users, Target } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useStudy } from "../../hooks/useStudy";

export function AdminLayout({ children }) {
  const { logout } = useStudy();

  // Mapeamento dos Links para facilitar a iteração em ambas as barras (Sidebar e BottomBar)
  const navLinks = [
    {
      to: "/",
      icon: <Users className="w-5 h-5 md:w-6 md:h-6" />,
      label: "Alunos",
    },
    {
      to: "/gerenciar-disciplinas",
      icon: <Library className="w-5 h-5 md:w-6 md:h-6" />,
      label: "Disciplinas",
    },
    {
      to: "/gerenciar-desafios",
      icon: <Target className="w-5 h-5 md:w-6 md:h-6" />,
      label: "Desafios",
    },
  ];

  return (
    // md:flex -> Ativa a sidebar ao lado no desktop. No mobile, os blocos ficam soltos.
    <div className="md:flex min-h-screen font-sans bg-vapor-dark text-gray-100 overflow-hidden">
      {/* ========================================== */}
      {/* 1. SIDEBAR (Apenas Desktop - md:flex) */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 p-6 border-r border-vapor-border bg-vapor-surface gap-8 shrink-0 h-screen sticky top-0">
        <div className="text-2xl font-black text-white tracking-tighter italic">
          ACADEMY<span className="text-neon-pink">WAVE</span>
        </div>

        <nav className="flex flex-col flex-1 gap-2 mt-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-vapor-dark text-neon-purple border border-neon-purple/50"
                    : "text-gray-400 hover:text-white hover:bg-vapor-dark",
                )
              }>
              {link.icon}
              <span className="font-semibold">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 text-gray-400 transition-colors rounded-lg hover:text-neon-pink hover:bg-vapor-dark mt-auto">
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Sair da Conta</span>
        </button>
      </aside>

      {/* ========================================== */}
      {/* 2. HEADER E CONTEÚDO PRINCIPAL (MAIN) */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden flex justify-between items-center p-4 bg-vapor-dark/90 backdrop-blur-sm border-b border-vapor-border/30 shrink-0 z-40 relative">
          <div className="text-xl font-black text-white tracking-tighter italic">
            ACADEMY<span className="text-neon-pink">WAVE</span>
          </div>

          <button
            onClick={logout}
            className="p-2 text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
            title="Sair do Painel Admin">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>

      {/* ========================================== */}
      {/* 3. BOTTOM BAR NAVIGATION (Apenas Mobile) */}
      {/* ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-vapor-dark/95 backdrop-blur-md border-t border-vapor-border/50 flex justify-around items-center p-3 pb-safe z-50">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-1",
                isActive
                  ? "text-neon-purple"
                  : "text-gray-400 hover:text-gray-300",
              )
            }>
            {link.icon}
            <span className="text-[10px] font-bold tracking-wide uppercase">
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
