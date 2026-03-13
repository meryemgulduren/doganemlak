import { useFormContext, Controller } from "react-hook-form";

export default function FormField({ field }) {
  const { register, control, formState: { errors } } = useFormContext();
  const error = errors[field.id]?.message;

  const commonProps = {
    id: field.id,
    className: "w-full px-3 py-2 border border-accent/60 rounded-lg text-sm",
  };

  let input = null;
  if (field.type === "textarea") {
    input = (
      <textarea
        {...commonProps}
        {...register(field.id)}
        rows={field.rows || 4}
        placeholder={field.placeholder}
      />
    );
  } else if (field.type === "select") {
    input = (
      <select
        {...commonProps}
        {...register(field.id)}
      >
        <option value="">{field.placeholder || "Seçiniz"}</option>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "checkbox") {
    input = (
      <div className="flex items-center h-[38px]">
        <label className="inline-flex items-center gap-2 text-sm text-text-dark cursor-pointer">
          <input
            type="checkbox"
            {...register(field.id)}
            className="rounded border-accent/60 w-4 h-4 cursor-pointer text-primary focus:ring-primary/40 focus:ring-offset-0 transition-colors"
          />
          <span className="select-none">{field.label}</span>
        </label>
      </div>
    );
  } else if (field.type === "checkbox_group") {
    input = (
      <Controller
        name={field.id}
        control={control}
        render={({ field: { value, onChange } }) => {
          const currentValues = Array.isArray(value) ? value : [];
          const handleCheck = (opt, checked) => {
            if (checked) {
              onChange([...currentValues, opt]);
            } else {
              onChange(currentValues.filter((v) => v !== opt));
            }
          };
          return (
            <div className="flex flex-wrap gap-3">
              {(field.options || []).map((opt) => (
                <label key={opt} className="inline-flex items-center gap-1.5 text-xs cursor-pointer text-text-dark">
                  <input
                    type="checkbox"
                    checked={currentValues.includes(opt)}
                    onChange={(e) => handleCheck(opt, e.target.checked)}
                    className="rounded border-accent/60"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          );
        }}
      />
    );
  } else {
    // text / number / default
    input = (
      <input
        {...commonProps}
        {...register(field.id)}
        type={field.type || "text"}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <div className={field.hideLabel ? "" : "space-y-1"}>
      {field.type !== "checkbox" ? (
        <label
          htmlFor={field.id}
          className="block text-xs font-medium text-text-dark mb-0.5"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      ) : (
        !field.hideLabel && (
          <label className="block text-xs mb-0.5 invisible" aria-hidden="true">
            &nbsp;
          </label>
        )
      )}
      {input}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
