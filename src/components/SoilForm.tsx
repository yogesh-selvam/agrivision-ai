import React, { useState } from 'react';
import { SoilParams, CropRecommendation } from '../types';
import { 
  Sprout, 
  Loader2, 
  Layers, 
  Leaf,
  RefreshCw,
  Award
} from 'lucide-react';

interface SoilFormProps {
  token: string;
  onRecommendationAdded: (rec: CropRecommendation) => void;
}

const PRESETS = [
  {
    name: 'Clay loam soil (Wet Rice Field)',
    params: { nitrogen: 80, phosphorus: 50, potassium: 40, temperature: 24, humidity: 85, ph: 6.2, rainfall: 220 }
  },
  {
    name: 'Silt loam soil (Dry Corn Field)',
    params: { nitrogen: 75, phosphorus: 45, potassium: 38, temperature: 26, humidity: 62, ph: 6.5, rainfall: 90 }
  },
  {
    name: 'Sandy loam soil (Arid Pomegranate)',
    params: { nitrogen: 18, phosphorus: 22, potassium: 42, temperature: 32, humidity: 55, ph: 7.2, rainfall: 45 }
  },
  {
    name: 'Acidic forest loam (Coffee Plantation)',
    params: { nitrogen: 100, phosphorus: 28, potassium: 32, temperature: 23, humidity: 58, ph: 6.1, rainfall: 160 }
  }
];

// Map predicted target crops to high-quality images & seasons
const CROP_METRICS: Record<string, { image: string; season: string; yield: string }> = {
  Rice: { image: 'https://images.unsplash.com/photo-1536640811565-df048bbef6df?w=450&auto=format&fit=crop&q=80', season: 'Kharif / Monsoon', yield: '4.5 Tons/ha' },
  'Maize (Corn)': { image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=450&auto=format&fit=crop&q=80', season: 'Kharif & Rabi', yield: '4.2 Tons/ha' },
  Chickpeas: { image: 'https://images.unsplash.com/photo-1515485290382-441e4d049cb5?w=450&auto=format&fit=crop&q=80', season: 'Rabi (Winter)', yield: '1.8 Tons/ha' },
  'Kidney Beans': { image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=450&auto=format&fit=crop&q=80', season: 'Rabi (Winter)', yield: '1.5 Tons/ha' },
  'Pigeon Peas': { image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=450&auto=format&fit=crop&q=80', season: 'Kharif', yield: '1.2 Tons/ha' },
  Pomegranate: { image: 'https://images.unsplash.com/photo-1596003906949-67221c37965c?w=450&auto=format&fit=crop&q=80', season: 'Annual Fruit', yield: '5.0 Tons/ha' },
  Banana: { image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=450&auto=format&fit=crop&q=80', season: 'Perennial', yield: '12.0 Tons/ha' },
  Mango: { image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=450&auto=format&fit=crop&q=80', season: 'Summer Fruit', yield: '8.5 Tons/ha' },
  Grapes: { image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=450&auto=format&fit=crop&q=80', season: 'Rabi / Spring', yield: '9.0 Tons/ha' },
  Watermelon: { image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=450&auto=format&fit=crop&q=80', season: 'Summer Crop', yield: '7.5 Tons/ha' },
  Cotton: { image: 'https://images.unsplash.com/photo-1594191338784-48099df3d274?w=450&auto=format&fit=crop&q=80', season: 'Kharif (Monsoon)', yield: '2.8 Tons/ha' },
  Coffee: { image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=450&auto=format&fit=crop&q=80', season: 'Perennial Hill', yield: '1.4 Tons/ha' },
};

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

  // Synchronized inputs handler
  const handleValueChange = (name: keyof SoilParams, val: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: val
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
      setError(err.message || 'Connecting to prediction server failed.');
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

  // Get matching visual parameters for predicted target
  const getCropMetrics = (cropName: string) => {
    return CROP_METRICS[cropName] || {
      image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=450&auto=format&fit=crop&q=80',
      season: 'Monsoon Crop',
      yield: '3.5 Tons/ha'
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Upper Badge & Titles matching screenshot 5 */}
      <div className="text-center space-y-2">
        <div className="inline-flex px-3 py-1 bg-emerald-50 text-[#16a34a] border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
          XGBoost Powered
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
          Crop Recommendation System
        </h2>
        <p className="text-slate-550 text-xs md:text-sm font-semibold max-w-xl mx-auto text-slate-500">
          Enter your soil parameters and environmental conditions to get AI-powered crop recommendations
        </p>
      </div>

      {/* Main Grid layout */}
      <div id="soil-analyzer-split" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Soil Form Parameters */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#0a0a0a] text-white py-4 px-6 flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#cbffc2]" />
            <h4 className="font-bold text-sm tracking-wide">Soil & Environmental Parameters</h4>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Quick Access Presets bar */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Select Soil Preset</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="truncate text-left px-3 py-2 bg-[#f0f9f4]/60 hover:bg-[#cbffc2]/30 border border-emerald-50 text-[11px] font-bold text-slate-705 rounded-xl transition cursor-pointer"
                  >
                    🌱 {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs sliders mapping group */}
            <div className="space-y-4">
              
              {/* Nitrogen (N) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-750">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Nitrogen (N) <span className="text-slate-400 font-medium">(mg/kg)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.nitrogen}
                    onChange={(e) => handleValueChange('nitrogen', Number(e.target.value))}
                    className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-mono font-bold text-[#16a34a]"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.nitrogen}
                  onChange={(e) => handleValueChange('nitrogen', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                />
              </div>

              {/* Phosphorus (P) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-750">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Phosphorus (P) <span className="text-slate-400 font-medium">(mg/kg)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.phosphorus}
                    onChange={(e) => handleValueChange('phosphorus', Number(e.target.value))}
                    className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-mono font-bold text-[#16a34a]"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.phosphorus}
                  onChange={(e) => handleValueChange('phosphorus', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                />
              </div>

              {/* Potassium (K) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-750">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Potassium (K) <span className="text-slate-400 font-medium">(mg/kg)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.potassium}
                    onChange={(e) => handleValueChange('potassium', Number(e.target.value))}
                    className="w-16 p-1 bg-slate-50 border border-slate-200 rounded text-center text-xs font-mono font-bold text-[#16a34a]"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={formData.potassium}
                  onChange={(e) => handleValueChange('potassium', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                />
              </div>

              {/* Stagger dual items */}
              <div className="grid grid-cols-2 gap-4">
                {/* Temp */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Temperature (°C)</span>
                    <span className="font-mono text-xs font-bold text-[#16a34a]">{formData.temperature}°C</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="0.5"
                    value={formData.temperature}
                    onChange={(e) => handleValueChange('temperature', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                  />
                </div>
                {/* Humidity */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Humidity (%)</span>
                    <span className="font-mono text-xs font-bold text-[#16a34a]">{formData.humidity}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={formData.humidity}
                    onChange={(e) => handleValueChange('humidity', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Soil pH */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Soil pH</span>
                    <span className="font-mono text-xs font-bold text-[#16a34a]">{formData.ph}</span>
                  </label>
                  <input
                    type="range"
                    min="3.5"
                    max="9.5"
                    step="0.1"
                    value={formData.ph}
                    onChange={(e) => handleValueChange('ph', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                  />
                </div>
                {/* Rainfall */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 flex justify-between">
                    <span>Rainfall (mm)</span>
                    <span className="font-mono text-xs font-bold text-[#16a34a]">{formData.rainfall}mm</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={formData.rainfall}
                    onChange={(e) => handleValueChange('rainfall', Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#16a34a]"
                  />
                </div>
              </div>

            </div>

            {/* Error notifications */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-semibold">
                {error}
              </div>
            )}

            {/* Actions Panel */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-[6px] transition duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#000000] hover:bg-[#111827] disabled:bg-slate-150 text-white font-bold text-xs rounded-[6px] flex items-center justify-center gap-2 transition duration-150 cursor-pointer shadow-xs select-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Analyzing Soil...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    Predict Crops
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: Results matching Screenshot 5 */}
        <div id="soil-output-results" className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-md min-h-[550px] overflow-hidden flex flex-col justify-between">
          
          {result ? (
            <div className="flex-grow flex flex-col justify-between">
              
              {/* Header result info banner */}
              <div className="bg-[#f0f9f4] p-5 border-b border-emerald-100 flex justify-between items-center shrink-0">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm font-sans">AI Recommendations</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Top predicted matches for your soil profile.</p>
                </div>
                <div className="px-3.5 py-1.5 bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20 text-[10px] font-black font-mono rounded-full uppercase tracking-wider uppercase flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Accuracy: 98.4%
                </div>
              </div>

              {/* Best matched crop representation */}
              <div className="p-6 space-y-6 flex-1">
                
                {/* Hero card matching image elements */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50 relative overflow-hidden shadow-2xs">
                  
                  {/* Image container */}
                  <div className="sm:col-span-5 h-28 sm:h-36 rounded-xl overflow-hidden border border-slate-200/70 shrink-0">
                    <img 
                      src={getCropMetrics(result.recommendedCrops[0]?.name).image} 
                      alt={result.recommendedCrops[0]?.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Descriptions */}
                  <div className="sm:col-span-7 flex flex-col justify-between py-0.5 space-y-2">
                    <div>
                      <div className="flex justify-between items-center select-none">
                        <span className="text-[9px] font-mono tracking-widest font-black text-[#16a34a] uppercase bg-[#cbffc2]/55 px-2 py-0.5 rounded-full">Best Match</span>
                        <span className="text-base font-black font-mono text-[#16a34a]">{result.recommendedCrops[0]?.suitabilityScore}%</span>
                      </div>
                      
                      <h3 className="text-lg font-extrabold text-slate-800 mt-1 leading-tight">{result.recommendedCrops[0]?.name}</h3>
                      
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/20 rounded text-[9.5px] font-black uppercase font-mono">{getCropMetrics(result.recommendedCrops[0]?.name).season}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] font-bold font-sans">Yield: {getCropMetrics(result.recommendedCrops[0]?.name).yield}</span>
                      </div>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-500 italic font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                      Primary evaluation: This soil's structure is optimal for high yields. Set proper fertilization.
                    </p>
                  </div>
                </div>

                {/* Sub recommendations Bullet list with professional agronomy values */}
                <div className="space-y-3.5">
                  <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5 select-none pl-1">
                    <Leaf className="w-4 h-4 text-[#16a34a]" /> Cultivation Guidelines:
                  </h5>
                  <div className="p-4 bg-[#f0f9f4]/45 rounded-2xl border border-emerald-50/50 text-xs text-slate-650 leading-relaxed font-medium space-y-2 prose">
                    <div className="whitespace-pre-line text-slate-600">
                      {result.farmingAdvice}
                    </div>
                  </div>
                </div>

                {/* Other matches segment list rendering */}
                {result.recommendedCrops.length > 1 && (
                  <div className="space-y-3 pt-2">
                    <h5 className="font-extrabold text-[#1b1c1c] text-xs uppercase tracking-wider pl-1">Other Suitable Crops:</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {result.recommendedCrops.slice(1, 3).map((r, i) => (
                        <div key={i} className="p-3 bg-white border border-slate-200/70 hover:border-emerald-250 rounded-2xl flex flex-col justify-between gap-2 shadow-2xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-800 text-xs leading-none truncate pr-2">{r.name}</span>
                            <span className="font-mono text-xs font-black text-emerald-600 shrink-0">{r.suitabilityScore}%</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold shrink-0">
                            <span>Season: <strong className="text-slate-500 font-extrabold text-[9.5px] uppercase">{getCropMetrics(r.name).season.split(' ')[0]}</strong></span>
                            <span>Yield: {getCropMetrics(r.name).yield.split(' ')[0]} G</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-4 border-dashed border-slate-50 rounded-3xl m-3">
              <div className="w-16 h-16 bg-[#f0f9f4] text-[#16a34a] rounded-full flex items-center justify-center mx-auto shadow-sm relative">
                <Sprout className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping border-2 border-white" />
              </div>
              <span className="text-sm font-extrabold text-slate-700 mt-4 font-sans select-none">Awaiting soil parameters...</span>
              <p className="text-[11px] text-slate-400 font-semibold max-w-sm mt-1.5 leading-relaxed select-none">
                Select any predefined soil conditions on the left or set your customized NPK metrics and scroll to hit 'Predict Crops'.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
