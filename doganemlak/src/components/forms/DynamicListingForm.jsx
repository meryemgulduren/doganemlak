import { useMemo, useState } from "react";
import { sections, fieldDefinitions, resolveCategoryLayout } from "../../config/formConfig";
import FormSection from "./FormSection";
import FeaturesAccordion from "./FeaturesAccordion";
import AddressCascader from "./AddressCascader";

/**
 * Dinamik ilan detay formu.
 * core + specifications + features + location verisini toplar.
 */
export default function DynamicListingForm({
  category,
  listingType,
  subType,
  initialValues,
  featureDefinitions,
  onSubmit,
  saving,
}) {
  const [core, setCore] = useState(() => ({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    price: initialValues?.price ?? "",
    currency: initialValues?.currency ?? "TRY",
  }));

  const [specifications, setSpecifications] = useState(() => ({
    // Öncelik specifications içindeki değerlerde; yoksa top-level alanlara düşer.
    m2_brut: initialValues?.specifications?.m2_brut ?? initialValues?.m2_brut ?? "",
    m2_net: initialValues?.specifications?.m2_net ?? initialValues?.m2_net ?? "",
    room_count: initialValues?.specifications?.room_count ?? initialValues?.room_count ?? "",
    building_age:
      initialValues?.specifications?.building_age ?? initialValues?.building_age ?? "",
    floor_number:
      initialValues?.specifications?.floor_number ?? initialValues?.floor_number ?? "",
    total_floors:
      initialValues?.specifications?.total_floors ?? initialValues?.total_floors ?? "",
    heating_type:
      initialValues?.specifications?.heating_type ?? initialValues?.heating_type ?? "",
    bathroom_count:
      initialValues?.specifications?.bathroom_count ?? initialValues?.bathroom_count ?? "",
    balcony:
      initialValues?.specifications?.balcony ??
      (typeof initialValues?.balcony === "boolean" ? initialValues.balcony : false),
    furnished:
      initialValues?.specifications?.furnished ??
      (typeof initialValues?.furnished === "boolean" ? initialValues.furnished : false),
    using_status:
      initialValues?.specifications?.using_status ?? initialValues?.using_status ?? "",
    in_site:
      initialValues?.specifications?.in_site ??
      (typeof initialValues?.in_site === "boolean" ? initialValues.in_site : false),
    credit_eligible:
      initialValues?.specifications?.credit_eligible ??
      (typeof initialValues?.credit_eligible === "boolean"
        ? initialValues.credit_eligible
        : false),
    dues: initialValues?.specifications?.dues ?? initialValues?.dues ?? "",
    title_deed_status:
      initialValues?.specifications?.title_deed_status ??
      initialValues?.title_deed_status ??
      "",
    kitchen_type: initialValues?.specifications?.kitchen_type ?? "",
    elevator: initialValues?.specifications?.elevator ?? "",
    parking: initialValues?.specifications?.parking ?? "",
    registry_number: initialValues?.specifications?.registry_number ?? "",
    swap_option: initialValues?.specifications?.swap_option ?? "",
  }));

  const [location, setLocation] = useState(
    initialValues?.location || { city: "", district: "", neighborhood: "" }
  );
  const [features, setFeatures] = useState(initialValues?.features ?? []);
  const [errors, setErrors] = useState({});

  const layout = useMemo(
    () => resolveCategoryLayout(category, listingType, subType),
    [category, listingType, subType]
  );

  const allFields = useMemo(() => {
    const ids = [...(layout.requiredFields || []), ...(layout.optionalFields || [])];
    return ids
      .map((id) => fieldDefinitions[id])
      .filter(Boolean)
      .map((f) => ({
        ...f,
        required: (layout.requiredFields || []).includes(f.id),
      }));
  }, [layout]);

  const values = useMemo(() => {
    const base = {
      title: core.title,
      description: core.description,
      price: core.price,
      city: location.city,
      district: location.district,
      neighborhood: location.neighborhood,
    };
    return { ...specifications, ...base };
  }, [core, specifications, location]);

  const handleFieldChange = (field, value) => {
    if (field.section === "basic" || field.id === "price") {
      setCore((prev) => ({ ...prev, [field.id]: value }));
    } else if (field.section === "address") {
      if (field.id === "city") setLocation((prev) => ({ ...prev, city: value }));
      else if (field.id === "district") setLocation((prev) => ({ ...prev, district: value }));
      else if (field.id === "neighborhood") setLocation((prev) => ({ ...prev, neighborhood: value }));
    } else {
      setSpecifications((prev) => ({ ...prev, [field.id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    for (const id of layout.requiredFields || []) {
      const val = values[id];
      if (
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "")
      ) {
        newErrors[id] = "Bu alan zorunludur.";
      }
    }
    if (!location.city || !location.district) {
      newErrors.city = newErrors.city || (!location.city ? "İl zorunludur." : undefined);
      newErrors.district =
        newErrors.district || (!location.district ? "İlçe zorunludur." : undefined);
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = {
      core: {
        ...core,
        listing_type: listingType,
        property_type: undefined, // backend map fonksiyonu zaten category/subType'tan üretiyor
        location,
      },
      specifications,
      features,
      category,
      listingType,
      subType,
    };
    onSubmit?.(payload);
  };

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sortedSections.map((section) => {
        if (section.id === "features") {
          return (
            <FeaturesAccordion
              key={section.id}
              featureDefinitions={featureDefinitions}
              selectedIds={features}
              onChange={setFeatures}
            />
          );
        }

        if (section.id === "address") {
          return (
            <section
              key={section.id}
              className="rounded-xl border border-[#e2d4b0] bg-white shadow-sm px-4 py-3 space-y-3"
            >
              <h3 className="text-sm font-semibold text-[#b8902d]">Adres Bilgileri</h3>
              <AddressCascader value={location} onChange={setLocation} />
              {(errors.city || errors.district) && (
                <p className="text-xs text-red-600">
                  {errors.city || errors.district}
                </p>
              )}
            </section>
          );
        }

        const sectionFields = allFields.filter((f) => f.section === section.id);
        return (
          <FormSection
            key={section.id}
            section={section}
            fields={sectionFields}
            values={values}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      })}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </form>
  );
}

