// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Flame,
  X,
  BookOpen,
  Target,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../utils/cn";

// ==========================================
// FUNÇÃO UTILITÁRIA À PROVA DE TIMEZONE
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

export function AdminDashboard() {
  const [data, setData] = useState({
    students: [],
    completedDaily: [],
    completedWeekly: [],
    subjects: [],
    challenges: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados dos Modais
  const [modalType, setModalType] = useState(null); // 'subjects' | 'weekly' | null
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalExtraData, setModalExtraData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch simultâneo usando o { cache: 'no-store' } nativo para evitar o bug do json-server
        const [
          usersRes,
          compDailyRes,
          compWeeklyRes,
          subjectsRes,
          challengesRes,
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/users`, { cache: "no-store" }),
          fetch(`${import.meta.env.VITE_API_URL}/completed_challenges`, {
            cache: "no-store",
          }),
          fetch(`${import.meta.env.VITE_API_URL}/completed_weekly_challenges`, {
            cache: "no-store",
          }),
          fetch(`${import.meta.env.VITE_API_URL}/subjects`, {
            cache: "no-store",
          }),
          fetch(`${import.meta.env.VITE_API_URL}/challenges`, {
            cache: "no-store",
          }),
        ]);

        if (!usersRes.ok)
          throw new Error("Erro ao carregar dados do JSON Server");

        const allUsers = await usersRes.json();
        // Filtramos os alunos diretamente no Frontend para evitar conflitos na URL
        const students = allUsers.filter((u) => u.role === "student");

        const completedDaily = await compDailyRes.json();
        const completedWeekly = compWeeklyRes.ok
          ? await compWeeklyRes.json()
          : [];
        const subjects = subjectsRes.ok ? await subjectsRes.json() : [];
        const challenges = challengesRes.ok ? await challengesRes.json() : [];

        setData({
          students,
          completedDaily,
          completedWeekly: Array.isArray(completedWeekly)
            ? completedWeekly
            : [],
          subjects,
          challenges,
        });
      } catch (err) {
        console.error("Falha na sincronização do Dashboard Admin:", err);
        setError("Não foi possível conectar ao banco de dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ==========================================
  // LÓGICAS DE CRUZAMENTO DE DADOS
  // ==========================================
  const getStudentDailyCount = (userId) => {
    return data.completedDaily.filter(
      (record) =>
        record.userId === userId && isCurrentWeek(record.completionDate),
    ).length;
  };

  const getStudentWeeklyData = (userId) => {
    return data.completedWeekly.find(
      (record) =>
        record.userId === userId && isCurrentWeek(record.completionDate),
    );
  };

  // Funções para abrir os modais
  const openSubjectsModal = (student) => {
    setSelectedStudent(student);
    setModalType("subjects");
  };

  const openWeeklyModal = (student, weeklyData) => {
    setSelectedStudent(student);
    setModalExtraData(weeklyData);
    setModalType("weekly");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedStudent(null);
    setModalExtraData(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-bold tracking-widest uppercase">
          Carregando Banco de Dados...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-6 bg-neon-pink/10 border border-neon-pink text-neon-pink rounded-xl">
        <XCircle className="w-8 h-8" />
        <span className="font-bold">{error}</span>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Painel de Alunos</h1>
        <p className="text-gray-400">
          Visão geral do progresso e engajamento da turma.
        </p>
      </header>

      <div className="overflow-x-auto bg-vapor-surface border border-vapor-border rounded-2xl shadow-[0_0_20px_rgba(176,38,255,0.15)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-vapor-border bg-vapor-dark/80">
              <th className="p-4 font-bold text-neon-purple uppercase tracking-wider text-sm">
                Nome do Aluno
              </th>
              <th className="p-4 font-bold text-neon-purple uppercase tracking-wider text-sm">
                Streak
              </th>
              <th className="p-4 font-bold text-neon-purple uppercase tracking-wider text-sm">
                Disciplinas Concluídas
              </th>
              <th className="p-4 font-bold text-neon-purple text-center uppercase tracking-wider text-sm">
                Desafio Diário (Semana)
              </th>
              <th className="p-4 font-bold text-neon-purple text-center uppercase tracking-wider text-sm">
                Desafio Semanal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vapor-border">
            {data.students.map((student) => {
              const dailyCount = getStudentDailyCount(student.id);
              const weeklyData = getStudentWeeklyData(student.id);
              const completedSubjectsCount =
                student.completedSubjectIds?.length || 0;

              return (
                <tr
                  key={student.id}
                  className="hover:bg-vapor-dark/40 transition-colors">
                  <td className="p-4 text-gray-100 font-medium">
                    {student.name}
                    <div className="text-xs text-gray-500 font-normal">
                      {student.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-orange-500 font-bold">
                      <Flame className="w-5 h-5 animate-pulse" />
                      <span>{student.currentStreak || 0} dias</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 font-bold">
                        {completedSubjectsCount}
                      </span>
                      {completedSubjectsCount > 0 && (
                        <button
                          onClick={() => openSubjectsModal(student)}
                          className="text-xs font-bold text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-md hover:bg-neon-blue/20 transition-colors">
                          Detalhes
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vapor-dark border border-vapor-border">
                      <span
                        className={cn(
                          "font-bold",
                          dailyCount >= 5 ? "text-neon-blue" : "text-gray-300",
                        )}>
                        {dailyCount} de 5
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {weeklyData ? (
                      <button
                        onClick={() => openWeeklyModal(student, weeklyData)}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/20 transition-colors font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Concluído - Detalhes
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vapor-dark text-gray-500 border border-vapor-border text-sm">
                        <XCircle className="w-4 h-4" />
                        Pendente
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.students.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-8 text-center text-gray-500 font-medium">
                  Nenhum aluno matriculado ou encontrado no banco de dados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================= */}
      {/* SISTEMA DE MODAIS */}
      {/* ======================================================= */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-vapor-surface border border-neon-purple/50 rounded-2xl shadow-[0_0_40px_rgba(176,38,255,0.2)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header do Modal */}
            <div className="p-5 border-b border-vapor-border flex justify-between items-center bg-vapor-dark/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-purple/10 rounded-lg text-neon-purple">
                  {modalType === "subjects" ? (
                    <BookOpen className="w-6 h-6" />
                  ) : (
                    <Target className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white leading-none">
                    {modalType === "subjects"
                      ? "Disciplinas Concluídas"
                      : "Auditoria do Desafio Semanal"}
                  </h3>
                  <span className="text-sm text-gray-400">
                    Aluno:{" "}
                    <span className="text-neon-blue font-semibold">
                      {selectedStudent?.name}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo Dinâmico do Modal */}
            <div className="p-6 overflow-y-auto space-y-4 bg-vapor-dark/30">
              {/* RENDERIZAÇÃO: Modal de Disciplinas */}
              {modalType === "subjects" && (
                <div className="grid gap-3">
                  {selectedStudent.completedSubjectIds.map((subjId) => {
                    const subject = data.subjects.find(
                      (s) => String(s.id) === String(subjId),
                    );
                    return (
                      <div
                        key={subjId}
                        className="flex items-center gap-4 p-4 bg-vapor-dark border border-vapor-border rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-neon-blue shrink-0" />
                        <div>
                          <p className="font-bold text-gray-200">
                            {subject
                              ? subject.title
                              : "Disciplina Removida/Desconhecida"}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            ID: {subjId}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* RENDERIZAÇÃO: Modal de Desafio Semanal */}
              {modalType === "weekly" && modalExtraData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-vapor-dark p-4 rounded-xl border border-neon-blue/30">
                    <span className="text-gray-300 font-medium">
                      Nota Final da Semana:
                    </span>
                    <span className="text-2xl font-black text-neon-blue">
                      {modalExtraData.score} /{" "}
                      {Object.keys(modalExtraData.answers || {}).length}
                    </span>
                  </div>

                  {Object.entries(modalExtraData.answers || {}).map(
                    ([challengeId, studentAnswer], index) => {
                      const challengeInfo = data.challenges.find(
                        (c) => String(c.id) === String(challengeId),
                      );
                      if (!challengeInfo) return null;

                      const isCorrect =
                        studentAnswer === challengeInfo.correctAnswer;

                      return (
                        <div
                          key={challengeId}
                          className="bg-vapor-dark border border-vapor-border rounded-xl p-5 space-y-4">
                          <p className="text-gray-200 font-medium">
                            <span className="text-neon-purple font-bold mr-2">
                              {index + 1}.
                            </span>
                            {challengeInfo.question}
                          </p>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-vapor-surface p-3 rounded-lg border border-vapor-border flex flex-col justify-center">
                              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                                Aluno Marcou
                              </span>
                              <span
                                className={cn(
                                  "font-bold text-lg",
                                  isCorrect
                                    ? "text-neon-blue"
                                    : "text-neon-pink",
                                )}>
                                Alternativa {studentAnswer}
                              </span>
                            </div>

                            <div className="flex-1 bg-vapor-surface p-3 rounded-lg border border-vapor-border flex flex-col justify-center">
                              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                                Gabarito
                              </span>
                              <span className="font-bold text-lg text-gray-300">
                                Alternativa {challengeInfo.correctAnswer}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "flex items-center justify-center sm:w-32 rounded-lg border font-bold uppercase tracking-widest",
                                isCorrect
                                  ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                                  : "bg-neon-pink/10 border-neon-pink/30 text-neon-pink",
                              )}>
                              {isCorrect ? "Acertou" : "Errou"}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
