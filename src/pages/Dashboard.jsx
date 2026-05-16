// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "../hooks/useStudy";
import {
  Flame,
  Trophy,
  Zap,
  Loader2,
  AlertCircle,
  Target,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

// ==========================================
// FUNÇÕES UTILITÁRIAS À PROVA DE TIMEZONE
// ==========================================
const getDaysDifference = (lastDateStr) => {
  if (!lastDateStr) return 999;
  const cleanDate = lastDateStr.split("T")[0]; // "YYYY-MM-DD"
  const [y, m, d] = cleanDate.split("-").map(Number);
  const lastDate = new Date(y, m - 1, d);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
};

// Verifica se a data cai na semana atual (Domingo a Sábado local)
const isCurrentWeek = (dateStr) => {
  if (!dateStr) return false;
  const cleanDate = dateStr.split("T")[0];
  const [y, m, d] = cleanDate.split("-").map(Number);
  const recordDate = new Date(y, m - 1, d); // Meia-noite exata local

  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Volta para o Domingo

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Avança para o Sábado
  endOfWeek.setHours(23, 59, 59, 999);

  return recordDate >= startOfWeek && recordDate <= endOfWeek;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, subjects } = useStudy();

  const [isChallengeDoneToday, setIsChallengeDoneToday] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState("idle");

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);

  const [visualStreak, setVisualStreak] = useState(0);
  const [visualMaxStreak, setVisualMaxStreak] = useState(0);

  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [weeklyChallengeScore, setWeeklyChallengeScore] = useState(null);
  const WEEKLY_GOAL = 5;

  const challengeSubjectTitle = useMemo(() => {
    if (!dailyChallenge || !subjects) return "Módulo Geral";
    const matchedSubject = subjects.find(
      (s) => String(s.id) === String(dailyChallenge.subjectId),
    );
    return matchedSubject ? matchedSubject.title : "Módulo Geral";
  }, [dailyChallenge, subjects]);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!currentUser?.id) return;
      try {
        const response = await fetch(
          `http://localhost:3001/users/${currentUser.id}`,
        );
        if (!response.ok) throw new Error("Falha ao buscar dados do usuário");
        const userData = await response.json();
        setVisualStreak(userData.currentStreak || 0);
        setVisualMaxStreak(userData.maxStreak || 0);
      } catch (err) {
        console.error("Erro ao sincronizar ofensiva no Dashboard:", err);
      }
    };

    fetchStreak();
    window.addEventListener("rewardClaimed", fetchStreak);

    return () => {
      window.removeEventListener("rewardClaimed", fetchStreak);
    };
  }, [currentUser]);

  const initializeDashboard = async () => {
    if (!currentUser) return;

    try {
      const todayStr = new Date().toISOString().split("T")[0];

      const historyRes = await fetch(
        `http://localhost:3001/completed_challenges?userId=${currentUser.id}`,
      );
      if (!historyRes.ok) throw new Error("Erro ao buscar histórico.");
      const historyData = await historyRes.json();

      // Progressão Semanal
      let completedThisWeek = 0;
      historyData.forEach((record) => {
        if (isCurrentWeek(record.completionDate)) {
          completedThisWeek++;
        }
      });
      setWeeklyProgress(completedThisWeek);

      // Verificação de Prova Semanal
      const weeklyCompRes = await fetch(
        `http://localhost:3001/completed_weekly_challenges?userId=${currentUser.id}`,
      );
      if (weeklyCompRes.ok) {
        const weeklyCompData = await weeklyCompRes.json();
        const currentWeeklyClaim = weeklyCompData.find((record) =>
          isCurrentWeek(record.completionDate),
        );

        if (currentWeeklyClaim) {
          setWeeklyChallengeScore(currentWeeklyClaim.score);
        } else {
          setWeeklyChallengeScore(null);
        }
      }

      // QUEBRA DE OFENSIVA VISUAL
      if (historyData.length > 0) {
        const sortedHistory = [...historyData].sort(
          (a, b) => new Date(b.completionDate) - new Date(a.completionDate),
        );
        const lastChallengeDate = sortedHistory[0].completionDate;
        const diffDays = getDaysDifference(lastChallengeDate);

        if (diffDays > 1 && currentUser.currentStreak > 0) {
          setVisualStreak(0);
          fetch(`http://localhost:3001/users/${currentUser.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentStreak: 0 }),
          }).catch((err) => console.error("Erro no reset silencioso:", err));
        }
      }

      const doneToday = historyData.some((record) =>
        record.completionDate.startsWith(todayStr),
      );
      setIsChallengeDoneToday(doneToday);

      if (!doneToday) {
        const challengesRes = await fetch(`http://localhost:3001/challenges`);
        const allChallenges = await challengesRes.json();
        const completedIds = historyData.map((record) => record.challengeId);

        const eligibleChallenges = allChallenges.filter((c) =>
          currentUser.completedSubjectIds.includes(c.subjectId),
        );
        const unseenChallenges = eligibleChallenges.filter(
          (c) => !completedIds.includes(c.id),
        );

        let availableChallenge = null;
        if (unseenChallenges.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * unseenChallenges.length,
          );
          availableChallenge = unseenChallenges[randomIndex];
        }
        setDailyChallenge(availableChallenge);
      } else {
        setDailyChallenge(null);
      }
    } catch (err) {
      console.error("Falha na sincronização:", err);
      setError("Não foi possível sincronizar com o JSON Server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    initializeDashboard();

    window.addEventListener("challengeCompleted", initializeDashboard);
    return () =>
      window.removeEventListener("challengeCompleted", initializeDashboard);
  }, [currentUser]);

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    if (selectedOption === dailyChallenge.correctAnswer) setFeedback("success");
    else setFeedback("error");
  };

  const handleFinalizeChallenge = async () => {
    if (!currentUser || !dailyChallenge) return;
    setIsCompleting(true);

    try {
      await fetch("http://localhost:3001/completed_challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `comp-${Date.now()}`,
          userId: currentUser.id,
          challengeId: dailyChallenge.id,
          completionDate: new Date().toISOString(),
        }),
      });

      setIsChallengeDoneToday(true);
      setIsModalOpen(false);
      setFeedback("idle");
      setSelectedOption(null);

      window.dispatchEvent(new Event("challengeCompleted"));
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
      alert("Ocorreu um erro ao salvar o seu progresso. Verifique a conexão.");
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-neon-blue animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest uppercase">
          Sincronizando Banco de Dados...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-6 bg-neon-pink/10 border border-neon-pink text-neon-pink rounded-xl animate-in fade-in">
        <AlertCircle className="w-8 h-8" />
        <span className="font-bold">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Painel do Aluno
          </h1>
          <p className="text-gray-400">
            Bem-vindo de volta,{" "}
            <span className="text-neon-blue font-medium">
              {currentUser?.name}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-4 bg-vapor-dark border border-vapor-border p-3 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 px-4 border-r border-vapor-border">
            <Flame
              className={cn(
                "w-8 h-8 transition-all duration-700",
                isChallengeDoneToday
                  ? "text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] scale-110"
                  : "text-gray-600 grayscale",
              )}
            />
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Ofensiva
              </p>
              <p className="text-2xl font-black text-white leading-none">
                {visualStreak}{" "}
                <span className="text-sm text-gray-500">dias</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4">
            <Trophy className="w-6 h-6 text-neon-purple opacity-80" />
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Recorde
              </p>
              <p className="text-xl font-bold text-gray-300 leading-none">
                {visualMaxStreak}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD DESAFIO DIÁRIO */}
        <div
          className={cn(
            "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-500",
            isChallengeDoneToday
              ? "bg-vapor-surface/50 border-neon-blue/20"
              : "bg-vapor-dark border-neon-blue/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]",
          )}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  isChallengeDoneToday
                    ? "bg-gray-800 text-gray-500"
                    : "bg-neon-blue/10 text-neon-blue",
                )}>
                {isChallengeDoneToday ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Zap className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-xl font-bold text-white">Desafio Diário</h3>
            </div>
            <p className="text-gray-400 mb-6">
              {isChallengeDoneToday
                ? "Você já concluiu seu desafio hoje. Volte amanhã para um novo desafio!"
                : !dailyChallenge
                  ? "Você concluiu todos os desafios disponíveis para as disciplinas em que se formou."
                  : "Responda a uma pergunta rápida sobre as disciplinas que você já estudou para fixar seu conhecimento."}
            </p>
          </div>

          <Button
            variant={
              isChallengeDoneToday || !dailyChallenge ? "secondary" : "primary"
            }
            onClick={() => setIsModalOpen(true)}
            disabled={isChallengeDoneToday || !dailyChallenge}
            className="w-full flex items-center justify-center gap-2">
            {isChallengeDoneToday
              ? "Concluído Hoje"
              : !dailyChallenge
                ? "Sem Desafios Disponíveis"
                : "Responder Desafio"}
          </Button>
        </div>

        {/* CARD DESAFIO SEMANAL */}
        <div
          className={cn(
            "p-6 rounded-2xl border flex flex-col justify-between transition-all duration-500",
            weeklyChallengeScore !== null
              ? "bg-vapor-dark border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.2)] animate-in fade-in"
              : weeklyProgress >= WEEKLY_GOAL
                ? "bg-vapor-dark border-neon-purple shadow-[0_0_20px_rgba(176,38,255,0.2)]"
                : "bg-vapor-dark border-neon-purple/30 opacity-70 grayscale",
          )}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  weeklyChallengeScore !== null
                    ? "bg-neon-blue/20 text-neon-blue"
                    : "bg-neon-purple/20 text-neon-purple",
                )}>
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Desafio Semanal</h3>
            </div>

            <p className="text-gray-400 mb-6">
              {weeklyChallengeScore !== null
                ? `Você acertou ${weeklyChallengeScore} de 5 questões, você pode revisar seu desafio semanal!`
                : "Uma prova simulada com o conteúdo do bloco de desafios diários que você completou nesta semana."}
            </p>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-1000",
                weeklyChallengeScore !== null
                  ? "bg-neon-blue"
                  : "bg-neon-purple",
              )}
              style={{
                width: `${Math.min((weeklyProgress / WEEKLY_GOAL) * 100, 100)}%`,
              }}></div>
          </div>

          <Button
            variant="primary"
            disabled={
              weeklyChallengeScore === null && weeklyProgress < WEEKLY_GOAL
            }
            onClick={() => navigate("/desafio-semanal")}
            className={cn(
              "w-full font-bold",
              weeklyChallengeScore !== null
                ? "bg-neon-blue text-gray-900 hover:opacity-80"
                : "bg-neon-purple text-white hover:opacity-80",
            )}>
            {weeklyChallengeScore !== null
              ? "Revisar Desafio Semanal"
              : weeklyProgress >= WEEKLY_GOAL
                ? "Iniciar Prova"
                : `Bloqueado (${weeklyProgress}/${WEEKLY_GOAL} desafios)`}
          </Button>
        </div>
      </section>

      {/* MODAL DO DESAFIO */}
      {isModalOpen && dailyChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-vapor-surface border border-neon-blue/30 rounded-2xl shadow-2xl shadow-neon-blue/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-vapor-border flex justify-between items-center bg-vapor-dark/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-blue/10 rounded text-neon-blue">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none">
                    Desafio em Andamento
                  </h3>
                  <span className="text-xs text-neon-purple font-bold tracking-widest uppercase">
                    Disciplina: {challengeSubjectTitle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFeedback("idle");
                  setSelectedOption(null);
                }}
                className="text-gray-400 hover:text-neon-pink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-xl text-gray-200 font-medium leading-relaxed">
                {dailyChallenge.question}
              </p>

              <div className="space-y-3">
                {dailyChallenge.options.map((opt) => (
                  <label
                    key={opt.letter}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                      feedback === "success" &&
                        opt.letter === dailyChallenge.correctAnswer
                        ? "border-neon-blue bg-neon-blue/10"
                        : selectedOption === opt.letter
                          ? "border-neon-purple bg-neon-purple/10"
                          : "border-vapor-border bg-vapor-dark hover:border-gray-500",
                      feedback === "success" && "pointer-events-none",
                    )}>
                    <input
                      type="radio"
                      name="dailyOption"
                      checked={selectedOption === opt.letter}
                      onChange={() => {
                        setSelectedOption(opt.letter);
                        setFeedback("idle");
                      }}
                      disabled={feedback === "success"}
                      className="w-5 h-5 accent-neon-purple"
                    />
                    <span className="font-bold text-gray-400">
                      {opt.letter})
                    </span>
                    <span className="text-gray-100">{opt.text}</span>
                  </label>
                ))}
              </div>

              {feedback === "error" && (
                <div className="flex items-center gap-2 text-neon-pink bg-neon-pink/10 p-4 rounded-lg border border-neon-pink/30 animate-in shake">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold">
                    Resposta incorreta. Tente novamente!
                  </span>
                </div>
              )}

              {feedback === "success" && (
                <div className="p-6 bg-vapor-dark rounded-xl border border-neon-blue flex gap-4 animate-in zoom-in-95 duration-300 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]">
                  <Info className="w-8 h-8 text-neon-blue shrink-0" />
                  <div>
                    <h3 className="text-neon-blue font-bold mb-2 text-lg">
                      Acertou! Aqui está o porquê:
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {dailyChallenge.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-vapor-border bg-vapor-dark/50 flex justify-end gap-4">
              {feedback === "success" ? (
                <Button
                  onClick={handleFinalizeChallenge}
                  disabled={isCompleting}
                  className="w-full sm:w-auto bg-neon-blue text-vapor-dark hover:bg-neon-blue/80 flex items-center justify-center gap-2">
                  {isCompleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Flame className="w-5 h-5" />
                  )}
                  {isCompleting ? "Salvando..." : "Finalizar Desafio"}
                </Button>
              ) : (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="w-full sm:w-auto">
                  Confirmar Resposta
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
