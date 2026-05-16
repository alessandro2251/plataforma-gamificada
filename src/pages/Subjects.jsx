// src/pages/Subjects.jsx
import { useStudy } from "../hooks/useStudy";
import { Lock, Unlock, CheckCircle2, PlayCircle } from "lucide-react";
import { cn } from "../utils/cn";
import { useNavigate } from "react-router-dom";

export function Subjects() {
  const { studentSubjects } = useStudy();
  const navigate = useNavigate(); // Inicia o hook de navegação

  // Função auxiliar para buscar o nome do pré-requisito
  const getPrerequisiteName = (reqId) => {
    const req = studentSubjects.find((s) => s.id === reqId);
    return req ? req.title : "Disciplina Anterior";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">
          Trilha de Conhecimento
        </h1>
        <p className="text-gray-400">
          Acesse suas aulas. Conclua módulos para desbloquear os próximos.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentSubjects.map((subject) => {
          const isLocked = subject.status === "locked";
          const isCompleted = subject.status === "completed";
          const isUnlocked = subject.status === "unlocked";

          return (
            <div
              key={subject.id}
              className={cn(
                "relative flex flex-col p-6 rounded-2xl border transition-all duration-300 h-full",
                isCompleted &&
                  "bg-vapor-surface border-neon-blue/50 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]",
                isUnlocked &&
                  "bg-vapor-surface border-neon-purple shadow-neon-purple hover:-translate-y-1 cursor-pointer",
                isLocked &&
                  "bg-vapor-dark/50 border-vapor-border opacity-70 grayscale cursor-not-allowed",
              )}>
              {/* Ícone de Status no Topo */}
              <div className="absolute top-4 right-4">
                {isCompleted && (
                  <CheckCircle2 className="w-6 h-6 text-neon-blue" />
                )}
                {isUnlocked && <Unlock className="w-6 h-6 text-neon-purple" />}
                {isLocked && <Lock className="w-6 h-6 text-gray-500" />}
              </div>

              <div className="mt-2 flex-1">
                <h3
                  className={cn(
                    "text-xl font-bold mb-2 pr-8",
                    isLocked ? "text-gray-500" : "text-gray-100",
                  )}>
                  {subject.title}
                </h3>
                <p className="text-sm text-gray-400 mb-6 line-clamp-3">
                  {subject.description}
                </p>
              </div>

              {/* Área de Ação / Aviso de Bloqueio */}
              <div className="pt-4 border-t border-vapor-border/50 mt-auto">
                {isLocked ? (
                  <p className="text-xs font-medium text-neon-pink flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Requer: {getPrerequisiteName(subject.prerequisiteId)}
                  </p>
                ) : isCompleted ? (
                  <button
                    onClick={() => navigate(`/disciplinas/${subject.id}`)}
                    className="w-full py-2 rounded text-sm font-bold text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/10 transition-colors">
                    Revisar Conteúdo
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/disciplinas/${subject.id}`)}
                    className="w-full flex justify-center items-center gap-2 py-3 rounded-lg font-bold bg-neon-purple text-white hover:bg-neon-purple/80 hover:shadow-neon-purple transition-all">
                    <PlayCircle className="w-5 h-5" /> Iniciar Aulas
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
