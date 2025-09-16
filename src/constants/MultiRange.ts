// Define a constant object that maps dataset keys (string IDs) 
// to their default numeric value ranges (as [min, max] tuples).
export const datasetRanges: Record<string, [number, number]> = {
  // Normalized Difference Vegetation Index (NDVI) → values range from -1 to 1
  "hls-ndvi": [-1,1],
  // Monthly NO₂ concentration dataset → expected values between 0 and 500
  "no2-monthly": [0,500],
  // Bangladesh land cover classification (2001–2020) → encoded as integer categories, 0 to 255
  "bangladesh-landcover-2001-2020": [0, 255],
  // Thomas Fire dataset (BARC: Burned Area Reflectance Classification) → reflectance index values range from 0 to 1000
  "barc-thomasfire": [0, 1000]
};
