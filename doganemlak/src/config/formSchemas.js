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

  const isGloballyRequired = (id) => id === "title" || id === "description";

  requiredFields.forEach((id) => {
    const field = fieldDefinitions[id];
    if (field) {
      if (id !== "city" && id !== "district" && id !== "neighborhood" && id !== "address_details") {
         schemaShape[id] = getZodType(field, isGloballyRequired(id));
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

  // Location is optional for all categories.
  schemaShape.location = z
    .object({
      city: z.string().nullable().optional().or(z.literal("")),
      district: z.string().nullable().optional().or(z.literal("")),
      neighborhood: z.string().nullable().optional().or(z.literal("")),
      address_details: z.string().nullable().optional().or(z.literal("")),
      map_selection_confirmed: z.boolean().optional().default(false),
      coordinates: z
        .object({
          lat: z.union([z.number(), z.null()]).optional(),
          lng: z.union([z.number(), z.null()]).optional(),
        })
        .optional(),
    })
    .optional();

  schemaShape.media = z.object({
    images: z.array(z.string()).default([]),
    videos: z.array(z.string()).default([]),
  }).default({ images: [], videos: [] });

  schemaShape.features = z.array(z.string()).default([]);
  schemaShape.facade = z.array(z.string()).default([]);
  
  if (category === "IS_YERI") {
    schemaShape.commercial_features = z.array(z.string()).default([]);
  }
  if (category === "ARSA") {
    schemaShape.arsa_features = z.array(z.string()).default([]);
  }
  if (category === "BINA") {
    schemaShape.bina_features = z.array(z.string()).default([]);
  }

  return z.object(schemaShape);
};
