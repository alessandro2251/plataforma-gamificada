// src/pages/admin/AdminManageSubjects.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useStudy } from "../../hooks/useStudy";
import {
  PlusCircle,
  Trash2,
  Edit,
  FileVideo,
  FileText,
  PlayCircle,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";

// ============================================================================
// MICRO-COMPONENTE: Criar/Editar Aula
// ============================================================================
function ClassForm({ subjectId, initialData, onCancel }) {
  const { addClassToSubject, updateClassInSubject } = useStudy();

  // Se existir initialData, estamos em modo Edição.
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const classPayload = {
        title: data.title,
        description: data.description,
        videoUrl:
          data.video && data.video[0]?.name
            ? URL.createObjectURL(data.video[0])
            : initialData?.videoUrl ||
              "https://www.w3schools.com/html/mov_bbb.mp4",
        auxFile:
          data.auxFile && data.auxFile[0]?.name
            ? data.auxFile[0].name
            : initialData?.auxFile || null,
      };

      if (isEditing) {
        await updateClassInSubject(subjectId, initialData.id, classPayload);
      } else {
        await addClassToSubject(subjectId, classPayload);
      }

      onCancel();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      alert("Houve um erro ao salvar a aula. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-4 p-4 bg-vapor-dark/80 border border-neon-blue/30 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-neon-blue font-bold flex items-center gap-2">
          {isEditing ? (
            <Edit className="w-4 h-4" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          {isEditing ? "Editar Aula" : "Cadastrar Nova Aula"}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="text-gray-400 hover:text-neon-pink disabled:opacity-50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-medium">
            Título da Aula
          </label>
          <input
            {...register("title", { required: "Título é obrigatório" })}
            className="w-full mt-1 bg-gray-900 border border-vapor-border rounded p-2 text-sm text-white focus:border-neon-blue outline-none"
            placeholder="Ex: Tipos de Variáveis"
          />
          {errors.title && (
            <span className="text-neon-pink text-xs">
              {errors.title.message}
            </span>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium">
            Descrição / Resumo
          </label>
          <input
            {...register("description")}
            className="w-full mt-1 bg-gray-900 border border-vapor-border rounded p-2 text-sm text-white focus:border-neon-blue outline-none"
            placeholder="O que será abordado?"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <FileVideo className="w-3 h-3" /> Arquivo de Vídeo (Opcional)
          </label>
          <input
            type="file"
            accept="video/*"
            {...register("video")}
            className="w-full mt-1 text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neon-blue file:text-vapor-dark hover:file:opacity-80"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <FileText className="w-3 h-3" /> Material Auxiliar (Opcional)
          </label>
          <input
            type="file"
            {...register("auxFile")}
            className="w-full mt-1 text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-700 file:text-white hover:file:opacity-80"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="py-2 text-sm bg-neon-blue text-vapor-dark hover:bg-neon-blue/80 flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSaving
            ? "Salvando..."
            : isEditing
              ? "Salvar Alterações"
              : "Salvar Aula"}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// MICRO-COMPONENTE: Editar Disciplina
// ============================================================================
function EditSubjectForm({ subject, availablePrerequisites, onCancel }) {
  const { updateSubject } = useStudy();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: subject.title,
      description: subject.description,
      requiresPrerequisite: !!subject.prerequisiteId,
      prerequisiteId: subject.prerequisiteId || "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const requiresPrerequisite = watch("requiresPrerequisite");

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const updatedData = {
        title: data.title,
        description: data.description,
        prerequisiteId: data.requiresPrerequisite ? data.prerequisiteId : null,
      };
      await updateSubject(subject.id, updatedData);
      onCancel(); // Fecha o formulário ao terminar
    } catch (error) {
      alert("Houve um erro ao editar a disciplina.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-neon-blue font-bold flex items-center gap-2">
          <Edit className="w-5 h-5" /> Editar Disciplina
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-neon-pink transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-medium">
            Nome da Disciplina
          </label>
          <input
            {...register("title", { required: "O nome é obrigatório" })}
            className="w-full mt-1 bg-gray-900 border border-vapor-border rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium">
            Descrição Geral
          </label>
          <input
            {...register("description", {
              required: "A descrição é obrigatória",
            })}
            className="w-full mt-1 bg-gray-900 border border-vapor-border rounded-lg p-3 text-sm text-white focus:border-neon-purple outline-none"
          />
        </div>
      </div>

      <div className="bg-vapor-dark p-4 rounded-lg border border-vapor-border space-y-3">
        <label className="flex items-center gap-3 cursor-pointer w-fit">
          <input
            type="checkbox"
            {...register("requiresPrerequisite")}
            className="w-5 h-5 accent-neon-purple"
          />
          <span className="text-gray-300 font-medium">
            Requer conclusão de uma disciplina base?
          </span>
        </label>
        {requiresPrerequisite && (
          <select
            {...register("prerequisiteId", {
              required: requiresPrerequisite ? "Selecione uma matéria" : false,
            })}
            className="w-full max-w-md bg-gray-900 border border-neon-blue/50 rounded-lg p-3 text-sm text-white outline-none mt-2">
            <option value="">Selecione...</option>
            {availablePrerequisites.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-end pt-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
          Cancelar
        </button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-neon-blue text-vapor-dark hover:bg-neon-blue/80 flex items-center gap-2">
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Edit className="w-5 h-5" />
          )}
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export function AdminManageSubjects() {
  const {
    subjects,
    addSubject,
    deleteSubject,
    deleteClassFromSubject,
    updateSubject,
  } = useStudy();

  // Filtro de Soft Delete na Renderização
  const activeSubjects = subjects.filter((sub) => !sub.isArchived);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  // Estados de Interface Limpa (Accordions e Formulários)
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [activeClassForm, setActiveClassForm] = useState({
    subjectId: null,
    mode: null,
    classData: null,
  });

  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);
  const [deletingClassId, setDeletingClassId] = useState(null);

  const requiresPrerequisite = watch("requiresPrerequisite");

  // =====================================
  // AÇÕES
  // =====================================
  const onSubmitNewSubject = async (data) => {
    setIsCreating(true);
    try {
      const newSubject = {
        title: data.title,
        description: data.description,
        prerequisiteId: data.requiresPrerequisite ? data.prerequisiteId : null,
      };
      await addSubject(newSubject);
      reset();
    } catch (error) {
      alert("Houve um erro ao criar a disciplina.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleArchiveSubject = async (id) => {
    if (
      window.confirm(
        "Atenção: Deseja retirar esta disciplina da grade? O histórico dos alunos será mantido.",
      )
    ) {
      setDeletingSubjectId(id);
      try {
        await deleteSubject(id);
      } catch (error) {
        alert("Não foi possível excluir a disciplina.");
      } finally {
        setDeletingSubjectId(null);
      }
    }
  };

  const handleDeleteClass = async (subjectId, classId) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta aula permanentemente?",
      )
    ) {
      setDeletingClassId(classId);
      try {
        await deleteClassFromSubject(subjectId, classId);
      } catch (error) {
        alert("Falha ao excluir a aula.");
      } finally {
        setDeletingClassId(null);
      }
    }
  };

  // Toggle do Dropdown/Accordion
  const toggleAccordion = (id) => {
    setExpandedSubjectId(expandedSubjectId === id ? null : id);
    // Limpa formulários abertos se o menu colapsar
    setActiveClassForm({ subjectId: null, mode: null, classData: null });
  };

  return (
    <div className="space-y-10 animate-in fade-in pb-20">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">
          Gerenciar Disciplinas
        </h1>
        <p className="text-gray-400">
          Crie os módulos principais e gerencie suas aulas no menu expansível.
        </p>
      </header>

      {/* Formulário de Criação da Disciplina Principal */}
      <section className="bg-vapor-surface p-6 rounded-2xl border border-vapor-border shadow-neon-purple">
        <h2 className="text-2xl font-bold text-neon-purple mb-6 flex items-center gap-2">
          <PlusCircle className="w-6 h-6" /> Nova Disciplina
        </h2>
        <form onSubmit={handleSubmit(onSubmitNewSubject)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">
                Nome da Disciplina
              </label>
              <input
                {...register("title", { required: "O nome é obrigatório" })}
                className="w-full bg-vapor-dark border border-vapor-border rounded-lg p-3 text-white focus:border-neon-purple outline-none"
                placeholder="Ex: Banco de Dados I"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">
                Descrição Geral
              </label>
              <input
                {...register("description", {
                  required: "A descrição é obrigatória",
                })}
                className="w-full bg-vapor-dark border border-vapor-border rounded-lg p-3 text-white focus:border-neon-purple outline-none"
              />
            </div>
          </div>

          <div className="bg-vapor-dark p-4 rounded-lg border border-vapor-border space-y-4">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <input
                type="checkbox"
                {...register("requiresPrerequisite")}
                className="w-5 h-5 accent-neon-purple"
              />
              <span className="text-gray-300 font-medium">
                Requer conclusão de uma disciplina base?
              </span>
            </label>
            {requiresPrerequisite && (
              <div className="pt-2 animate-in fade-in">
                <select
                  {...register("prerequisiteId", {
                    required: requiresPrerequisite
                      ? "Selecione uma matéria"
                      : false,
                  })}
                  className="w-full max-w-md bg-gray-900 border border-neon-blue/50 rounded-lg p-3 text-white outline-none">
                  <option value="">Selecione...</option>
                  {activeSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-neon-purple text-white hover:bg-neon-purple/80 flex items-center gap-2">
              {isCreating && <Loader2 className="w-5 h-5 animate-spin" />}
              {isCreating ? "Criando..." : "Criar Módulo"}
            </Button>
          </div>
        </form>
      </section>

      {/* Lista de Disciplinas (Accordion e Interface Limpa) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">
          Módulos Cadastrados da Trilha
        </h2>

        {activeSubjects.length === 0 ? (
          <p className="text-gray-500 italic p-6 border border-dashed border-vapor-border rounded-xl text-center">
            Nenhuma disciplina ativa na grade atual.
          </p>
        ) : (
          activeSubjects.map((subject) => {
            const isExpanded = expandedSubjectId === subject.id;
            const isEditing = editingSubjectId === subject.id; // Verifica se esta matéria está em modo de edição

            return (
              <div
                key={subject.id}
                className={cn(
                  "bg-vapor-dark rounded-xl border transition-all",
                  isExpanded || isEditing
                    ? "border-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.15)]"
                    : "border-vapor-border hover:border-neon-blue/50",
                )}>
                {/* Se estiver editando, mostra o formulário. Senão, mostra o cabeçalho normal */}
                {isEditing ? (
                  <EditSubjectForm
                    subject={subject}
                    // Filtra para que a matéria não possa ser pré-requisito dela mesma
                    availablePrerequisites={activeSubjects.filter(
                      (s) => s.id !== subject.id,
                    )}
                    onCancel={() => setEditingSubjectId(null)}
                  />
                ) : (
                  <>
                    {/* HEADER DA DISCIPLINA */}
                    <div className="flex items-center justify-between p-5">
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => toggleAccordion(subject.id)}>
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
                          {subject.title}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-vapor-surface rounded-full text-gray-500 border border-vapor-border">
                          {subject.classes?.length || 0} aulas
                        </span>
                      </div>

                      {/* AGRUPAMENTO DOS BOTÕES DE AÇÃO */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingSubjectId(subject.id)}
                          title="Editar Disciplina"
                          className="p-2 text-gray-400 hover:text-neon-blue bg-vapor-surface rounded-lg border border-vapor-border transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleArchiveSubject(subject.id)}
                          disabled={deletingSubjectId === subject.id}
                          title="Excluir Módulo"
                          className="p-2 text-gray-400 hover:text-neon-pink bg-vapor-surface rounded-lg border border-vapor-border disabled:opacity-50 transition-colors">
                          {deletingSubjectId === subject.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-neon-pink" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* CORPO EXPANSÍVEL (AULAS) */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-vapor-border/30 bg-vapor-surface/30 rounded-b-xl animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center my-4">
                          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Aulas do Módulo
                          </h4>
                          <button
                            onClick={() =>
                              setActiveClassForm({
                                subjectId: subject.id,
                                mode: "create",
                                classData: null,
                              })
                            }
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-neon-blue/10 text-neon-blue rounded border border-neon-blue/30 hover:bg-neon-blue hover:text-vapor-dark transition-colors">
                            <PlusCircle className="w-3 h-3" /> Nova Aula
                          </button>
                        </div>

                        {/* Formulário de Criação Superior */}
                        {activeClassForm.mode === "create" &&
                          activeClassForm.subjectId === subject.id && (
                            <ClassForm
                              subjectId={subject.id}
                              onCancel={() =>
                                setActiveClassForm({
                                  subjectId: null,
                                  mode: null,
                                  classData: null,
                                })
                              }
                            />
                          )}

                        {/* Lista Vertical */}
                        <div className="space-y-2 mt-4">
                          {subject.classes && subject.classes.length > 0 ? (
                            subject.classes.map((cls, index) => (
                              <div
                                key={cls.id}
                                className="bg-vapor-dark p-3 rounded-lg border border-vapor-border flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500 font-mono w-6 text-right">
                                    {index + 1}.
                                  </span>
                                  <span className="font-medium text-gray-200">
                                    {cls.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      setActiveClassForm({
                                        subjectId: subject.id,
                                        mode: "edit",
                                        classData: cls,
                                      })
                                    }
                                    className="p-2 text-gray-400 hover:text-neon-blue rounded-md hover:bg-neon-blue/10"
                                    title="Editar">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteClass(subject.id, cls.id)
                                    }
                                    disabled={deletingClassId === cls.id}
                                    className="p-2 text-gray-400 hover:text-neon-pink rounded-md hover:bg-neon-pink/10 disabled:opacity-50"
                                    title="Excluir Aula">
                                    {deletingClassId === cls.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-neon-pink" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 italic p-4">
                              Nenhuma aula cadastrada.
                            </p>
                          )}
                        </div>

                        {/* Formulário de Edição (Aulas) */}
                        {activeClassForm.mode === "edit" &&
                          activeClassForm.subjectId === subject.id && (
                            <ClassForm
                              subjectId={subject.id}
                              initialData={activeClassForm.classData}
                              onCancel={() =>
                                setActiveClassForm({
                                  subjectId: null,
                                  mode: null,
                                  classData: null,
                                })
                              }
                            />
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
