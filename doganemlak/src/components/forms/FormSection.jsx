import FormField from "./FormField";

export default function FormSection({ section, fields }) {
  if (!fields.length) return null;

  const gridCols =
    section.id === "price_area" || section.id === "property_details" || section.id === "address"
      ? "md:grid-cols-3"
      : "md:grid-cols-2";

  // Group consecutive checkboxes together
  const groupedFields = [];
  let currentCheckboxGroup = [];

  fields.forEach((field) => {
    if (field.type === "checkbox") {
      currentCheckboxGroup.push(field);
    } else {
      if (currentCheckboxGroup.length > 0) {
        groupedFields.push({
          isGroup: true,
          id: `group-${currentCheckboxGroup[0].id}`,
          fields: currentCheckboxGroup,
        });
        currentCheckboxGroup = [];
      }
      groupedFields.push(field);
    }
  });

  if (currentCheckboxGroup.length > 0) {
    groupedFields.push({
      isGroup: true,
      id: `group-${currentCheckboxGroup[0].id}`,
      fields: currentCheckboxGroup,
    });
  }

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-3 space-y-3">
      <header className="flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-secondary flex-shrink-0" />
        <h3 className="text-sm font-semibold text-slate-600">{section.label}</h3>
      </header>
      <div className={`grid grid-cols-1 ${gridCols} gap-3 items-start`}>
        {groupedFields.map((item) => {
          if (item.isGroup) {
            // Determine row span based on number of checkboxes to optimize space
            // Assuming each standard input+label takes roughly 1 row, and 2-3 checkboxes equal 1 row
            const rowSpanClass = item.fields.length >= 4 ? "row-span-3" : item.fields.length >= 2 ? "row-span-2" : "";
            return (
              <div key={item.id} className={`space-y-1 ${rowSpanClass}`}>
                <label className="block text-xs font-medium text-text-dark mb-0.5" aria-hidden="true">&nbsp;</label>
                <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-border rounded-lg h-[calc(100%-20px)] justify-center">
                  {item.fields.map((field) => (
                    <FormField key={field.id} field={{ ...field, hideLabel: true }} />
                  ))}
                </div>
              </div>
            );
          }
          return <FormField key={item.id} field={item} />;
        })}
      </div>
    </section>
  );
}
