import { useMemo, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sections, fieldDefinitions, resolveCategoryLayout } from "../../config/formConfig";
import { generateListingSchema } from "../../config/formSchemas";
import FormSection from "./FormSection";
import FeaturesAccordion from "./FeaturesAccordion";
import LocationSelector from "./LocationSelector";
import MediaUploadSection from "./MediaUploadSection";
import samsunData from "../../data/samsun-geo.json";

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
      location: initialValues?.location || { 
        city: "Samsun", 
        district: "", 
        neighborhood: "", 
        address_details: "",
        coordinates: initialValues?.location?.coordinates || { lat: null, lng: null }
      },
      media: initialValues?.media || { images: [], videos: [] },
      features: initialValues?.features ?? [],
      facade: initialValues?.facade ?? [],
      commercial_features:
        initialValues?.specifications?.commercial_features ??
        initialValues?.commercial_features ??
        [],
      arsa_features: initialValues?.specifications?.arsa_features ?? [],
      bina_features: initialValues?.specifications?.bina_features ?? [],
    };

    // Pull specifications up
    const specs = initialValues?.specifications || {};
    const specsDefaults = {
      m2_brut: specs.m2_brut ?? initialValues?.m2_brut ?? "",
      bina_m2: specs.m2_brut ?? initialValues?.m2_brut ?? "",
      arsa_m2: specs.m2_brut ?? initialValues?.m2_brut ?? "",
      m2_net: specs.m2_net ?? initialValues?.m2_net ?? "",
      zoning_status: specs.zoning_status ?? "",
      ada_no: specs.ada_no ?? "",
      parsel_no: specs.parsel_no ?? "",
      pafta_no: specs.pafta_no ?? "",
      kaks_emsal: specs.kaks_emsal ?? "",
      gabari: specs.gabari ?? "",
      arsa_credit_eligible:
        typeof specs.credit_eligible === "boolean"
          ? (specs.credit_eligible ? "Evet" : "Hayır")
          : "",
      room_count: specs.room_count ?? initialValues?.room_count ?? "",
      building_age: specs.building_age ?? initialValues?.building_age ?? "",
      floor_number: specs.floor_number ?? initialValues?.floor_number ?? "",
      total_floors: specs.total_floors ?? initialValues?.total_floors ?? "",
      heating_type: specs.heating_type ?? initialValues?.heating_type ?? "",
      bina_heating_type: specs.heating_type ?? initialValues?.heating_type ?? "",
      apartment_count: specs.apartment_count ?? initialValues?.apartment_count ?? "",
      bathroom_count: specs.bathroom_count ?? initialValues?.bathroom_count ?? "",
      balcony: specs.balcony ?? (typeof initialValues?.balcony === "boolean" ? initialValues.balcony : false),
      furnished: specs.furnished ?? (typeof initialValues?.furnished === "boolean" ? initialValues.furnished : false),
      using_status: specs.using_status ?? initialValues?.using_status ?? "",
      in_site: specs.in_site ?? (typeof initialValues?.in_site === "boolean" ? initialValues.in_site : false),
      credit_eligible: specs.credit_eligible ?? (typeof initialValues?.credit_eligible === "boolean" ? initialValues.credit_eligible : false),
      dues: specs.dues ?? initialValues?.dues ?? "",
      title_deed_status: specs.title_deed_status ?? initialValues?.title_deed_status ?? "",
      ground_survey: specs.ground_survey ?? initialValues?.ground_survey ?? "",
      bina_type: specs.bina_type ?? initialValues?.bina_type ?? "",
      kitchen_type: specs.kitchen_type ?? "",
      elevator: specs.elevator ?? "",
      parking: specs.parking ?? "",
      registry_number: specs.registry_number ?? "",
      swap_option: specs.swap_option ?? "",
      property_condition: specs.property_condition ?? initialValues?.property_condition ?? "",
      has_tenant: specs.has_tenant ?? initialValues?.has_tenant ?? "",
      open_area_m2: specs.open_area_m2 ?? initialValues?.open_area_m2 ?? "",
    };

    // Tüm kategori/spec alanlarını generic olarak koru; explicit mapping'ler bunu gerektiğinde override eder.
    return { ...base, ...specs, ...specsDefaults };
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
        required: f.id === "title" || f.id === "description",
      }));
  }, [layout]);

  const handleValidSubmit = (data) => {
    const {
      location,
      media,
      features,
      facade,
      commercial_features,
      arsa_features,
      bina_features,
      title,
      description,
      price,
      currency,
      ...specs
    } = data;

    const normalizedSpecs = { ...specs };
    if (category === "ARSA") {
      normalizedSpecs.m2_brut = normalizedSpecs.arsa_m2;
      delete normalizedSpecs.arsa_m2;
      const arsaCredit = normalizedSpecs.arsa_credit_eligible;
      if (arsaCredit === "Evet") normalizedSpecs.credit_eligible = true;
      if (arsaCredit === "Hayır") normalizedSpecs.credit_eligible = false;
      delete normalizedSpecs.arsa_credit_eligible;
    }
    if (category === "BINA") {
      normalizedSpecs.m2_brut = normalizedSpecs.bina_m2;
      normalizedSpecs.heating_type = normalizedSpecs.bina_heating_type;
      delete normalizedSpecs.bina_m2;
      delete normalizedSpecs.bina_heating_type;
    }

    let finalLocation = { ...location };
    if (!finalLocation.coordinates || finalLocation.coordinates.lat == null) {
      if (finalLocation.district) {
        const dist = samsunData.districts.find(d => d.name === finalLocation.district);
        if (dist) {
          let fallbackCoords = dist.coordinates;
          if (finalLocation.neighborhood) {
             const nb = dist.neighborhoods?.find(n => (typeof n === 'object' ? n.name : n) === finalLocation.neighborhood);
             if (nb && typeof nb === 'object' && nb.coordinates) fallbackCoords = nb.coordinates;
          }
          if (fallbackCoords) {
            const hasArrayCoords = Array.isArray(fallbackCoords) && fallbackCoords.length >= 2;
            const hasObjectCoords = typeof fallbackCoords === 'object' && fallbackCoords !== null && 'lat' in fallbackCoords && 'lng' in fallbackCoords;
            if (hasArrayCoords) {
              finalLocation.coordinates = { lat: fallbackCoords[0], lng: fallbackCoords[1] };
            } else if (hasObjectCoords) {
              finalLocation.coordinates = { lat: fallbackCoords.lat, lng: fallbackCoords.lng };
            }
          }
        }
      }
    }

    const payload = {
      core: {
        title,
        description,
        price,
        currency,
        listing_type: listingType || "SATILIK",
        location: finalLocation,
        facade,
      },
      specifications: {
        ...normalizedSpecs,
        ...(category === "IS_YERI" ? { commercial_features } : {}),
        ...(category === "ARSA" ? { arsa_features } : {}),
        ...(category === "BINA" ? { bina_features } : {}),
      },
      features: category === "IS_YERI" || category === "ARSA" || category === "BINA" ? [] : features,
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
                          <Controller
                            name="arsa_features"
                            render={({ field: arsaField }) => (
                              <Controller
                                name="bina_features"
                                render={({ field: binaField }) => (
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
                                    arsaFeatures={arsaField.value}
                                    onArsaFeaturesChange={arsaField.onChange}
                                    binaFeatures={binaField.value}
                                    onBinaFeaturesChange={binaField.onChange}
                                  />
                                )}
                              />
                            )}
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
                id="listing-section-address"
                className="rounded-xl border border-border bg-surface shadow-sm px-4 py-3 space-y-3 scroll-mt-4"
              >
                <header className="flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-warning flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-text-dark">Adres Bilgileri</h3>
                </header>
                <Controller
                  name="location"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <>
                      <LocationSelector value={value} onChange={onChange} />
                      {error?.city && <p className="text-xs text-danger mt-1">{error.city.message}</p>}
                      {error?.district && <p className="text-xs text-danger mt-1">{error.district.message}</p>}
                      {(error?.coordinates?.message || error?.message) && (
                        <p className="text-xs text-danger mt-1">
                          {error.coordinates?.message ?? error.message}
                        </p>
                      )}
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
              htmlId={`listing-section-${section.id}`}
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
