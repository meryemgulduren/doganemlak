import { z } from "zod";
import { fieldDefinitions, resolveCategoryLayout } from "./formConfig";

export const generateListingSchema = (category, listingType, subType) => {
  const layout = resolveCategoryLayout(category, listingType, subType);
  const requiredFields = layout.requiredFields || [];
  const optionalFields = layout.optionalFields || [];

  const schemaShape = {};

  const getZodType = (field, isRequired) => {
    let baseSchema;
    
    if (field.type === "number") {
      baseSchema = z.union([
         z.number(),
         z.string().transform(val => val === "" ? null : Number(val))
      ]).refine(val => {
        if (isRequired && (val === null || val === undefined || isNaN(val))) return false;
        return true;
      }, { message: "Bu alan zorunludur" });
      
      if (!isRequired) {
         baseSchema = baseSchema.nullable().optional();
      }
    } else if (field.type === "checkbox") {
      baseSchema = z.boolean().default(false).optional();
    } else if (field.type === "checkbox_group") {
        baseSchema = z.array(z.string()).default([]);
        if (isRequired) {
           baseSchema = baseSchema.min(1, { message: "En az bir seçim yapmalısınız" });
        }
    } else {
      baseSchema = z.string();
      if (isRequired) {
        baseSchema = baseSchema.min(1, { message: "Bu alan zorunludur" });
      } else {
        baseSchema = baseSchema.nullable().optional().or(z.literal(""));
      }
    }
    return baseSchema;
  };

  requiredFields.forEach((id) => {
    const field = fieldDefinitions[id];
    if (field) {
      if (id !== "city" && id !== "district" && id !== "neighborhood" && id !== "address_details") {
         schemaShape[id] = getZodType(field, true);
      }
    }
  });

  optionalFields.forEach((id) => {
    const field = fieldDefinitions[id];
    if (field) {
       if (id !== "city" && id !== "district" && id !== "neighborhood" && id !== "address_details") {
           schemaShape[id] = getZodType(field, false);
       }
    }
  });

  // Location is handled separately to keep it under the `location` object
  // If city/district are ever not required, this might need dynamic checks, but for listings they always are.
  schemaShape.location = z.object({
    city: z.string().min(1, { message: "İl zorunludur" }),
    district: z.string().min(1, { message: "İlçe zorunludur" }),
    neighborhood: z.string().nullable().optional().or(z.literal("")),
    address_details: z.string().nullable().optional().or(z.literal("")),
  });

  schemaShape.media = z.object({
    images: z.array(z.string()).default([]),
    videos: z.array(z.string()).default([]),
  }).default({ images: [], videos: [] });

  schemaShape.features = z.array(z.string()).default([]);
  schemaShape.facade = z.array(z.string()).default([]);
  
  if (subType === "DUKKAN_MAGAZA") {
      schemaShape.commercial_features = z.array(z.string()).default([]);
  }

  return z.object(schemaShape);
};
