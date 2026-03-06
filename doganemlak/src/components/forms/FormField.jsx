export default function FormField({ field, value, error, onChange }) {
  const commonProps = {
    id: field.id,
    name: field.id,
    className: "w-full px-3 py-2 border border-accent/60 rounded-lg text-sm",
  };

  let input = null;
  if (field.type === "textarea") {
    input = (
      <textarea
        {...commonProps}
        rows={field.rows || 4}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  } else if (field.type === "select") {
    input = (
      <select
        {...commonProps}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
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
      <label className="inline-flex items-center gap-2 text-sm text-text-dark">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-accent/60"
        />
        <span>{field.label}</span>
      </label>
    );
  } else {
    // text / number / default
    input = (
      <input
        {...commonProps}
        type={field.type || "text"}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div className="space-y-1">
      {field.type !== "checkbox" && (
        <label
          htmlFor={field.id}
          className="block text-xs font-medium text-text-dark mb-0.5"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {input}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

