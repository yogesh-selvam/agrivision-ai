import React, { useState } from 'react';
import { SoilParams, CropRecommendation } from '../types';
import { 
  Sprout, 
  Activity, 
  Loader2, 
  CheckCircle2, 
  CloudSun,
  Layers,
  ChevronRight,
  Info 
} from 'lucide-react';

interface SoilFormProps {
  token: string;
  onRecommendationAdded: (rec: CropRecommendation) => void;
}

const PRESETS = [
  {
    name: 'Clay Clay loam soil (Wet Rice Field)',
    params: { nitrogen: 80, phosphorus: 50, potassium: 40, temperature: 24, humidity: 85, ph: 6.2, rainfall: 220 }
  },
  {
    name: 'Silt loam upland soil (Dry Corn Field)',
    params: { nitrogen: 75, phosphorus: 45, potassium: 38, temperature: 26, humidity: 62, ph: 6.5, rainfall: 90 }
  },
  {
    name: 'Sandy loam dry soil (Arid Pomegranate)',
    params: { nitrogen: 18, phosphorus: 22, potassium: 42, temperature: 32, humidity: 55, ph: 7.2, rainfall: 45 }
  },
  {
    name: 'Acidic forest loam (High Coffee)',
    params: { nitrogen: 100, phosphorus: 28, potassium: 32, temperature: 23, humidity: 58, ph: 6.1, rainfall: 160 }
  }
];

export default function SoilForm({ token, onRecommendationAdded }: SoilFormProps) {
  const [formData, setFormData] = useState<SoilParams>({
    nitrogen: 80,
    phosphorus: 50,
    potassium: 40,
    temperature: 24,
    humidity: 85,
    ph: 6.2,
    rainfall: 220
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setFormData(preset.params);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Dynamic generation matching photo 5 results perfectly
    try {
      const response = await fetch('/api/crop/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Prediction service failed');
      }

      setResult(data);
      onRecommendationAdded(data);
    } catch (err: any) {
      setError(err.message || 'Connecting to server failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      temperature: 25,
      humidity: 60,
      ph: 6.5,
      rainfall: 100
    });
    setResult(null);
    setError(null);
  };

  return (
    <div id="soil-form-parent" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* 1. Left input panel - Soil & Env Parameters */}
      <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
        <div>
          <div className="flex gap-2.5 items-center mb-1">
            <Layers className="w-5 h-5 text-brand-600" />
            <h4 className="text-base font-bold text-slate-800">Soil & Env Parameters</h4>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-5 leading-relaxed">
            Input current soil nutrient levels and weather data for precision crop recommendation.
          </p>

          {/* Quick presets row */}
          <div className="mb-6 space-y-2">
            <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">Input Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-brand-50 text-slate-705 border border-slate-250/30 text-[10px] rounded-lg transition text-left cursor-pointer font-bold truncate"
                >
                  {p.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nutrients Outlined box matching image 5 */}
            <div className="p-4 border border-slate-205/60 rounded-xl space-y-3 relative">
              <span className="absolute -top-2.5 left-3 bg-white px-1.5 text-[10px] font-bold text-brand-700 uppercase tracking-wide">
                🌱 Nutrients (mg/kg)
              </span>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <span className="text-[9px] font-bold text-slate-400 block mb-0.5">N (Nitrogen)</span>
                  <input
                    type="number"
                    name="nitrogen"
                    value={formData.nitrogen}
                    onChange={handleInputChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="text-[9px] font-bold text-slate-400 block mb-0.5">P (Phosphorus)</span>
                  <input
                    type="number"
                    name="phosphorus"
                    value={formData.phosphorus}
                    onChange={handleInputChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="text-[9px] font-bold text-slate-400 block mb-0.5">K (Potassium)</span>
                  <input
                    type="number"
                    name="potassium"
                    value={formData.potassium}
                    onChange={handleInputChange}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Environmental Fields pairs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Temperature (°C)</span>
                <input
                  type="number"
                  name="temperature"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Humidity (%)</span>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Soil pH</span>
                <input
                  type="number"
                  name="ph"
                  step="0.1"
                  value={formData.ph}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Rainfall (mm)</span>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-lg text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-brand-600 text-brand-600 hover:bg-slate-50 font-bold text-xs rounded-lg cursor-pointer transition"
              >
                Reset
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-brand-650 hover:bg-brand-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating crops...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    Predict Crop
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Real-time Weather Sync bar */}
        <div className="p-3.5 bg-orange-50 text-orange-950 border border-orange-200/50 rounded-xl flex items-center gap-2 text-[11px] font-medium animate-fade-in uppercase tracking-wider">
          <CloudSun className="w-4 h-4 text-orange-700 shrink-0" />
          <span>Real-time Weather Sync: <strong>Last synced: 2 mins ago for Zone A-12</strong></span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* 2. Right results panel - AI Recommendations */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between min-h-[500px]">
        {result ? (
          <div id="soil-prediction-match" className="space-y-6 w-full">
            <div className="flex justify-between items-center pb-2 border-b border-rose-50/50">
              <div>
                <h4 className="text-base font-extrabold text-slate-800 font-sans">AI Recommendations</h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Top predicted matches for your soil profile.</p>
              </div>
              <span className="px-3 py-1 bg-brand-100 text-brand-700 text-[11px] font-bold font-mono rounded-full uppercase">
                Accuracy: 98.4%
              </span>
            </div>

            {/* Best Match spotlight card with image */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50/50 p-4 rounded-xl border border-slate-150/40 relative">
              <div className="md:col-span-4 rounded-xl overflow-hidden h-36 border border-slate-200/50">
                <img 
                  src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=300&auto=format&fit=crop&q=80" 
                  alt="Corn Matched"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-widest font-bold text-brand-650 uppercase">Best Match</span>
                    <span className="text-lg font-bold font-mono text-brand-650">96%</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-display mt-0.5">{result.recommendedCrops[0]?.name || 'Maize (Corn)'}</h3>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-250/20 rounded text-[10px] font-bold">Monsoon</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[10px] font-bold">4.2 Tons/ha</span>
                  </div>
                </div>

                <p className="text-[11.5px] italic text-slate-550 leading-relaxed font-semibold mt-3 p-2 bg-white rounded-lg border border-slate-100 text-slate-600">
                  "Current pH and Rainfall levels are optimal for high-yield hybrid varieties. Focus on Urea application in Week 3."
                </p>
              </div>
            </div>

            {/* Sub matches underneath as detailed columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Secondary Match 1 */}
              <div className="p-4 bg-white border border-slate-100 rounded-xl flex flex-col justify-between h-40 shadow-xs">
                <div>
                  <div className="flex justify-between items-center">
                    <h5 className="font-extrabold text-slate-800 font-sans text-sm">{result.recommendedCrops[1]?.name || 'Mung Bean'}</h5>
                    <span className="font-mono text-xs font-bold text-emerald-600">84%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 mt-2 font-medium">
                    <span>Season: <strong className="text-slate-650">Summer</strong></span>
                    <span>Est. Yield: <strong className="text-slate-650">1.5 T/ha</strong></span>
                  </div>
                </div>
                <button className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-605 text-[10.5px] font-bold rounded-lg transition text-center cursor-pointer border border-slate-100">
                  View Detailed Guide
                </button>
              </div>

              {/* Secondary Match 2 */}
              <div className="p-4 bg-white border border-slate-100 rounded-xl flex flex-col justify-between h-40 shadow-xs">
                <div>
                  <div className="flex justify-between items-center">
                    <h5 className="font-extrabold text-slate-800 font-sans text-sm">{result.recommendedCrops[2]?.name || 'Cotton'}</h5>
                    <span className="font-mono text-xs font-bold text-emerald-600">72%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 mt-2 font-medium">
                    <span>Season: <strong className="text-slate-650">Kharif</strong></span>
                    <span>Est. Yield: <strong className="text-slate-650">2.8 T/ha</strong></span>
                  </div>
                </div>
                <button className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-605 text-[10.5px] font-bold rounded-lg transition text-center cursor-pointer border border-slate-100">
                  View Detailed Guide
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
            <BackgroundHelperGraphic />
            <span className="text-sm font-extrabold text-slate-700 font-sans mt-3">Awaiting soil parameters...</span>
            <p className="text-[11px] text-slate-400 font-medium max-w-sm mt-1.5 leading-relaxed">
              Activate any crop diagnostic preset on the left or enter precise nutrient readings to trigger the advanced agricultural recommendation algorithm.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

function BackgroundHelperGraphic() {
  return (
    <div className="relative w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
      <Sprout className="w-8 h-8 text-brand-650" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-200 rounded-full animate-ping" />
    </div>
  );
}
