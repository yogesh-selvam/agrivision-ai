import React, { useState, useRef } from 'react';
import { DiseasePrediction } from '../types';
import { 
  Upload, 
  Camera, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Bookmark,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface DiseaseUploadProps {
  token: string;
  onPredictionAdded: (pred: DiseasePrediction) => void;
}

const BIOLOGY_SAMPLES = [
  { label: 'Tomato Late Blight', science: 'Phytophthora infestans', description: 'Leathery spots on Potato/Tomato leaves', image: 'https://images.unsplash.com/photo-1592417817098-8f3212041400?w=150&auto=format&fit=crop&q=60' },
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
    <div id="disease-upload-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Input Section - Pathology Upload & Samples */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        <div>
          <h4 className="text-base font-bold text-slate-800">Plant Disease Detection</h4>
          <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
            Upload a clear photo of your crop's leaves for instant AI analysis.
          </p>
        </div>

        {/* Quick Samples Section */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">Test Crop Species</span>
          <div className="grid grid-cols-2 gap-2">
            {BIOLOGY_SAMPLES.map((s) => (
              <button
                key={s.label}
                onClick={() => selectSample(s)}
                className="p-1.5 bg-slate-50 border border-slate-100 hover:border-brand-200 rounded-xl flex items-center gap-2 text-left cursor-pointer transition group"
              >
                <img 
                  src={s.image} 
                  alt={s.label} 
                  className="w-10 h-10 object-cover rounded-lg border border-slate-150/40"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h6 className="font-bold text-[10.5px] text-slate-800 group-hover:text-brand-700 truncate">{s.label}</h6>
                  <p className="text-[9px] text-slate-400 truncate">{s.science}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Leaf image uploader card matching photo 7 */}
        <div className="border-2 border-dashed border-slate-200/80 rounded-2xl p-6 text-center bg-slate-50/20">
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
                alt="Uploaded Leaf Pathology" 
                className="max-h-48 mx-auto rounded-xl object-cover shadow-xs border border-slate-100" 
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={clearPhoto}
                className="absolute top-2 right-2 p-1.5 bg-white text-red-650 hover:bg-red-50 rounded-lg shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-slate-400">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Drop leaf photo here. Support JPG, PNG files.</p>
                <p className="text-[10px] text-slate-405 font-medium">Ensure high lighting for better results.</p>
              </div>

              {/* Dual upload action buttons */}
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-brand-650 hover:bg-brand-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Camera
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-brand-650 text-brand-650 hover:bg-brand-50/30 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  Browse
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Right Output Diagnostic layout panel */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-xs min-h-[500px] flex flex-col justify-between">
        {loading ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <span className="text-sm font-bold text-slate-800">Processing Foliar Diagnostics...</span>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed font-semibold">
              Applying deep neural network rules on biological lesions via vision models to generate actionable treatment recommendations...
            </p>
          </div>
        ) : result ? (
          <div id="disease-diagnostic-card shadow-xs" className="space-y-5">
            
            {/* Confirmation Tag & scientific header */}
            <div className="flex justify-between items-start pb-4 border-b border-rose-50/40">
              <div>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold font-mono rounded tracking-wider uppercase">
                  Detection Confirmed
                </span>
                <h3 className="text-lg font-bold text-slate-800 font-display mt-1 tracking-tight">
                  {result.diseaseName}
                </h3>
                <span className="text-xs italic text-slate-400 mt-0.5 block">
                  Phytophthora infestans (Late Blight Fungus)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 text-right block uppercase">
                Scan #AI-8821
              </span>
            </div>

            {/* Severity and Confidence Metrics column row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Confidence Metric</span>
                  <span className="text-xl font-bold font-sans text-brand-650 block mt-1">{result.confidence}% Match</span>
                </div>
                <Award className="w-8 h-8 text-brand-600 opacity-60" />
              </div>

              <div className="bg-red-50/20 p-4 rounded-xl border border-red-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide block">Severity Level</span>
                  <span className="text-xl font-bold font-sans text-red-600 block mt-1">High Severity</span>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </div>

            {/* Dynamic Interactive tabs columns */}
            <div className="space-y-3">
              <div className="flex border-b border-slate-100 pb-1">
                {(['symptoms', 'treatment', 'prevention'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-bold capitalize border-b-2 cursor-pointer transition ${
                      activeTab === tab
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Active Tab contents with customizable styles */}
              <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                {activeTab === 'symptoms' && (
                  <ul className="space-y-3 text-xs text-slate-700">
                    {result.symptoms.map((s, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start pl-1">
                        <CheckCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 font-bold block">Water-soaked spot lesion</strong>
                          <span className="text-slate-500 text-[11px] font-medium leading-relaxed">{s}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'treatment' && (
                  <ul className="space-y-3 text-xs text-slate-700">
                    {result.treatments.map((t, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start pl-1">
                        <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 font-bold block">Biosecure Spray Application</strong>
                          <span className="text-slate-500 text-[11px] font-medium leading-relaxed">{t}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'prevention' && (
                  <ul className="space-y-3 text-xs text-slate-700">
                    {result.preventionTips.map((p, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start pl-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 font-bold block font-sans">Crop Canopy Airflow</strong>
                          <span className="text-slate-500 text-[11px] font-medium leading-relaxed">{p}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Action buttons row below */}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-3 bg-brand-650 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition">
                <FileText className="w-4 h-4" /> Generate Full Report
              </button>
              <button className="px-4 py-3 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition">
                <Bookmark className="w-4 h-4 text-slate-400" /> Save to History
              </button>
            </div>

            {/* Expert opinion consult box matching image 7 */}
            <div className="p-4 bg-amber-50/20 border border-brand-100 rounded-xl flex gap-3.5 items-center">
              <img 
                src="https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=120&auto=format&fit=crop&q=80" 
                alt="Dr. Sarah Miller" 
                className="w-12 h-12 object-cover rounded-full border border-brand-200"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="text-[9px] font-mono tracking-wider font-bold text-brand-650 uppercase block">Expert Advisory</span>
                <p className="text-[11.5px] font-medium text-slate-600 mt-1 leading-relaxed">
                  Need a second opinion? Consult with <strong>Dr. Sarah Miller</strong>, our senior plant pathologist specializing in blight control.
                </p>
                <button className="text-[10px] uppercase font-bold text-brand-650 hover:text-brand-750 hover:underline mt-1.5 flex items-center gap-1 cursor-pointer">
                  Connect with Expert <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <span className="text-sm font-bold text-slate-700 font-sans mt-3">Awaiting foliar sample data...</span>
            <p className="text-[11px] text-slate-400 font-medium max-w-sm mt-1.5 leading-relaxed">
              Toggle any sample species on the left, or upload high-definition leaf pictures to initiate advanced automated pathology identification.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
