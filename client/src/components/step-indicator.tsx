import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{
    number: number;
    label: string;
  }>;
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="step-indicator flex items-center space-x-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                step.number <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              data-testid={`step-indicator-${step.number}`}
            >
              {step.number}
            </div>
            <span
              className={cn(
                "font-medium",
                step.number <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
