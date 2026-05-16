// src/pages/DailyChallenge.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "../hooks/useStudy";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trophy,
  Info,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

export function DailyChallenge() {
  const navigate = useNavigate();
  const { getDailyChallenge, submitDailyChallenge, checkStreakMaintenance } =
    useStudy();

  const [challengeData, setChallengeData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // null, 'error', 'success'

  useEffect(() => {
    checkStreakMaintenance();
    setChallengeData(getDailyChallenge());
  }, []);

  if (!challengeData) return null;

  if (challengeData.status === "ALREADY_COMPLETED_TODAY") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in">
        <Trophy className="w-24 h-24 text-neon-blue mb-6" />
        <h2 className="text-3xl font-black text-white mb-2">
          Ofensiva Garantida!
        </h2>
        <p className="text-gray-400 mb-8">
          Você já concluiu seu desafio hoje. Volte amanhã às 00:00.
        </p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Voltar para o Painel
        </Button>
      </div>
    );
  }

  if (challengeData.status === "NO_CHALLENGES_AVAILABLE") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
        <AlertCircle className="w-24 h-24 text-gray-500 mb-6" />
        <h2 className="text-3xl font-black text-white mb-2">
          Sem Desafios no Momento
        </h2>
        <p className="text-gray-400 mb-8">
          Conclua novas disciplinas para desbloquear perguntas inéditas.
        </p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Voltar
        </Button>
      </div>
    );
  }

  const { challenge } = challengeData;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) return;

    if (selectedOption === challenge.correctAnswer) {
      setFeedback("success");
      submitDailyChallenge(challenge.id);
    } else {
      setFeedback("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-neon-pink transition-colors">
        <ArrowLeft className="w-5 h-5" /> Sair
      </button>

      <header className="flex items-center gap-4 border-b border-vapor-border pb-6">
        <div className="p-4 bg-neon-blue/10 rounded-xl text-neon-blue border border-neon-blue/30">
          <Zap className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Desafio Diário</h1>
          <p className="text-neon-blue font-medium">
            +1 Dia de Ofensiva em jogo
          </p>
        </div>
      </header>

      {/* Se acertou, mostra o Modal/Container de Explicação, senão, mostra a questão */}
      {feedback === "success" ? (
        <div className="bg-vapor-surface p-8 rounded-2xl border border-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.2)] space-y-6 animate-in zoom-in">
          <div className="flex items-center gap-3 text-neon-blue">
            <CheckCircle2 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Resposta Correta!</h2>
          </div>

          <div className="p-6 bg-vapor-dark rounded-xl border border-vapor-border flex gap-4">
            <Info className="w-6 h-6 text-neon-purple shrink-0" />
            <div>
              <h3 className="text-neon-purple font-bold mb-2">Explicação:</h3>
              <p className="text-gray-300 leading-relaxed">
                {challenge.explanation}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="w-full">
            Resgatar Recompensas e Voltar
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-vapor-surface p-8 rounded-2xl border border-vapor-border space-y-8">
          <h2 className="text-xl text-gray-200 leading-relaxed font-medium">
            {challenge.question}
          </h2>

          <div className="space-y-4">
            {challenge.options.map((option) => (
              <label
                key={option.letter}
                className={cn(
                  "flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all group",
                  selectedOption === option.letter
                    ? "bg-neon-blue/10 border-neon-blue text-white"
                    : "bg-vapor-dark border-vapor-border text-gray-300 hover:border-neon-blue/50",
                )}>
                <input
                  type="radio"
                  name="challengeOption"
                  value={option.letter}
                  onChange={() => setSelectedOption(option.letter)}
                  className="w-5 h-5 accent-neon-blue"
                />
                <span className="font-bold text-neon-purple">
                  {option.letter})
                </span>
                <span className="font-medium">{option.text}</span>
              </label>
            ))}
          </div>

          {feedback === "error" && (
            <div className="flex items-center gap-2 text-neon-pink bg-neon-pink/10 p-4 rounded-lg border border-neon-pink/30 animate-in shake">
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">
                Incorreto. Leia novamente o material se necessário.
              </span>
            </div>
          )}

          <Button
            variant="primary"
            type="submit"
            disabled={!selectedOption}
            className="w-full py-4">
            Confirmar Resposta
          </Button>
        </form>
      )}
    </div>
  );
}
