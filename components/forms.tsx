import type { ComponentPropsWithoutRef } from "react";

type FieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
};

export function TextField({ label, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field" {...props} />
    </label>
  );
}

type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & {
  label: string;
};

export function TextArea({ label, ...props }: TextAreaProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea className="field min-h-28 resize-y" {...props} />
    </label>
  );
}

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label: string;
  options: string[];
};

export function SelectField({ label, options, ...props }: SelectProps) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" {...props}>
        <option value="">Seleccione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
