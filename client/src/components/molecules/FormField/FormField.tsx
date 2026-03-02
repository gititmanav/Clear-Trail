import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import Input from "@atoms/Input";

/* ── Types ── */

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  inputSize?: "sm" | "md" | "lg";
  /** Render a custom input instead of the default Input atom */
  children?: ReactNode;
}

/* ── Component ── */

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, inputSize = "md", children, id, ...inputProps }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex-stack" style={{ gap: "0.375rem" }}>
        {/* Label */}
        <label htmlFor={fieldId} className="text-label block">
          {label}
          {inputProps.required && (
            <span className="text-danger-500 ml-0.5">*</span>
          )}
        </label>

        {/* Input or custom child */}
        {children || (
          <Input
            ref={ref}
            id={fieldId}
            error={!!error}
            inputSize={inputSize}
            {...inputProps}
          />
        )}

        {/* Error message */}
        {error && (
          <p className="text-xs text-danger-500 animate-fade-in">{error}</p>
        )}

        {/* Hint text */}
        {!error && hint && (
          <p className="text-xs text-surface-400">{hint}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
export default FormField;
