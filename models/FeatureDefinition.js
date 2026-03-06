const mongoose = require('mongoose');

const categoryEnum = [
  'IC_OZELLIKLER',
  'DIS_OZELLIKLER',
  'MUHIT',
  'ULASIM',
  'MANZARA',
  'KONUT_TIPI',
  'ENGELLI_UYGUNLUK',
];

const featureDefinitionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: categoryEnum,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
});

featureDefinitionSchema.index({ category: 1, is_active: 1 });

module.exports = mongoose.model('FeatureDefinition', featureDefinitionSchema);
module.exports.categoryEnum = categoryEnum;
