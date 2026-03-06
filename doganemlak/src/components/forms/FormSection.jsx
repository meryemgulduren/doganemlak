import FormField from "./FormField";

export default function FormSection({ section, fields, values, errors, onChange }) {
  if (!fields.length) return null;

  const gridCols =
    section.id === "price_area" || section.id === "property_details" || section.id === "address"
      ? "md:grid-cols-3"
      : "md:grid-cols-2";

  return (
    <section className="rounded-xl border border-[#e2d4b0] bg-white shadow-sm px-4 py-3 space-y-3">
      <header>
        <h3 className="text-sm font-semibold text-[#b8902d]">{section.label}</h3>
      </header>
      <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
        {fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            onChange={(val) => onChange(field, val)}
          />
        ))}
      </div>
    </section>
  );
}

