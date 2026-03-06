import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchListingById } from "../../api/listings";
import { createAdminListing, updateAdminListing, fetchFeatureDefinitions, uploadImage } from "../../api/admin";
import CategoryStepper from "../../components/CategoryStepper";
import DynamicListingForm from "../../components/forms/DynamicListingForm";

const LISTING_TYPES = ["SATILIK", "KIRALIK"];
const PROPERTY_TYPES = ["DAIRE", "VILLA", "ARSA", "IS_YERI", "BINA"];
const CURRENCIES = ["TRY", "USD", "EUR"];

const FORM_STEP_CATEGORY = 1;
const FORM_STEP_DETAILS = 2;

export default function AdminListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [formStep, setFormStep] = useState(FORM_STEP_CATEGORY);
  const [categorySelection, setCategorySelection] = useState({ category: null, listingType: null, subType: null });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [featureDefinitions, setFeatureDefinitions] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "TRY",
    listing_type: "SATILIK",
    property_type: "DAIRE",
    category: null,
    listingType: null,
    subType: null,
    m2_brut: "",
    m2_net: "",
    room_count: "",
    floor_number: "",
    total_floors: "",
    building_age: "",
    heating_type: "",
    bathroom_count: "",
    balcony: false,
    furnished: false,
    using_status: "",
    in_site: false,
    credit_eligible: false,
    dues: "",
    status: "ACTIVE",
    location: { city: "", district: "", neighborhood: "" },
    media: { images: [], videos: [] },
    features: [],
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchListingById(id)
      .then((res) => {
        if (cancelled || !res.success) return;
        const d = res.data;
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          price: d.price ?? "",
          currency: d.currency ?? "TRY",
          listing_type: d.listing_type ?? "SATILIK",
          property_type: d.property_type ?? "DAIRE",
          category: d.category ?? null,
          listingType: d.listingType ?? d.listing_type ?? null,
          subType: d.subType ?? null,
          m2_brut: d.m2_brut ?? "",
          m2_net: d.m2_net ?? "",
          room_count: d.room_count ?? "",
          floor_number: d.floor_number ?? "",
          total_floors: d.total_floors ?? "",
          building_age: d.building_age ?? "",
          heating_type: d.heating_type ?? "",
          bathroom_count: d.bathroom_count ?? "",
          balcony: !!d.balcony,
          furnished: !!d.furnished,
          using_status: d.using_status ?? "",
          in_site: !!d.in_site,
          credit_eligible: !!d.credit_eligible,
          dues: d.dues ?? "",
          status: d.status ?? "ACTIVE",
          location: d.location || { city: "", district: "", neighborhood: "" },
          media: {
            images: d.media?.images ?? [],
            videos: d.media?.videos ?? [],
          },
          features: d.features?.map((f) => f._id) ?? [],
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (isEdit) setFormStep(FORM_STEP_DETAILS);
  }, [isEdit]);

  useEffect(() => {
    let cancelled = false;
    fetchFeatureDefinitions()
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setFeatureDefinitions(res.data);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const updateLocation = (key, value) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [key]: value },
    }));
  };
  const updateMediaImages = (str) => {
    const arr = str.trim() ? str.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    setForm((prev) => ({
      ...prev,
      media: { ...prev.media, images: arr },
    }));
  };
  const addUploadedImageUrl = (url) => {
    setForm((prev) => ({
      ...prev,
      media: { ...prev.media, images: [...(prev.media?.images || []), url] },
    }));
  };
  const handleImageFileSelect = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setImageUploadError(null);
    setImageUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      try {
        const url = await uploadImage(file);
        addUploadedImageUrl(url);
      } catch (err) {
        setImageUploadError(err.message || "Yükleme başarısız.");
      }
    }
    setImageUploading(false);
    e.target.value = "";
  };
  const removeImageByIndex = (index) => {
    setForm((prev) => {
      const images = [...(prev.media?.images || [])];
      images.splice(index, 1);
      return { ...prev, media: { ...prev.media, images } };
    });
  };
  const toggleFeature = (featureId) => {
    setForm((prev) => {
      const ids = prev.features || [];
      const has = ids.includes(featureId);
      return {
        ...prev,
        features: has ? ids.filter((id) => id !== featureId) : [...ids, featureId],
      };
    });
  };

  const mapCategoryToPropertyType = (category, subType) => {
    if (!category) return "DAIRE";
    if (category === "ARSA") return "ARSA";
    if (category === "BINA") return "BINA";
    if (category === "IS_YERI") return "IS_YERI";
    if (category === "KONUT") {
      const map = { DAIRE: "DAIRE", MUSTAKIL_VILLA: "VILLA", REZIDANS: "DAIRE", YAZLIK: "VILLA" };
      return map[subType] || "DAIRE";
    }
    return "DAIRE";
  };

  const handleCategoryComplete = (selection) => {
    setCategorySelection(selection);
    const property_type = mapCategoryToPropertyType(selection.category, selection.subType);
    setForm((prev) => ({
      ...prev,
      category: selection.category,
      listingType: selection.listingType,
      subType: selection.subType,
      listing_type: selection.listingType,
      property_type,
      categoryLabel: selection.categoryLabel,
      listingTypeLabel: selection.listingTypeLabel,
      subTypeLabel: selection.subTypeLabel,
    }));
    setFormStep(FORM_STEP_DETAILS);
  };

  const categoryLabels = {
    IC_OZELLIKLER: "İç Özellikler",
    DIS_OZELLIKLER: "Dış Özellikler",
    MUHIT: "Muhit",
    ULASIM: "Ulaşım",
    MANZARA: "Manzara",
    KONUT_TIPI: "Konut Tipi",
    ENGELLI_UYGUNLUK: "Engelliye Uygunluk",
  };
  const featuresByCategory = featureDefinitions.reduce((acc, f) => {
    const cat = f.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      category: form.category,
      listingType: form.listingType,
      subType: form.subType,
      price: Number(form.price) || 0,
      m2_brut: form.m2_brut ? Number(form.m2_brut) : null,
      m2_net: form.m2_net ? Number(form.m2_net) : null,
      floor_number: form.floor_number ? Number(form.floor_number) : null,
      total_floors: form.total_floors ? Number(form.total_floors) : null,
      bathroom_count: form.bathroom_count ? Number(form.bathroom_count) : null,
      dues: form.dues ? Number(form.dues) : null,
    };
    try {
      if (isEdit) {
        await updateAdminListing(id, payload);
        navigate("/admin/ilanlar");
      } else {
        await createAdminListing(payload);
        navigate("/admin/ilanlar");
      }
    } catch (err) {
      setError(err.message || "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-text-dark/70">Yükleniyor...</p>;

  return (
    <div className="max-w-3xl">
      {formStep === FORM_STEP_CATEGORY && !isEdit ? (
        <>
          <h2 className="text-xl font-bold text-text-dark mb-4">Yeni İlan</h2>
          <CategoryStepper
            value={categorySelection}
            onChange={setCategorySelection}
            onComplete={handleCategoryComplete}
          />
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-text-dark mb-4">
            {isEdit ? "İlan Düzenle" : "Yeni İlan - Detaylar"}
          </h2>
          {!isEdit && (form.categoryLabel || form.category) && (
            <p className="text-sm text-gray-600 mb-3">
              Kategori: {form.categoryLabel ?? form.category} ›{" "}
              {form.listingTypeLabel ?? form.listingType}
              {(form.subTypeLabel || form.subType) ? ` › ${form.subTypeLabel ?? form.subType}` : ""}
              <button
                type="button"
                onClick={() => setFormStep(FORM_STEP_CATEGORY)}
                className="ml-2 text-blue-600 hover:underline text-sm"
              >
                Değiştir
              </button>
            </p>
          )}
          {error && (
            <p className="mb-4 text-red-600 text-sm">{error}</p>
          )}
          {/* Dinamik form */}
          <DynamicListingForm
            category={form.category}
            listingType={form.listingType || form.listing_type}
            subType={form.subType}
            initialValues={form}
            featureDefinitions={featureDefinitions}
            saving={saving}
            onSubmit={async ({ core, specifications, features, category, listingType, subType }) => {
              setSaving(true);
              setError(null);
              const payload = {
                ...core,
                category,
                listingType,
                subType,
                specifications,
                features,
              };
              try {
                if (isEdit) {
                  await updateAdminListing(id, payload);
                } else {
                  await createAdminListing(payload);
                }
                navigate("/admin/ilanlar");
              } catch (err) {
                setError(err.message || "Kaydedilemedi.");
              } finally {
                setSaving(false);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
