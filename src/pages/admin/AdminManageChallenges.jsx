// src/pages/admin/AdminManageChallenges.jsx
import { useState, useEffect, useMemo } from "react";
import { useStudy } from "../../hooks/useStudy";
import { createChallenge } from "../../services/api";
import {
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Edit,
  Trash2,
  Users,
  X,
  List,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

const ALPHABET = ["A", "B", "C", "D", "E"];

export function AdminManageChallenges() {
  const { subjects, students } = useStudy();

  const [challenges, setChallenges] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");

  // Accordion Control
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setIsFetching(true);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/challenges`,
        );
        if (!response.ok) throw new Error("Erro de conexão com a API.");

        const data = await response.json();
        setChallenges(data);
      } catch (err) {
        console.error("Erro na listagem:", err);
        alert("Falha ao carregar os desafios. O JSON Server está rodando?");
      } finally {
        setIsFetching(false);
      }
    };
    fetchChallenges();
  }, [activeTab]); // Refetch quando mudar de aba caso haja ações em cascata

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    subjectId: "",
    question: "",
    options: [],
    correctAnswer: "",
    explanation: "",
  });

  const [editingChallenge, setEditingChallenge] = useState(null);
  const [viewingStudentsChallengeId, setViewingStudentsChallengeId] =
    useState(null);

  // ==========================================
  // AGRUPAMENTO DOS DESAFIOS ATIVOS
  // ==========================================
  const groupedChallenges = useMemo(() => {
    const activeChallenges = challenges.filter((c) => !c.isArchived);
    const groups = {};
    activeChallenges.forEach((chal) => {
      if (!groups[chal.subjectId]) {
        groups[chal.subjectId] = [];
      }
      groups[chal.subjectId].push(chal);
    });
    return groups;
  }, [challenges]);

  const toggleAccordion = (subjectId) => {
    setExpandedSubjectId((prev) => (prev === subjectId ? null : subjectId));
    setEditingChallenge(null); // Fecha formulário de edição se colapsar a aba
  };

  // ==========================================
  // FUNÇÕES DE CRIAÇÃO
  // ==========================================
  const handleFinalizeCreation = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        subjectId: formData.subjectId,
        isArchived: false,
      };

      const savedChallenge = await createChallenge(payload);
      setChallenges((prev) => [...prev, savedChallenge]);
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar o desafio no banco de dados.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextCreate = () => {
    if (step === 1 && (!formData.subjectId || !formData.question.trim()))
      return alert("Preencha matéria e questão.");
    if (step === 2 && (formData.options.length < 2 || !formData.correctAnswer))
      return alert("Adicione opções e marque a correta.");
    if (step === 3 && !formData.explanation.trim())
      return alert("Adicione a explicação.");

    if (step === 3) {
      handleFinalizeCreation();
    } else {
      setStep((s) => s + 1);
    }
  };

  const addOptionCreate = () => {
    if (formData.options.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { letter: ALPHABET[formData.options.length], text: "" },
      ],
    }));
  };

  const updateOptionCreate = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  // ==========================================
  // FUNÇÕES DE GERENCIAMENTO (PATCH / PUT)
  // ==========================================
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Atenção: Tem certeza que deseja arquivar este desafio?\n(Alunos que já o fizeram manterão seus registros).",
      )
    ) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/challenges/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: true }),
        });
        setChallenges((prev) => prev.filter((chal) => chal.id !== id));
      } catch (err) {
        console.error(err);
        alert("Erro ao arquivar o desafio na base de dados.");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingChallenge.subjectId || !editingChallenge.question.trim())
      return alert("Preencha matéria e questão.");
    if (editingChallenge.options.length < 2 || !editingChallenge.correctAnswer)
      return alert("Mínimo de 2 opções e um gabarito assinalado.");
    if (!editingChallenge.explanation.trim())
      return alert("Explicação é obrigatória.");

    try {
      const payload = {
        ...editingChallenge,
        subjectId: editingChallenge.subjectId,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/challenges/${editingChallenge.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error("Falha ao atualizar o desafio");

      const updatedChallenge = await response.json();

      setChallenges((prev) =>
        prev.map((chal) =>
          chal.id === updatedChallenge.id ? updatedChallenge : chal,
        ),
      );
      setEditingChallenge(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar as edições no banco de dados.");
    }
  };

  const addOptionEdit = () => {
    if (editingChallenge.options.length >= 5) return;
    setEditingChallenge((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { letter: ALPHABET[prev.options.length], text: "" },
      ],
    }));
  };

  const updateOptionEdit = (index, value) => {
    const newOptions = [...editingChallenge.options];
    newOptions[index].text = value;
    setEditingChallenge({ ...editingChallenge, options: newOptions });
  };

  const removeOptionEdit = () => {
    if (editingChallenge.options.length <= 2)
      return alert("O desafio deve ter pelo menos 2 alternativas.");
    const newOptions = [...editingChallenge.options];
    const removedOption = newOptions.pop();

    const newCorrectAnswer =
      editingChallenge.correctAnswer === removedOption.letter
        ? ""
        : editingChallenge.correctAnswer;
    setEditingChallenge({
      ...editingChallenge,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    });
  };

  const getSubjectTitle = (id) =>
    subjects.find((s) => String(s.id) === String(id))?.title || "Desconhecida";

  const getStudentsForChallenge = (challengeId) => {
    return students.filter((student) =>
      student.answeredChallenges?.includes(challengeId),
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-10">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">Desafios Diários</h1>
        <p className="text-gray-400">
          Crie novos desafios e gerencie o banco de questões ativas.
        </p>
      </header>

      {/* Navegação de Abas */}
      <div className="flex gap-4 border-b border-vapor-border pb-4">
        <button
          onClick={() => {
            setActiveTab("manage");
            setEditingChallenge(null);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all",
            activeTab === "manage"
              ? "bg-neon-purple text-white"
              : "text-gray-400 hover:text-white hover:bg-vapor-dark",
          )}>
          <List className="w-5 h-5" /> Banco de Questões
        </button>
        <button
          onClick={() => {
            setActiveTab("create");
            setStep(0);
            setFormData({
              subjectId: "",
              question: "",
              options: [],
              correctAnswer: "",
              explanation: "",
            });
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all",
            activeTab === "create"
              ? "bg-neon-blue text-vapor-dark"
              : "text-gray-400 hover:text-white hover:bg-vapor-dark",
          )}>
          <PlusCircle className="w-5 h-5" /> Criar Novo Desafio
        </button>
      </div>

      {activeTab === "manage" && (
        <div className="space-y-4">
          {isFetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
            </div>
          ) : Object.keys(groupedChallenges).length === 0 ? (
            <div className="text-center p-12 bg-vapor-surface rounded-xl border border-vapor-border text-gray-500">
              Nenhum desafio ativo cadastrado no banco de questões.
            </div>
          ) : (
            Object.entries(groupedChallenges).map(
              ([subjectId, subjectChallenges]) => {
                const isExpanded = expandedSubjectId === subjectId;

                return (
                  <div
                    key={subjectId}
                    className={cn(
                      "bg-vapor-dark border rounded-xl transition-all",
                      isExpanded
                        ? "border-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.15)]"
                        : "border-vapor-border hover:border-neon-blue/50",
                    )}>
                    {/* HEADER DO ACCORDION DA MATÉRIA */}
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer"
                      onClick={() => toggleAccordion(subjectId)}>
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-neon-purple" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                        <h3
                          className={cn(
                            "text-xl font-bold transition-colors",
                            isExpanded ? "text-neon-purple" : "text-gray-200",
                          )}>
                          {getSubjectTitle(subjectId)}
                        </h3>
                        <span className="text-xs px-3 py-1 bg-vapor-surface rounded-full text-gray-400 border border-vapor-border">
                          {subjectChallenges.length}{" "}
                          {subjectChallenges.length === 1
                            ? "desafio"
                            : "desafios"}
                        </span>
                      </div>
                    </div>

                    {/* LISTAGEM INTERNA DE DESAFIOS */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-vapor-border/30 bg-vapor-surface/30 rounded-b-xl animate-in slide-in-from-top-2 space-y-4">
                        {subjectChallenges.map((challenge, index) => (
                          <div key={challenge.id}>
                            {editingChallenge !== null &&
                            editingChallenge.id === challenge.id ? (
                              <div className="space-y-6 animate-in slide-in-from-top-2 border border-neon-purple/50 p-6 rounded-xl bg-vapor-dark shadow-lg my-4">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-xl font-bold text-neon-purple flex items-center gap-2">
                                    <Edit className="w-5 h-5" /> Editando
                                    Desafio
                                  </h3>
                                  <button
                                    onClick={() => setEditingChallenge(null)}
                                    className="text-gray-400 hover:text-neon-pink bg-vapor-surface p-1.5 rounded-lg border border-vapor-border">
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>

                                <div>
                                  <label className="text-gray-300 font-medium text-sm">
                                    Matéria Associada
                                  </label>
                                  <select
                                    value={editingChallenge.subjectId}
                                    onChange={(e) =>
                                      setEditingChallenge({
                                        ...editingChallenge,
                                        subjectId: e.target.value,
                                      })
                                    }
                                    className="w-full mt-1 bg-gray-900 border border-vapor-border rounded-lg p-3 text-white outline-none focus:border-neon-purple">
                                    <option value="">Selecione...</option>
                                    {subjects
                                      .filter((s) => !s.isArchived)
                                      .map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                          {sub.title}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-gray-300 font-medium text-sm">
                                    Enunciado
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={editingChallenge.question}
                                    onChange={(e) =>
                                      setEditingChallenge({
                                        ...editingChallenge,
                                        question: e.target.value,
                                      })
                                    }
                                    className="w-full mt-1 bg-gray-900 border border-vapor-border rounded-lg p-3 text-white outline-none focus:border-neon-purple resize-none"
                                  />
                                </div>

                                <div>
                                  <label className="text-gray-300 font-medium text-sm flex justify-between items-end mb-2">
                                    <span>Alternativas e Gabarito</span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={removeOptionEdit}
                                        className="text-xs bg-vapor-dark border border-neon-pink/50 text-neon-pink px-2 py-1 rounded hover:bg-neon-pink hover:text-white">
                                        - Remover
                                      </button>
                                      <button
                                        onClick={addOptionEdit}
                                        className="text-xs bg-vapor-dark border border-neon-blue/50 text-neon-blue px-2 py-1 rounded hover:bg-neon-blue hover:text-vapor-dark">
                                        + Adicionar
                                      </button>
                                    </div>
                                  </label>
                                  <div className="space-y-3">
                                    {editingChallenge.options.map((opt, i) => (
                                      <div
                                        key={opt.letter}
                                        className={cn(
                                          "flex items-center gap-4 p-3 rounded-xl border bg-gray-900 transition-all",
                                          editingChallenge.correctAnswer ===
                                            opt.letter
                                            ? "border-neon-purple"
                                            : "border-vapor-border",
                                        )}>
                                        <input
                                          type="radio"
                                          name={`editCorrectAnswer_${challenge.id}`}
                                          checked={
                                            editingChallenge.correctAnswer ===
                                            opt.letter
                                          }
                                          onChange={() =>
                                            setEditingChallenge({
                                              ...editingChallenge,
                                              correctAnswer: opt.letter,
                                            })
                                          }
                                          className="w-4 h-4 accent-neon-purple cursor-pointer"
                                        />
                                        <span className="font-bold text-gray-400">
                                          {opt.letter})
                                        </span>
                                        <input
                                          type="text"
                                          value={opt.text}
                                          onChange={(e) =>
                                            updateOptionEdit(i, e.target.value)
                                          }
                                          className="flex-1 bg-transparent border-none text-white outline-none"
                                          placeholder="Texto da alternativa..."
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-gray-300 font-medium text-sm">
                                    Justificativa
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={editingChallenge.explanation}
                                    onChange={(e) =>
                                      setEditingChallenge({
                                        ...editingChallenge,
                                        explanation: e.target.value,
                                      })
                                    }
                                    className="w-full mt-1 bg-gray-900 border border-vapor-border rounded-lg p-3 text-white outline-none focus:border-neon-purple resize-none"
                                  />
                                </div>

                                <div className="flex justify-end pt-4 gap-3">
                                  <Button
                                    variant="ghost"
                                    onClick={() => setEditingChallenge(null)}>
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleSaveEdit}
                                    className="bg-neon-purple text-white">
                                    Salvar Alterações
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-4 bg-vapor-dark border border-vapor-border rounded-lg group">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500 font-mono w-6 text-right font-bold">
                                    {index + 1}.
                                  </span>
                                  <h3 className="text-gray-200 font-medium">
                                    {challenge.question}
                                  </h3>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      setEditingChallenge({ ...challenge })
                                    }
                                    className="p-2 text-gray-400 hover:text-neon-blue rounded-md hover:bg-neon-blue/10"
                                    title="Editar Desafio">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(challenge.id)}
                                    className="p-2 text-gray-400 hover:text-neon-pink rounded-md hover:bg-neon-pink/10"
                                    title="Arquivar Desafio">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            )
          )}
        </div>
      )}

      {/* CRIAR NOVO DESAFIO (WIZARD) */}
      {activeTab === "create" && (
        <div className="space-y-8">
          {step === 0 && (
            <Button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 bg-neon-blue text-vapor-dark px-6 py-4 text-lg">
              <PlusCircle className="w-6 h-6" /> Iniciar criação guiada
            </Button>
          )}

          {step === 1 && (
            <div className="bg-vapor-surface p-8 rounded-2xl border border-vapor-border space-y-6 animate-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-neon-blue">
                Passo 1: Contexto e Enunciado
              </h2>
              <div className="space-y-2">
                <label className="text-gray-300 font-medium">
                  Matéria do Desafio
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectId: e.target.value })
                  }
                  className="w-full bg-vapor-dark border border-vapor-border rounded-lg p-4 text-white outline-none focus:border-neon-blue">
                  <option value="">Selecione uma matéria...</option>
                  {subjects
                    .filter((s) => !s.isArchived)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 font-medium">
                  Enunciado da Questão
                </label>
                <textarea
                  rows={4}
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full bg-vapor-dark border border-vapor-border rounded-lg p-4 text-white outline-none focus:border-neon-blue resize-none"
                  placeholder="Digite a pergunta completa aqui..."
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleNextCreate}>
                  Próximo <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-vapor-surface p-8 rounded-2xl border border-vapor-border space-y-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-neon-purple">
                  Passo 2: Alternativas
                </h2>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-vapor-dark px-3 py-1 rounded">
                  Adicione as respostas e assinale o gabarito
                </span>
              </div>
              <div className="space-y-4">
                {formData.options.map((opt, i) => (
                  <div
                    key={opt.letter}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border bg-vapor-dark transition-all",
                      formData.correctAnswer === opt.letter
                        ? "border-neon-purple"
                        : "border-vapor-border",
                    )}>
                    <input
                      type="radio"
                      name="createCorrectAnswer"
                      checked={formData.correctAnswer === opt.letter}
                      onChange={() =>
                        setFormData({ ...formData, correctAnswer: opt.letter })
                      }
                      className="w-5 h-5 accent-neon-purple cursor-pointer"
                    />
                    <span className="font-bold text-gray-400">
                      {opt.letter})
                    </span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOptionCreate(i, e.target.value)}
                      className="flex-1 bg-transparent border-none text-white outline-none"
                      placeholder="Texto da alternativa..."
                    />
                  </div>
                ))}
              </div>
              {formData.options.length < 5 && (
                <button
                  onClick={addOptionCreate}
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-vapor-border rounded-xl text-gray-400 hover:text-neon-blue hover:border-neon-blue transition-colors">
                  <PlusCircle className="w-6 h-6 mr-2" /> Adicionar Alternativa
                  ({ALPHABET[formData.options.length]})
                </button>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={handleNextCreate}>
                  Próximo <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-vapor-surface p-8 rounded-2xl border border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.1)] space-y-6 animate-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-neon-blue">
                Passo 3: Justificativa
              </h2>
              <div className="space-y-2">
                <label className="text-gray-300 font-medium">
                  Por que a alternativa {formData.correctAnswer} está correta?
                </label>
                <textarea
                  rows={5}
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  className="w-full bg-vapor-dark border border-neon-blue/50 rounded-lg p-4 text-white outline-none focus:border-neon-blue resize-none"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNextCreate}
                  disabled={isSaving}
                  className="bg-neon-blue text-vapor-dark">
                  {isSaving ? "Salvando..." : "Salvar no Banco"}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in">
              <CheckCircle2 className="w-24 h-24 text-neon-purple mb-6" />
              <h2 className="text-3xl font-black text-white mb-2">
                Desafio Publicado!
              </h2>
              <Button onClick={() => setActiveTab("manage")} className="mt-4">
                Ir para Banco de Questões
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modal Visualizar Alunos */}
      {viewingStudentsChallengeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-vapor-surface border border-vapor-border rounded-2xl shadow-2xl shadow-neon-blue/20 w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-vapor-border flex justify-between items-center bg-vapor-dark/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-blue" /> Alunos que
                Concluíram
              </h3>
              <button
                onClick={() => setViewingStudentsChallengeId(null)}
                className="text-gray-400 hover:text-neon-pink transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {getStudentsForChallenge(viewingStudentsChallengeId).length ===
              0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhum aluno concluiu este desafio ainda.
                </p>
              ) : (
                getStudentsForChallenge(viewingStudentsChallengeId).map(
                  (student) => (
                    <div
                      key={student.id}
                      className="flex justify-between items-center bg-vapor-dark p-3 rounded-lg border border-vapor-border">
                      <span className="font-medium text-gray-200">
                        {student.name}
                      </span>
                      <span className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
                        {student.lastChallengeDate
                          ? new Date(
                              student.lastChallengeDate,
                            ).toLocaleDateString("pt-BR")
                          : "Data Indisponível"}
                      </span>
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
