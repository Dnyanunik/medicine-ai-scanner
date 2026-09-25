export interface MedicineAnalysis {
  medicineName: string;
  activeIngredients: string[];
  strength: string;
  form: string;
  labelPurpose: string;
  warnings: string[];
  storage: string;
  expiryDate: string;
  manufacturer: string;
  confidence: 'High' | 'Medium' | 'Low';
  imageFeedback?: string;
  generalAdvice?: string;
}
