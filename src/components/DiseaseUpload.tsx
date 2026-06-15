import React, { useState, useRef } from 'react';
import { DiseasePrediction } from '../types';
import { 
  Upload, 
  Camera, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface DiseaseUploadProps {
  token: string;
  onPredictionAdded: (pred: DiseasePrediction) => void;
}

const BIOLOGY_SAMPLES = [
  { label: 'Tomato Late Blight', science: 'Phytophthora infestans', description: 'Leathery spots on Tomato leaves', image: 'https://images.unsplash.com/photo-1592417817098-8f3212041400?w=150&auto=format&fit=crop&q=60' },
  { label: 'Apple Scab', science: 'Venturia inaequalis', description: 'Leathery spots on Apple leaves', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=60' },
  { label: 'Corn Rust', science: 'Puccinia sorghi', description: 'Orange powder pustules on Maize leaves', image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150&auto=format&fit=crop&q=60' },
  { label: 'Rice Blast', science: 'Magnaporthe oryzae', description: 'Spindle neck blight on Rice fields', image: 'https://images.unsplash.com/photo-1536640811565-df048bbef6df?w=150&auto=format&fit=crop&q=60' }
];

export default function DiseaseUpload({ token, onPredictionAdded }: DiseaseUploadProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseasePrediction | null>(null);
  const [activeTab, setActiveTab] = useState<'symptoms' | 'treatment' | 'prevention'>('symptoms');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setError('Please select an image smaller than 8 Megabytes');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const b64 = reader.result as string;
        setImageBase64(b64);
        await analyseImage(b64, file.name.split('.')[0] || 'Tomato Late Blight');
      };
    }
  };

  const selectSample = async (sample: typeof BIOLOGY_SAMPLES[0]) => {
    setImageBase64(sample.image);
    await analyseImage(null, sample.label);
  };

  const analyseImage = async (base64: string | null, label: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/disease/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          cropLabel: label
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic calculation error');
      }

      setResult(data);
      onPredictionAdded(data);
    } catch (err: any) {
      setError(err.message || 'Connecting to vision core failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearPhoto = () => {
    setImageBase64(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Centered Headers */}
      <div className="text-center space-y-2">
        <div className="inline-flex px-3 py-1 bg-emerald-50 text-[#16a34a] border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
          ResNet-50 Classifier
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
          Crop Disease Detection
        </h2>
        <p className="text-slate-550 text-xs md:text-sm font-semibold max-w-xl mx-auto text-slate-500">
          Upload a high-definition photo of crop leaves to instantly identify pathogens, diseases, or leaf stresses
        </p>
      </div>

      {/* Main interactive split panels alignment */}
      <div id="disease-scanner-split" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Uploader & Samples */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest font-black text-[#16a34a] uppercase block">PATHOLOGY SCANNER</span>
            <h4 className="text-base font-extrabold text-slate-800 mt-0.5">Upload Leaf Diagnostics</h4>
          </div>

          {/* Test samples grids */}
          <div className="space-y-2">
            <label className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Click to Test with Sample Species:</label>
            <div className="grid grid-cols-2 gap-2">
              {BIOLOGY_SAMPLES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSample(s)}
                  className="p-1.5 bg-[#f0f9f4]/45 border border-emerald-50/60 hover:border-emerald-200 rounded-xl flex items-center gap-2 text-left cursor-pointer transition duration-150 group"
                >
                  <img 
                    src={s.image} 
                    alt={s.label} 
                    className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <h6 className="font-extrabold text-[10.5px] text-slate-800 group-hover:text-[#16a34a] truncate leading-tight">{s.label}</h6>
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{s.science}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Picture Uploading core dashed wrapper */}
          <div className="border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-2xl p-6 text-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleInputChange} 
              accept="image/*" 
              className="hidden" 
            />

            {imageBase64 ? (
              <div className="relative group">
                <img 
                  src={imageBase64} 
                  alt="Pathology Leaf Uploaded" 
                  className="max-h-56 mx-auto rounded-xl object-cover shadow-sm border border-slate-100" 
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 p-1.5 bg-white text-red-650 hover:bg-red-50 rounded-lg shadow-sm cursor-pointer border border-slate-100"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="w-12 h-12 bg-[#f0f9f4] text-[#16a34a] rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="w-6 h-6 text-[#16a34a]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Drop leaf photo here or click files.</p>
                  <p className="text-[10px] text-slate-400 font-medium">Fully compatible with standard JPG, PNG formats.</p>
                </div>

                <div className="flex justify-center gap-2.5">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-black hover:bg-[#111827] text-white font-bold text-xs rounded-[6px] flex items-center gap-1.5 transition duration-150 cursor-pointer shadow-2xs select-none"
                  >
                    <Camera className="w-3.5 h-3.5" /> Camera
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs rounded-[6px] flex items-center gap-1.5 transition duration-150 cursor-pointer select-none"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-bold">
              {error}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Diagnostic Outcomes Panel */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-md min-h-[500px] overflow-hidden flex flex-col justify-between">
          
          {loading ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
              <Loader2 className="w-10 h-10 text-[#16a34a] animate-spin mb-4" />
              <span className="text-sm font-bold text-slate-800">Analyzing leaf pathology parameters...</span>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed font-semibold">
                Running computer vision heuristics and ResNet-50 Residual Blocks classification on lesion shapes to generate diagnostic summary...
              </p>
            </div>
          ) : result ? (
            <div className="flex-grow flex flex-col justify-between">
              
              {/* Header diagnostic results bar */}
              <div className="bg-[#fcfdfc] p-5 border-b border-rose-50/50 flex justify-between items-center shrink-0">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[9px] font-black uppercase tracking-wider font-sans">
                    Pathogen Found
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-1 leading-none tracking-tight">
                    {result.diseaseName}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  Target: {result.cropName}
                </span>
              </div>

              {/* Status and Confidence Row */}
              <div className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Confidence block */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Match Confidence</span>
                      <span className="text-xl font-black font-mono text-[#16a34a] block mt-1">{result.confidence}% Match</span>
                    </div>
                    <Award className="w-8 h-8 text-[#16a34a] opacity-60 shrink-0" />
                  </div>

                  {/* Severity block */}
                  <div className="bg-red-50/10 p-4 rounded-2xl border border-red-100/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Severity Indication</span>
                      <span className="text-xl font-black font-sans text-red-650 block mt-1">Symptomatic Status</span>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500 opacity-60 shrink-0" />
                  </div>

                </div>

                {/* Sub-tabs interactive section matching image styles */}
                <div className="space-y-3 pt-2">
                  <div className="flex border-b border-slate-100 pb-0.5 gap-1 shadow-2xs">
                    {(['symptoms', 'treatment', 'prevention'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-xs font-black capitalize border-b-2 cursor-pointer transition duration-150 ${
                          activeTab === tab
                            ? 'border-[#16a34a] text-[#16a34a]'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {tab === 'prevention' ? 'Long-term Prevention' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Active content panel layout */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                    <ul className="space-y-3 text-xs text-slate-700 font-medium">
                      {(activeTab === 'symptoms' ? result.symptoms : activeTab === 'treatment' ? result.treatments : result.preventionTips).map((item, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start pl-1">
                          <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                            activeTab === 'symptoms' ? 'text-red-500' : activeTab === 'treatment' ? 'text-[#16a34a]' : 'text-emerald-600'
                          }`} />
                          <span className="text-slate-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expert Advisory consult section block */}
                <div className="p-4 bg-[#f0f9f4]/50 border border-emerald-100rounded-2xl rounded-2xl flex gap-4 items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=120&auto=format&fit=crop&q=80" 
                    alt="Dr. Jane Swaminathan" 
                    className="w-12 h-12 object-cover rounded-full border-2 border-[#cbffc2]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-mono tracking-widest font-black text-[#16a34a] uppercase block">EXPERT RECOMMENDATION APPROVED</span>
                    <p className="text-[11px] font-semibold text-slate-600 mt-1 leading-relaxed">
                      Need secondary manual confirmation? Connect instantly with our Senior Pathology Agronomist <strong>Dr. Jane Swaminathan</strong> to run tailored checks.
                    </p>
                  </div>
                </div>

              </div>
              
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-4 border-dashed border-slate-50 rounded-3xl m-3">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <span className="text-sm font-extrabold text-slate-700 mt-4 font-sans select-none">Awaiting Leaf Diagnostics...</span>
              <p className="text-[11px] text-slate-400 font-semibold max-w-sm mt-1.5 leading-relaxed select-none">
                Choose any precompiled leaf pathology sample on the left, or upload high-definition foliage images to trigger automated neural net classification.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
