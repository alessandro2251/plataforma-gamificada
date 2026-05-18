// src/pages/Rewards.jsx
import { useState, useEffect } from "react";
import { useStudy } from "../hooks/useStudy";
import { Flame, Gift, Check, PartyPopper } from "lucide-react";
import { cn } from "../utils/cn";

// ==========================================
// FUNÇÕES UTILITÁRIAS DE TEMPO 
// ==========================================
const getLocalTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // Ex: "2026-05-15" no fuso local
};

const getDaysDiff = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return 999;
  const [y1, m1, d1] = dateStr1.split("-");
  const [y2, m2, d2] = dateStr2.split("-");

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);

  return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
};

export function Rewards() {
  const { currentUser } = useStudy();
  const [userData, setUserData] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${currentUser.id}`,
        );
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Erro ao buscar dados de recompensa:", err);
      }
    };
    fetchUserData();
  }, [currentUser]);

  const handleClaimReward = async () => {
    if (!userData) return;

    const todayStr = getLocalTodayString();

    // TRAVA DE SEGURANÇA: Apenas 1 resgate por dia
    if (userData.lastRewardClaimDate === todayStr) {
      return;
    }

    let baseStreak = userData.currentStreak || 0;
    const lastClaimStr = userData.lastRewardClaimDate;

    if (lastClaimStr) {
      const diffDays = getDaysDiff(lastClaimStr, todayStr);

      // Se passou mais de 1 dia desde o último resgate, quebrou a ofensiva antes de resgatar o de hoje
      if (diffDays > 1) {
        baseStreak = 0;
      }
    }

    // O resgate SOMA a ofensiva!
    const newStreak = baseStreak + 1;
    const newMaxStreak = Math.max(userData.maxStreak || 0, newStreak);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userData.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastRewardClaimDate: todayStr,
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
          }),
        },
      );

      const updatedUser = await response.json();
      setUserData(updatedUser);

      // Feedback Visual
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Avisa o Avatar no StudentLayout para evoluir
      window.dispatchEvent(new Event("rewardClaimed"));
    } catch (err) {
      console.error("Erro ao resgatar recompensa:", err);
    }
  };

  if (!userData) return null;

  // ==========================================
  // MATEMÁTICA TEMPORAL DO CALENDÁRIO
  // ==========================================
  const todayStr = getLocalTodayString();
  const lastClaimStr = userData.lastRewardClaimDate;
  let displayStreak = userData.currentStreak || 0;
  let hasClaimedToday = false;

  if (lastClaimStr) {
    const diffDays = getDaysDiff(lastClaimStr, todayStr);

    if (diffDays === 0) {
      hasClaimedToday = true;
    } else if (diffDays > 1) {
      // Punição por ociosidade visual
      displayStreak = 0;
    }
  }

  const activeIndex = Math.min(
    hasClaimedToday ? Math.max(0, displayStreak - 1) : displayStreak,
    6,
  );

  const weekDays = [
    "Dia 1",
    "Dia 2",
    "Dia 3",
    "Dia 4",
    "Dia 5",
    "Dia 6",
    "Dia 7+",
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      {/* Toast Vaporwave de Sucesso */}
      {showToast && (
        <div className="fixed bottom-10 right-10 z-50 bg-vapor-surface border border-neon-pink rounded-xl p-4 shadow-[0_0_30px_rgba(255,0,255,0.4)] animate-in slide-in-from-bottom-5 fade-in flex items-center gap-4">
          <div className="bg-neon-pink/20 p-2 rounded-lg">
            <PartyPopper className="w-6 h-6 text-neon-pink" />
          </div>
          <div>
            <h4 className="text-white font-black tracking-widest uppercase text-sm">
              Parabéns!
            </h4>
            <p className="text-neon-blue font-medium text-xs">
              Você Manteve Sua Ofensiva!
            </p>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-4xl font-bold text-white mb-2">
          Recompensas e Ofensiva
        </h1>
        <p className="text-gray-400">
          Faça o check-in diário para evoluir a borda do seu perfil!
        </p>
      </header>

      <section className="bg-gradient-to-br from-vapor-surface to-vapor-dark p-8 rounded-2xl border border-neon-pink/30 shadow-[0_0_20px_rgba(255,0,255,0.15)] flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <Flame
            className={cn(
              "w-24 h-24 transition-all duration-700",
              hasClaimedToday
                ? "text-neon-pink animate-pulse"
                : "text-gray-600 grayscale",
            )}
          />
          {hasClaimedToday && (
            <div className="absolute inset-0 blur-xl bg-neon-pink/20 rounded-full z-[-1]"></div>
          )}
        </div>
        <h2 className="text-5xl font-black text-white mb-2">
          {displayStreak} Dias
        </h2>
        <p className="text-xl text-gray-300 font-medium uppercase tracking-widest">
          Ofensiva Atual
        </p>
      </section>

      <section className="bg-vapor-surface p-6 rounded-2xl border border-vapor-border">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Gift className="w-6 h-6 text-neon-blue" /> Check-in Diário
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const isToday = index === activeIndex;
            const isPast = index < activeIndex;

            const isCompleted = isPast || (isToday && hasClaimedToday);
            const isPendingClaim = isToday && !hasClaimedToday;

            return (
              <div
                key={day}
                onClick={isPendingClaim ? handleClaimReward : undefined}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border transition-all h-32",
                  isCompleted &&
                    "bg-vapor-dark border-neon-blue/30 text-neon-blue shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]",
                  isPendingClaim &&
                    "bg-vapor-dark border-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.4)] text-neon-pink scale-105 cursor-pointer hover:bg-neon-pink/10",
                  !isPast &&
                    !isToday &&
                    "bg-vapor-dark/50 border-vapor-border text-gray-600",
                )}>
                <span className="text-sm font-bold uppercase mb-3">{day}</span>

                {isCompleted ? (
                  <Check className="w-8 h-8 text-neon-blue" />
                ) : isPendingClaim ? (
                  <div className="relative">
                    <Gift className="w-8 h-8 animate-bounce text-neon-pink" />
                    <div className="absolute inset-0 bg-neon-pink blur-md opacity-50 rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-600"></div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
