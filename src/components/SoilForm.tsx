import React, { useState } from 'react';
import { SoilParams, CropRecommendation } from '../types';
import { Sprout, HelpCircle, ChevronRight, Activity, ArrowRight, Loader2, Sparkles, CheckCircle } from 'lucide-react';

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
    name: 'Acidic forest loam (High altitude Coffee)',
    params: { nitrogen: 100, phosphorus: 28, potassium: 32, temperature: 23, humidity: 58, ph: 6.1, rainfall: 160 }
  }
];

export default function SoilForm({ token, onRecommendationAdded }: SoilFormProps) {
  const [formData, setFormData] = useState<SoilParams>({
    nitrogen: 50,
    phosphorus: 50,
    potassium: 50,
    temperature: 25,
    humidity: 60,
    ph: 6.5,
    rainfall: 100
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

  return (
    <div id="soil-form-parent" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Input panel */}
      <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex gap-2.5 items-center mb-4">
            <Activity className="w-5 h-5 text-brand-600" />
            <h4 className="text-xl font-bold font-display text-slate-800">Soil Nutrient Profiler</h4>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-5 leading-relaxed">
            Specify the key chemical and atmospheric dynamics below. Our model evaluates crop compatibility matrices using mathematical distance scoring.
          </p>

          {/* Presets */}
          <div className="mb-6 space-y-2">
            <span className="text-[10px] font-mono tracking-widest font-bold text-slate-400 uppercase">Input Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-3 py-2 bg-slate-50 hover:bg-brand-100 text-slate-700 hover:text-brand-950 text-[11px] rounded-xl border border-slate-200/50 text-left transition duration-150 truncate cursor-pointer font-medium"
                >
                  {p.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Nitrogen (N)</label>
                <input
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleInputChange}
                  min={0}
                  max={200}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Phosphorus (P)</label>
                <input
                  type="number"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleInputChange}
                  min={0}
                  max={200}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Potassium (K)</label>
                <input
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleInputChange}
                  min={0}
                  max={200}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  min={0}
                  max={50}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Humidity (%)</label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleInputChange}
                  min={10}
                  max={100}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Soil Acidity (pH)</label>
                <input
                  type="number"
                  name="ph"
                  step="0.1"
                  value={formData.ph}
                  onChange={handleInputChange}
                  min={3}
                  max={10}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Rainfall (mm/cycle)</label>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleInputChange}
                  min={10}
                  max={350}
                  className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 font-mono focus:border-brand-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating optimal crop models...
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  Apply Predictive Evaluation
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-55/10 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Output Results display */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
        {result ? (
          <div id="recommendation-result" className="space-y-6 w-full">
            <div>
              <div className="flex gap-2 items-center text-[10px] font-mono tracking-widest text-brand-650 uppercase font-bold">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                Soil Diagnostics Completed
              </div>
              <h3 className="text-xl font-bold font-display text-slate-800 mt-1">Recommended Cultivations</h3>
            </div>

            {/* Recommended crop list */}
            <div className="grid grid-cols-1 gap-3">
              {result.recommendedCrops.map((crop, index) => (
                <div
                  key={crop.name}
                  className={`p-4 rounded-2xl border flex justify-between items-center transition-all hover:scale-[1.005] ${
                    index === 0
                      ? 'bg-brand-50/60 border-brand-200'
                      : 'bg-slate-50/30 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      index === 0 ? 'bg-brand-600 text-white' : 'bg-slate-200/50 text-slate-700'
                    }`}>
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-800 font-display">{crop.name}</span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-brand-600 text-white text-[9px] font-bold font-mono rounded-md uppercase tracking-wider">Top Match</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{crop.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono block">Suitability</span>
                    <span className="text-base font-bold font-mono text-slate-800">{crop.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic AI farming advice */}
            <div className="p-5 bg-brand-50/40 rounded-2xl border border-brand-100">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold font-mono uppercase mb-2 tracking-wider">
                <CheckCircle className="w-4 h-4 text-brand-600" />
                Agronomist Cultivation Plan
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line prose max-w-none">
                {result.farmingAdvice}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-3xl">
            <Sprout className="w-12 h-12 text-slate-200 mb-3 animate-pulse" />
            <span className="text-sm font-bold text-slate-700 font-display">Awaiting soil calibration input...</span>
            <p className="text-[11px] text-slate-400 font-medium max-w-sm mt-1.5 leading-relaxed">
              Toggle any soil preset on the left or enter precise nutrient readings to trigger advanced crop recommendation algorithms immediately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
