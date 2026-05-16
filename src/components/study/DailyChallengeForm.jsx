// src/components/study/DailyChallengeForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { cn } from "../../utils/cn"; // Função de merge explicada no próximo tópico

export function DailyChallengeForm({ question, options, onSubmitChallenge }) {
  // Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Função chamada ao enviar o formulário validado
  const submitHandler = async (data) => {
    await onSubmitChallenge(data.selectedOption);
  };

  return (
    <div className="w-full max-w-2xl p-6 rounded-2xl bg-vapor-surface border border-vapor-border shadow-neon-purple">
      {/* Cabeçalho do Desafio */}
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-neon-pink" />
        <h2 className="text-xl font-bold text-gray-100">Desafio Diário</h2>
      </div>

      <p className="mb-6 text-lg text-gray-300">{question}</p>

      {/* Formulário gerenciado pelo React Hook Form */}
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center p-4 transition-all duration-200 border rounded-xl cursor-pointer bg-vapor-dark border-vapor-border hover:border-neon-blue hover:shadow-neon-blue group">
              <input
                type="radio"
                value={option.id}
                {...register("selectedOption", {
                  required: "Selecione uma resposta para continuar.",
                })}
                className="w-5 h-5 text-neon-blue bg-gray-800 border-gray-600 focus:ring-neon-blue focus:ring-2"
              />
              <span className="ml-4 text-gray-300 group-hover:text-white">
                {option.text}
              </span>
            </label>
          ))}
        </div>

        {/* Feedback de Erro (Validação do Hook Form) */}
        {errors.selectedOption && (
          <div className="flex items-center gap-2 mt-2 text-sm text-neon-pink">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.selectedOption.message}</span>
          </div>
        )}

        {/* Botão de Submissão */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center w-full gap-2 py-3 mt-6 font-semibold text-white transition-all rounded-lg",
            "bg-gradient-to-r from-neon-purple to-neon-blue",
            "hover:opacity-90 hover:shadow-neon-blue",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}>
          <CheckCircle2 className="w-5 h-5" />
          {isSubmitting ? "Validando..." : "Responder Desafio"}
        </button>
      </form>
    </div>
  );
}
