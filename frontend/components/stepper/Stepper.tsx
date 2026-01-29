type Step = {
  id: number;
  label: string;
};

const steps: Step[] = [
  { id: 1, label: "Identificação" },
  { id: 2, label: "Relato" },
  { id: 3, label: "Anexos" },
  { id: 4, label: "Revisão" },
];

type Props = {
  currentStep: number;
};

export default function Stepper({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const ativo = step.id === currentStep;
        const concluido = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center w-full">
            {/* Círculo + label */}
            <div className="flex flex-col items-center min-w-16">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${concluido
                    ? "bg-green-600 text-white"
                    : ativo
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
              >
                {step.id}
              </div>

              <span
                className={`mt-1 text-xs text-center whitespace-nowrap
                  ${ativo
                    ? "text-blue-400 font-semibold"
                    : concluido
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
              >
                {step.label}
              </span>
            </div>

            {/* Linha de conexão */}
            {index < steps.length - 1 && (
              <div className="flex-1 flex items-center">
                <div
                  className={`h-px w-full mx-2
                    ${step.id < currentStep
                      ? "bg-green-600"
                      : "bg-gray-700"
                    }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
