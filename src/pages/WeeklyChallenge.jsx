// src/pages/WeeklyChallenge.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "../hooks/useStudy";
import {
  Loader2,
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

// ==========================================
// FUNÇÕES UTILITÁRIAS À PROVA DE TIMEZONE
// ==========================================
const isCurrentWeek = (dateStr) => {
  if (!dateStr) return false;
  const cleanDate = dateStr.split("T")[0];
  const [y, m, d] = cleanDate.split("-").map(Number);
  const recordDate = new Date(y, m - 1, d);

  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return recordDate >= startOfWeek && recordDate <= endOfWeek;
};

export function WeeklyChallenge() {
  const navigate = useNavigate();
  const { currentUser } = useStudy();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchWeeklyContent = async () => {
      if (!currentUser) return;

      try {
        // 1. Buscar histórico do usuário
        const historyRes = await fetch(
          `http://localhost:3001/completed_challenges?userId=${currentUser.id}`,
        );
        const historyData = await historyRes.json();

        // 2. Buscar se já fez a prova desta semana
        const weeklyCompRes = await fetch(
          `http://localhost:3001/completed_weekly_challenges?userId=${currentUser.id}`,
        );
        let claimData = null;
        let isReviewMode = false;

        if (weeklyCompRes.ok) {
          const weeklyCompData = await weeklyCompRes.json();
          claimData = weeklyCompData.find((record) =>
            isCurrentWeek(record.completionDate),
          );
          if (claimData) isReviewMode = true;
        }

        let idsToFetch = [];

        // SE FOR REVISÃO: Trava a tela com as respostas exatas que ele enviou
        if (isReviewMode && claimData.answers) {
          idsToFetch = Object.keys(claimData.answers);
          setAnswers(claimData.answers);
          setScore(claimData.score);
          setIsSubmitted(true);
        }
        // SE FOR PROVA NOVA: Verifica se ele cumpriu os 5 desafios da semana
        else {
          idsToFetch = historyData
            .filter((record) => isCurrentWeek(record.completionDate))
            .map((record) => record.challengeId);

          if (idsToFetch.length < 5) {
            navigate("/");
            return;
          }
        }

        // 3. Busca os objetos completos de todos os desafios da semana
        const challengesRes = await fetch(`http://localhost:3001/challenges`);
        const allChallenges = await challengesRes.json();

        const weeklyQuestions = allChallenges.filter((c) =>
          idsToFetch.includes(c.id),
        );
        setQuestions(weeklyQuestions);
      } catch (error) {
        console.error("Erro ao carregar a prova semanal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyContent();
  }, [currentUser, navigate]);

  const handleSelectOption = (questionId, letter) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const handleSubmit = async () => {
    if (isSaving || isSubmitted) return;
    setIsSaving(true);

    let currentScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        currentScore++;
      }
    });

    try {
      await fetch("http://localhost:3001/completed_weekly_challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `wcomp-${Date.now()}`,
          userId: currentUser.id,
          completionDate: new Date().toISOString(),
          score: currentScore,
          answers: answers,
        }),
      });

      setScore(currentScore);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Erro ao salvar a prova semanal:", err);
      alert("Houve um erro ao enviar sua prova. Verifique sua conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const isAllAnswered =
    questions.length > 0 && Object.keys(answers).length === questions.length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-neon-purple animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest uppercase">
          Carregando ambiente...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-neon-purple mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-neon-purple" />
            {isSubmitted ? "Revisão do Desafio Semanal" : "Prova Semanal"}
          </h1>
          <p className="text-gray-400 mt-2">
            {isSubmitted
              ? "Confira o seu desempenho nas questões abordadas nesta semana."
              : "Revisão dos conteúdos aprendidos nesta semana."}
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-vapor-dark border border-vapor-border rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg text-gray-200 font-medium leading-relaxed mb-4">
              <span className="text-neon-purple font-bold mr-2">
                {index + 1}.
              </span>
              {q.question}
            </h3>

            <div className="space-y-3">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.letter;
                const isCorrect = q.correctAnswer === opt.letter;
                const isWrongSelected = isSubmitted && isSelected && !isCorrect;
                const isSuccessHighlight = isSubmitted && isCorrect;

                return (
                  <label
                    key={opt.letter}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all",
                      !isSubmitted && "cursor-pointer hover:border-gray-500",

                      // Cores Pós-Submit
                      isSuccessHighlight && "border-neon-blue bg-neon-blue/10",
                      isWrongSelected && "border-neon-pink bg-neon-pink/10",

                      // Cores Pré-Submit
                      !isSubmitted && isSelected
                        ? "border-neon-purple bg-neon-purple/10"
                        : !isSuccessHighlight &&
                            !isWrongSelected &&
                            "border-vapor-border bg-vapor-surface",

                      // Trava Visual
                      isSubmitted && "pointer-events-none opacity-90",
                    )}>
                    {/* BARRAGEM DE SEGURANÇA: O input de fato FICA desabilitado */}
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={isSelected}
                      disabled={isSubmitted}
                      onChange={() => handleSelectOption(q.id, opt.letter)}
                      className="w-5 h-5 accent-neon-purple"
                    />

                    <span className="font-bold text-gray-400">
                      {opt.letter})
                    </span>
                    <span className="text-gray-100">{opt.text}</span>
                  </label>
                );
              })}
            </div>

            {/* Explicação */}
            {isSubmitted && (
              <div
                className={cn(
                  "mt-4 p-4 rounded-lg flex items-start gap-3 animate-in fade-in duration-300",
                  answers[q.id] === q.correctAnswer
                    ? "bg-neon-blue/10 text-neon-blue"
                    : "bg-neon-pink/10 text-neon-pink",
                )}>
                {answers[q.id] === q.correctAnswer ? (
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="font-bold">
                    {answers[q.id] === q.correctAnswer
                      ? "Correto!"
                      : "Incorreto."}
                  </span>
                  <p className="text-gray-300 mt-1 text-sm">{q.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      {!isSubmitted ? (
        <div className="sticky bottom-4 bg-vapor-surface/90 backdrop-blur-md border border-neon-purple/50 p-4 rounded-2xl flex justify-between items-center shadow-[0_0_30px_rgba(176,38,255,0.2)]">
          <p className="text-gray-300">
            Respondidas:{" "}
            <span className="font-bold text-white">
              {Object.keys(answers).length} / {questions.length}
            </span>
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSaving}
            className={cn(
              "bg-neon-purple text-white hover:bg-neon-purple/80 flex gap-2 items-center",
              (!isAllAnswered || isSaving) && "opacity-50 grayscale",
            )}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Enviando..." : "Finalizar Prova"}
          </Button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple p-8 rounded-2xl text-center space-y-4 shadow-[0_0_40px_rgba(176,38,255,0.3)] animate-in zoom-in-95">
          <h2 className="text-3xl font-black text-white">Modo Revisão Ativo</h2>
          <p className="text-xl text-gray-300">
            Você acertou{" "}
            <span
              className={cn(
                "font-bold text-2xl",
                score >= 4 ? "text-neon-blue" : "text-neon-pink",
              )}>
              {score}
            </span>{" "}
            de {questions.length} questões.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => navigate("/")}
              className="bg-white text-vapor-dark font-bold hover:bg-gray-200">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
