import { useMemo, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sections, fieldDefinitions, resolveCategoryLayout } from "../../config/formConfig";
import { generateListingSchema } from "../../config/formSchemas";
import FormSection from "./FormSection";
import FeaturesAccordion from "./FeaturesAccordion";
import AddressCascader from "./AddressCascader";
import MediaUploadSection from "./MediaUploadSection";

const FACADE_OPTIONS = ["Batı", "Doğu", "Güney", "Kuzey"];

export default function DynamicListingForm({
  category,
  listingType,
  subType,
  initialValues,
  featureDefinitions,
  onSubmit,
  saving,
}) {
  const layout = useMemo(
    () => resolveCategoryLayout(category, listingType, subType),
    [category, listingType, subType]
  );

  const dynamicSchema = useMemo(
    () => generateListingSchema(category, listingType, subType),
    [category, listingType, subType]
  );

  const defaultValues = useMemo(() => {
    // Transform initialValues to flat RHF structure
    const base = {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price ?? "",
      currency: initialValues?.currency ?? "TRY",
      location: initialValues?.location || { city: "", district: "", neighborhood: "", address_details: "" },
      media: initialValues?.media || { images: [], videos: [] },
      features: initialValues?.features ?? [],
      facade: initialValues?.facade ?? [],
      commercial_features:
        initialValues?.specifications?.commercial_features ??
        initialValues?.commercial_features ??
        [],
    };

    // Pull specifications up
    const specs = initialValues?.specifications || {};
    const specsDefaults = {
      m2_brut: specs.m2_brut ?? initialValues?.m2_brut ?? "",
      m2_net: specs.m2_net ?? initialValues?.m2_net ?? "",
      room_count: specs.room_count ?? initialValues?.room_count ?? "",
      building_age: specs.building_age ?? initialValues?.building_age ?? "",
      floor_number: specs.floor_number ?? initialValues?.floor_number ?? "",
      total_floors: specs.total_floors ?? initialValues?.total_floors ?? "",
      heating_type: specs.heating_type ?? initialValues?.heating_type ?? "",
      bathroom_count: specs.bathroom_count ?? initialValues?.bathroom_count ?? "",
      balcony: specs.balcony ?? (typeof initialValues?.balcony === "boolean" ? initialValues.balcony : false),
      furnished: specs.furnished ?? (typeof initialValues?.furnished === "boolean" ? initialValues.furnished : false),
      using_status: specs.using_status ?? initialValues?.using_status ?? "",
      in_site: specs.in_site ?? (typeof initialValues?.in_site === "boolean" ? initialValues.in_site : false),
      credit_eligible: specs.credit_eligible ?? (typeof initialValues?.credit_eligible === "boolean" ? initialValues.credit_eligible : false),
      dues: specs.dues ?? initialValues?.dues ?? "",
      title_deed_status: specs.title_deed_status ?? initialValues?.title_deed_status ?? "",
      kitchen_type: specs.kitchen_type ?? "",
      elevator: specs.elevator ?? "",
      parking: specs.parking ?? "",
      registry_number: specs.registry_number ?? "",
      swap_option: specs.swap_option ?? "",
      property_condition: specs.property_condition ?? initialValues?.property_condition ?? "",
      has_tenant: specs.has_tenant ?? initialValues?.has_tenant ?? "",
      open_area_m2: specs.open_area_m2 ?? initialValues?.open_area_m2 ?? "",
    };

    return { ...base, ...specsDefaults };
  }, [initialValues]);

  const methods = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
    mode: "onSubmit", // Validation occurs on submit
  });

  // Re-run validation or reset default fields if category changes completely
  useEffect(() => {
    // keeping current form state, but validating against the new schema
    // if required we could do methods.reset(methods.getValues());
  }, [dynamicSchema]);

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

  const handleValidSubmit = (data) => {
    const {
      location,
      media,
      features,
      facade,
      commercial_features,
      title,
      description,
      price,
      currency,
      ...specs
    } = data;

    const payload = {
      core: {
        title,
        description,
        price,
        currency,
        listing_type: listingType || "SATILIK",
        location,
        facade,
      },
      specifications: {
        ...specs,
        ...(subType === "DUKKAN_MAGAZA" ? { commercial_features } : {}),
      },
      features,
      media,
      category,
      listingType,
      subType,
    };
    onSubmit?.(payload);
  };

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleValidSubmit)} className="space-y-4">
        {sortedSections.map((section) => {
          if (section.id === "features") {
            return (
              <Controller
                key={`ctrl-features`}
                name="features"
                render={({ field: featuresField }) => (
                  <Controller
                    name="commercial_features"
                    render={({ field: commField }) => (
                      <Controller
                        name="facade"
                        render={({ field: facadeField }) => (
                          <FeaturesAccordion
                            key={section.id}
                            category={category}
                            subType={subType}
                            featureDefinitions={featureDefinitions}
                            selectedIds={featuresField.value}
                            onChange={featuresField.onChange}
                            commercialFeatures={commField.value}
                            onCommercialFeaturesChange={commField.onChange}
                            facadeOptions={FACADE_OPTIONS}
                            facadeValue={facadeField.value}
                            onFacadeChange={facadeField.onChange}
                          />
                        )}
                      />
                    )}
                  />
                )}
              />
            );
          }

          if (section.id === "address") {
            return (
              <section
                key={section.id}
                className="rounded-xl border border-border bg-surface shadow-sm px-4 py-3 space-y-3"
              >
                <header className="flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-warning flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-600">Adres Bilgileri</h3>
                </header>
                <Controller
                  name="location"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <AddressCascader value={value} onChange={onChange} />
                      {error && error.city && <p className="text-xs text-danger">{error.city.message}</p>}
                      {error && error.district && <p className="text-xs text-danger">{error.district.message}</p>}
                    </>
                  )}
                />
              </section>
            );
          }

          const sectionFields = allFields.filter((f) => f.section === section.id);
          return (
            <FormSection
              key={section.id}
              section={section}
              fields={sectionFields}
            />
          );
        })}

        <Controller
          name="media"
          render={({ field: { value, onChange } }) => (
            <MediaUploadSection media={value} onChange={onChange} />
          )}
        />

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
    </FormProvider>
  );
}
