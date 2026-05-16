// src/components/layout/StudentLayout.jsx
import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Calendar,
  Flame,
  LogOut,
  User,
  Upload,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useStudy } from "../../hooks/useStudy";

// ==========================================
// FUNÇÕES UTILITÁRIAS DE TEMPO
// ==========================================
const getLocalTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysDiff = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return 999;
  const [y1, m1, d1] = dateStr1.split("-");
  const [y2, m2, d2] = dateStr2.split("-");

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);

  return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
};

// ==========================================
// LÓGICA DE GAMIFICAÇÃO DO AVATAR (CORES OTIMIZADAS)
// ==========================================
const getStreakBorderClass = (streak) => {
  if (!streak || streak === 0) return "border-transparent border-2";

  // Estágios 1 e 2: Azul Neon (Ciano)
  if (streak === 1)
    return "border-2 border-neon-blue/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]";
  if (streak === 2)
    return "border-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.6)]";

  // Estágios 3 e 4: Violeta / Roxo Escuro (Bem distinto do rosa)
  if (streak === 3)
    return "border-2 border-[#8b5cf6] shadow-[0_0_16px_rgba(139,92,246,0.6)]";
  if (streak === 4)
    return "border-2 border-[#a855f7] shadow-[0_0_22px_rgba(168,85,247,0.8)]";

  // Estágios 5 e 6: Rosa Choque / Rose (Puxado para o vermelho)
  if (streak === 5)
    return "border-2 border-[#ec4899] shadow-[0_0_25px_rgba(236,72,153,0.8)]";
  if (streak === 6)
    return "border-2 border-[#f43f5e] shadow-[0_0_30px_rgba(244,63,94,1)]";

  // Estágio 7+: Laranja / Fogo
  return "border-2 border-[#f97316] shadow-[0_0_35px_rgba(249,115,22,1)] animate-pulse";
};

export function StudentLayout({ children }) {
  const { currentUser, logout } = useStudy();
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAndSyncStreak = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await fetch(
          `http://localhost:3001/users/${currentUser.id}`,
          { cache: "no-store" }, // <-- Anti-cache nativo
        );
        if (!response.ok) throw new Error("Usuário não encontrado.");

        const data = await response.json();

        setUserData((prev) => {
          if (!prev) return data;
          return { ...data, avatar: data.avatar || prev.avatar };
        });
      } catch (error) {
        console.error("Erro ao sincronizar dados no layout:", error);
      }
    };

    fetchAndSyncStreak();

    const handleStreakUpdate = () => fetchAndSyncStreak();

    window.addEventListener("streakUpdated", handleStreakUpdate);
    window.addEventListener("rewardClaimed", handleStreakUpdate);

    return () => {
      window.removeEventListener("streakUpdated", handleStreakUpdate);
      window.removeEventListener("rewardClaimed", handleStreakUpdate);
    };
  }, [currentUser]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 150;
          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;
          const ctx = canvas.getContext("2d");

          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;

          ctx.drawImage(img, x, y, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);

          setUserData((prev) => {
            if (!prev) return prev;
            return { ...prev, avatar: compressedBase64 };
          });

          try {
            await fetch(`http://localhost:3001/users/${currentUser.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ avatar: compressedBase64 }),
            });
          } catch (error) {
            console.error("Erro ao salvar o avatar no banco:", error);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // AVALIAÇÃO DA BORDA (SEGURO CONTRA TIMEZONE)
  // ==========================================
  let effectiveStreakForBorder = userData?.currentStreak || 0;
  const lastClaimStr = userData?.lastRewardClaimDate;
  const todayStr = getLocalTodayString();

  if (lastClaimStr) {
    const diffDays = getDaysDiff(lastClaimStr, todayStr);

    if (diffDays > 1) {
      effectiveStreakForBorder = 0;
    }
  }

  // Links de Navegação extraídos para reutilização (Sidebar Desktop e BottomBar Mobile)
  const navLinks = [
    {
      to: "/",
      icon: <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />,
      label: "Dashboard",
    },
    {
      to: "/disciplinas",
      icon: <BookOpen className="w-5 h-5 md:w-6 md:h-6" />,
      label: "Disciplinas",
    },
    {
      to: "/recompensas",
      icon: <Calendar className="w-5 h-5 md:w-6 md:h-6" />,
      label: "Recompensas",
    },
  ];

  return (
    // md:flex = No mobile os elementos ficam soltos, no desktop vira flex (Sidebar ao lado)
    <div className="md:flex min-h-screen font-sans bg-vapor-dark text-gray-100 overflow-hidden">
      {/* ========================================== */}
      {/* 1. SIDEBAR (Apenas Desktop - md:flex) */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-64 p-6 border-r border-vapor-border bg-vapor-surface gap-8 shrink-0 h-screen sticky top-0">
        <div className="text-2xl font-black text-white tracking-tighter italic">
          ACADEMY<span className="text-neon-pink">WAVE</span>
        </div>

        <nav className="flex flex-col flex-1 gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-vapor-dark text-neon-blue border border-neon-blue/50"
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
          <span className="font-semibold">Sair</span>
        </button>
      </aside>

      {/* ========================================== */}
      {/* 2. ÁREA PRINCIPAL E HEADER RESPONSIVO */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER TOP (Mobile e Desktop) */}
        <header className="flex justify-between md:justify-end items-center p-4 md:p-6 bg-vapor-dark/90 backdrop-blur-sm border-b border-vapor-border/30 shrink-0 z-40 relative">
          {/* Logo Mobile (Só aparece no celular) */}
          <div className="md:hidden text-xl font-black text-white tracking-tighter italic">
            ACADEMY<span className="text-neon-pink">WAVE</span>
          </div>

          <div className="relative ml-auto">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />

            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-tight">
                  {userData?.name || "Aluno"}
                </p>
                <p className="text-xs text-neon-blue font-medium flex items-center justify-end gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Nível{" "}
                  {effectiveStreakForBorder > 7
                    ? "Máximo"
                    : effectiveStreakForBorder}
                </p>
              </div>

              {/* Box da imagem do avatar responsivo */}
              <div
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 bg-vapor-surface flex items-center justify-center rounded-lg transition-all duration-700 ease-in-out overflow-hidden relative",
                  getStreakBorderClass(effectiveStreakForBorder),
                )}>
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Foto de Perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-vapor-surface border border-vapor-border rounded-xl shadow-2xl shadow-neon-blue/10 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                <div className="p-3 border-b border-vapor-border/50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Conta de {userData?.name?.split(" ")[0] || "Aluno"}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-vapor-dark rounded-lg transition-colors"
                    onClick={() => {
                      fileInputRef.current.click();
                      setIsDropdownOpen(false);
                    }}>
                    <Upload className="w-4 h-4 text-neon-blue" />
                    Alterar Avatar
                  </button>
                  {/* Botão Sair no Dropdown (Super útil pro Mobile) */}
                  <button
                    className="md:hidden w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}>
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 3. CONTEÚDO SCROLLÁVEL (As páginas Dashboard, Subjects, etc) */}
        {/* pb-24 é necessário no mobile para que o Menu Inferior não esconda o conteúdo do fim da tela */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </main>

      {/* ========================================== */}
      {/* 4. BOTTOM BAR NAVIGATION (Apenas Mobile) */}
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
                  ? "text-neon-blue"
                  : "text-gray-400 hover:text-gray-300",
              )
            }>
            {link.icon}
            <span className="text-[10px] font-bold tracking-wide">
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
