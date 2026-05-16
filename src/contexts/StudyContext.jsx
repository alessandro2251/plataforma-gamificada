// src/contexts/StudyContext.jsx
import { createContext, useState, useEffect, useMemo } from "react";

export const StudyContext = createContext({});

const API_URL = "http://localhost:3001";

export function StudyProvider({ children }) {
  const [challenges, setChallenges] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  // ==========================================
  // CARGA INICIAL (GET) - DB.JSON
  // ==========================================
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/subjects`);
        if (!response.ok) throw new Error("Erro ao buscar disciplinas da API.");
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Falha na carga inicial de disciplinas:", error);
      }
    };
    fetchSubjects();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok)
        throw new Error("Erro ao conectar com o banco de usuários.");
      const users = await response.json();
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };
  const logout = () => setCurrentUser(null);

  const studentSubjects = useMemo(() => {
    if (!currentUser || currentUser.role !== "student") return subjects;

    // O aluno não deve ver matérias arquivadas
    const activeSubjects = subjects.filter((s) => !s.isArchived);

    return activeSubjects.map((subject) => {
      const isCompleted = currentUser.completedSubjectIds.includes(subject.id);
      let isUnlocked = true;
      if (subject.prerequisiteId !== null) {
        isUnlocked = currentUser.completedSubjectIds.includes(
          subject.prerequisiteId,
        );
      }
      let status = "locked";
      if (isCompleted) status = "completed";
      else if (isUnlocked) status = "unlocked";
      return { ...subject, status };
    });
  }, [subjects, currentUser]);

  const completeSubject = async (subjectId) => {
    if (!currentUser || currentUser.role !== "student") return;
    if (currentUser.completedSubjectIds.includes(subjectId)) return;
    const updatedCompletedSubjects = [
      ...currentUser.completedSubjectIds,
      subjectId,
    ];
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedSubjectIds: updatedCompletedSubjects }),
      });
      if (!response.ok) throw new Error(`Erro API: ${response.status}`);
      setCurrentUser({
        ...currentUser,
        completedSubjectIds: updatedCompletedSubjects,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // LÓGICA DO ADMINISTRADOR (DISCIPLINAS)
  // ==========================================
  const addSubject = async (newSubject) => {
    try {
      const payload = {
        ...newSubject,
        prerequisiteId: newSubject.prerequisiteId || null,
        classes: [],
        isArchived: false, // Soft delete status inicial
      };
      const response = await fetch(`${API_URL}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erro ao criar disciplina.");
      const createdSubject = await response.json();
      setSubjects((prev) => [...prev, createdSubject]);
    } catch (error) {
      console.error("Erro no addSubject:", error);
    }
  };

  const updateSubject = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Erro ao atualizar disciplina.");
      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((subj) => (subj.id === id ? updatedSubject : subj)),
      );
    } catch (error) {
      console.error("Erro no updateSubject:", error);
    }
  };

  // ==========================================
  // EXCLUSÃO LÓGICA EM CASCATA (SOFT DELETE)
  // ==========================================
  const deleteSubject = async (id) => {
    try {
      // 1. Arquiva a Disciplina
      const response = await fetch(`${API_URL}/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      if (!response.ok) throw new Error("Erro ao arquivar disciplina.");

      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((subj) => (subj.id === id ? updatedSubject : subj)),
      );

      // 2. Arquiva os Desafios Relacionados (Cascata)
      const chalRes = await fetch(`${API_URL}/challenges`);
      const allChallenges = await chalRes.json();
      const relatedChallenges = allChallenges.filter(
        (c) => String(c.subjectId) === String(id) && !c.isArchived,
      );

      await Promise.all(
        relatedChallenges.map((chal) =>
          fetch(`${API_URL}/challenges/${chal.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isArchived: true }),
          }),
        ),
      );
    } catch (error) {
      console.error("Erro no deleteSubject em cascata (Soft Delete):", error);
    }
  };

  // ==========================================
  // LÓGICA DO ADMINISTRADOR (AULAS / CLASSES)
  // ==========================================
  const addClassToSubject = async (subjectId, classData) => {
    try {
      const subject = subjects.find((s) => s.id === subjectId);
      const newClass = { ...classData, id: `class-${Date.now()}` };
      const updatedClasses = [...(subject.classes || []), newClass];
      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: updatedClasses }),
      });
      if (!response.ok) throw new Error("Erro ao adicionar aula.");
      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((subj) => (subj.id === subjectId ? updatedSubject : subj)),
      );
    } catch (error) {
      console.error("Erro no addClass:", error);
    }
  };

  const updateClassInSubject = async (subjectId, classId, updatedClassData) => {
    try {
      const subject = subjects.find((s) => s.id === subjectId);
      const updatedClasses = subject.classes.map((cls) =>
        cls.id === classId ? { ...cls, ...updatedClassData } : cls,
      );
      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: updatedClasses }),
      });
      if (!response.ok) throw new Error("Erro ao editar aula.");
      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((subj) => (subj.id === subjectId ? updatedSubject : subj)),
      );
    } catch (error) {
      console.error("Erro no updateClass:", error);
    }
  };

  const deleteClassFromSubject = async (subjectId, classId) => {
    try {
      const subject = subjects.find((s) => s.id === subjectId);
      const updatedClasses = subject.classes.filter(
        (cls) => cls.id !== classId,
      );
      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes: updatedClasses }),
      });
      if (!response.ok) throw new Error("Erro ao excluir aula.");
      const updatedSubject = await response.json();
      setSubjects((prev) =>
        prev.map((subj) => (subj.id === subjectId ? updatedSubject : subj)),
      );
    } catch (error) {
      console.error("Erro no deleteClass:", error);
    }
  };

  return (
    <StudyContext.Provider
      value={{
        currentUser,
        login,
        logout,
        subjects,
        students,
        addSubject,
        updateSubject,
        deleteSubject,
        studentSubjects,
        completeSubject,
        addClassToSubject,
        updateClassInSubject,
        deleteClassFromSubject,
      }}>
      {children}
    </StudyContext.Provider>
  );
}
