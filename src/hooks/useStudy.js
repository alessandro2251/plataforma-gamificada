// src/hooks/useStudy.js
import { useContext } from "react";
import { StudyContext } from "../contexts/StudyContext";

export function useStudy() {
  const context = useContext(StudyContext);

  if (!context || Object.keys(context).length === 0) {
    throw new Error("useStudy deve ser usado dentro de um StudyProvider");
  }

  return context;
}
