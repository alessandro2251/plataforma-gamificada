// src/pages/SubjectPlayer.jsx
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudy } from "../hooks/useStudy";
import {
  PlayCircle,
  Rewind,
  FastForward,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { cn } from "../utils/cn";

export function SubjectPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { studentSubjects, completeSubject, currentUser } = useStudy();

  const videoRef = useRef(null);
  const [currentClassIndex, setCurrentClassIndex] = useState(0);

  // Estados de proteção e feedback de carregamento
  const [isReady, setIsReady] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const subject = studentSubjects.find((s) => String(s.id) === String(id));

  // Proteção de carregamento (Impede o redirect fantasma)
  useEffect(() => {
    if (studentSubjects.length === 0) return;

    if (!subject || subject.status === "locked") {
      navigate("/disciplinas");
    } else {
      setIsReady(true);
    }
  }, [studentSubjects, subject, navigate]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-neon-purple animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest uppercase">
          Carregando Módulo...
        </p>
      </div>
    );
  }

  const classes = subject.classes || [];
  const currentClass = classes[currentClassIndex];
  const isLastClass = currentClassIndex === classes.length - 1;
  const isSubjectCompleted = currentUser?.completedSubjectIds.includes(
    subject.id,
  );

  // Controles de Vídeo
  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleNextClass = () => {
    if (!isLastClass) {
      setCurrentClassIndex((prev) => prev + 1);
    } else {
      handleCompleteSubject();
    }
  };

  const handlePrevClass = () => {
    if (currentClassIndex > 0) {
      setCurrentClassIndex((prev) => prev - 1);
    }
  };

  // Modificado para ser assíncrono e aguardar o banco de dados
  const handleCompleteSubject = async () => {
    setIsCompleting(true);
    try {
      if (!isSubjectCompleted) {
        await completeSubject(subject.id);
      }
      navigate("/disciplinas");
    } catch (error) {
      console.error("Falha ao concluir a matéria na interface:", error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 h-[calc(100vh-6rem)]">
      {/* Área Principal - Player e Controles */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Botão de Voltar */}
        <button
          onClick={() => navigate("/disciplinas")}
          className="flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors w-fit">
          <ChevronLeft className="w-5 h-5" /> Voltar para Trilha
        </button>

        {/* Player de Vídeo */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-vapor-border shadow-neon-blue group">
          {currentClass ? (
            <video
              ref={videoRef}
              key={currentClass.videoUrl}
              className="w-full h-full object-contain"
              controls
              autoPlay
              onEnded={handleNextClass}>
              <source src={currentClass.videoUrl} type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              Nenhum vídeo disponível nesta aula.
            </div>
          )}
        </div>

        {/* Controles Customizados da Plataforma */}
        <div className="bg-vapor-surface p-4 rounded-xl border border-vapor-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => skipTime(-15)}
              className="flex items-center gap-1 px-3 py-2 bg-vapor-dark hover:bg-neon-purple/20 text-gray-300 hover:text-neon-purple rounded-lg transition-colors border border-vapor-border hover:border-neon-purple"
              title="Voltar 15 segundos">
              <Rewind className="w-5 h-5" /> -15s
            </button>
            <button
              onClick={() => skipTime(15)}
              className="flex items-center gap-1 px-3 py-2 bg-vapor-dark hover:bg-neon-purple/20 text-gray-300 hover:text-neon-purple rounded-lg transition-colors border border-vapor-border hover:border-neon-purple"
              title="Avançar 15 segundos">
              +15s <FastForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handlePrevClass}
              disabled={currentClassIndex === 0}>
              <ArrowLeft className="w-5 h-5" /> Anterior
            </Button>

            {isLastClass ? (
              <Button
                variant="primary"
                onClick={handleCompleteSubject}
                disabled={isCompleting}
                className="bg-neon-blue text-vapor-dark flex items-center gap-2">
                {isCompleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {isCompleting ? "Salvando..." : "Concluir Disciplina"}
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleNextClass}>
                Próxima Aula <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Informações da Aula Atual */}
        <div className="bg-vapor-surface p-6 rounded-xl border border-vapor-border flex-1">
          <h1 className="text-2xl font-bold text-white mb-2">
            {currentClass?.title}
          </h1>
          <p className="text-gray-400 mb-6">{subject.description}</p>

          {currentClass?.auxFile && (
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-neon-blue rounded-lg border border-neon-blue/30 hover:bg-gray-700 transition-colors">
              <FileText className="w-5 h-5" />
              Material de Apoio: {currentClass.auxFile}
            </a>
          )}
        </div>
      </div>

      {/* Sidebar - Lista de Aulas */}
      <aside className="w-full lg:w-80 bg-vapor-surface border border-vapor-border rounded-2xl overflow-hidden flex flex-col h-full">
        <div className="p-5 border-b border-vapor-border bg-vapor-dark/50">
          <h2 className="text-lg font-bold text-white">Conteúdo do Módulo</h2>
          <p className="text-sm text-gray-400 mt-1">
            {classes.length} aulas disponíveis
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {classes.map((cls, index) => {
            const isPlaying = index === currentClassIndex;
            return (
              <button
                key={cls.id}
                onClick={() => setCurrentClassIndex(index)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all",
                  isPlaying
                    ? "bg-neon-purple/20 border border-neon-purple text-neon-purple shadow-[inset_0_0_10px_rgba(176,38,255,0.2)]"
                    : "text-gray-400 hover:bg-vapor-dark hover:text-white border border-transparent",
                )}>
                <PlayCircle
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isPlaying ? "text-neon-purple" : "text-gray-600",
                  )}
                />
                <span className="font-medium text-sm line-clamp-2">
                  {cls.title}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
