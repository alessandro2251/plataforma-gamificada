// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StudyProvider } from "./contexts/StudyContext";
import { useStudy } from "./hooks/useStudy";
import { Login } from "./pages/Login";
import { StudentLayout } from "./components/layout/StudentLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Subjects } from "./pages/Subjects";
import { Rewards } from "./pages/Rewards";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminManageSubjects } from "./pages/admin/AdminManageSubjects";
import { SubjectPlayer } from "./pages/SubjectPlayer";
import { DailyChallenge } from "./pages/DailyChallenge";
import { AdminManageChallenges } from "./pages/admin/AdminManageChallenges";
import { WeeklyChallenge } from "./pages/WeeklyChallenge";

// O Roteador Dinâmico
function AppRouter() {
  const { currentUser } = useStudy();

  // Se não estiver logado, exibe a Página de Login
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Rotas do Administrador
  if (currentUser.role === "admin") {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route
            path="/gerenciar-disciplinas"
            element={<AdminManageSubjects />}
          />
          <Route
            path="/gerenciar-desafios"
            element={<AdminManageChallenges />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AdminLayout>
    );
  }

  // Rotas do Aluno
  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/disciplinas" element={<Subjects />} />
        <Route path="/disciplinas/:id" element={<SubjectPlayer />} />
        <Route path="/desafio-diario" element={<DailyChallenge />} />
        <Route path="/recompensas" element={<Rewards />} />
        <Route path="/desafio-semanal" element={<WeeklyChallenge />} />

        {/* A rota coringa (*) DEVE ficar sempre por último */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </StudentLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StudyProvider>
        <AppRouter />
      </StudyProvider>
    </BrowserRouter>
  );
}

export default App;
