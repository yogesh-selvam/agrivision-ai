/**
 * AGRIBOT Typings & Data Schemes
 */

export type UserRole = 'Farmer' | 'Agriculture Expert' | 'Admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  location?: string;
  phone?: string;
}

export interface SoilParams {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropRecommendation {
  id: string;
  userId: string;
  params: SoilParams;
  recommendedCrops: Array<{
    name: string;
    description: string;
    confidence: number;
    suitabilityScore: number;
  }>;
  farmingAdvice: string;
  createdAt: string;
}

export interface DiseasePrediction {
  id: string;
  userId: string;
  imageBlobUrl?: string; // Client side visualization
  imageDataUrl?: string; // Server side storage/display
  cropName: string;
  diseaseName: string;
  confidence: number;
  symptoms: string[];
  treatments: string[];
  preventionTips: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'model';
  message: string;
  language: 'English' | 'Tamil' | 'Hindi' | 'Kannada';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface SystemStats {
  userCount: number;
  predictionCount: number;
  diseaseCount: number;
  chatbotQueryCount: number;
  recentLogs: ActivityLog[];
  cropDistribution: Array<{ name: string; value: number }>;
  diseaseTrends: Array<{ date: string; diagnosed: number; treated: number }>;
}
