const BASE_URL = `${import.meta.env.VITE_API_URL}`;

// ==========================================
// SERVIÇOS DO ALUNO
// ==========================================

// Função auxiliar para zerar as horas e calcular a diferença real em dias
const getDaysDifference = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

export const updateStudentStreak = async (user) => {
  const today = new Date().toISOString().split("T")[0]; // Retorna YYYY-MM-DD
  const lastLogin = user.lastLogin;

  // Se for o primeiro login da vida do aluno
  if (!lastLogin) {
    return await fetch(`${BASE_URL}/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastLogin: today,
        currentStreak: 1,
        maxStreak: 1,
      }),
    }).then((res) => res.json());
  }

  const diffDays = getDaysDifference(lastLogin, today);

  // Se já logou hoje, não faz nada
  if (diffDays === 0) return user;

  let newStreak = user.currentStreak;
  let newMaxStreak = user.maxStreak;

  if (diffDays === 1) {
    // Login em dias consecutivos: incrementa a ofensiva
    newStreak += 1;
    if (newStreak > newMaxStreak) newMaxStreak = newStreak;
  } else {
    // Pulou um dia ou mais: quebrou a ofensiva. Reseta para 1.
    newStreak = 1;
  }

  // PATCH atualiza apenas os campos enviados, preservando o resto (nome, email, etc)
  const response = await fetch(`${BASE_URL}/users/${user.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lastLogin: today,
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
    }),
  });

  return await response.json();
};

export const completeSubject = async (
  userId,
  currentCompletedIds,
  newSubjectId,
) => {
  // Evita duplicação caso a requisição seja disparada duas vezes
  if (currentCompletedIds.includes(newSubjectId)) return;

  const updatedIds = [...currentCompletedIds, newSubjectId];

  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completedSubjectIds: updatedIds }),
  });

  return await response.json();
};

export const registerCompletedChallenge = async (userId, challengeId) => {
  const payload = {
    id: `cc-${Date.now()}`,
    userId,
    challengeId,
    completionDate: new Date().toISOString(),
  };

  const response = await fetch(`${BASE_URL}/completed_challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return await response.json();
};

// ==========================================
// SERVIÇOS DO ADMINISTRADOR
// ==========================================

export const createSubject = async (subjectData) => {
  const response = await fetch(`${BASE_URL}/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...subjectData, id: Date.now() }), // Gera ID numérico
  });
  return await response.json();
};

export const createChallenge = async (challengeData) => {
  const response = await fetch(`${BASE_URL}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...challengeData, id: `chal-${Date.now()}` }),
  });
  return await response.json();
};
