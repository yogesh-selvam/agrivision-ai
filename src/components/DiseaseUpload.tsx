import React, { useState, useRef } from 'react';
import { DiseasePrediction } from '../types';
import { Upload, Image as ImageIcon, Loader2, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, FileImage } from 'lucide-react';

interface DiseaseUploadProps {
  token: string;
  onPredictionAdded: (pred: DiseasePrediction) => void;
}

// Visual preset samples with agricultural mock representations
const BIOLOGY_SAMPLES = [
  { label: 'Apple Scab', description: 'Leathery spots on Apple leaves', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=150&auto=format&fit=crop&q=60' },
  { label: 'Corn Rust', description: 'Orange powder pustules on Maize leaves', image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150&auto=format&fit=crop&q=60' },
  { label: 'Potato Early Blight', description: 'Concentric target spots on Potato leaves', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=150&auto=format&fit=crop&q=60' },
  { label: 'Rice Blast', description: 'Unstable spindle neck blight on Rice fields', image: 'https://images.unsplash.com/photo-1536640811565-df048bbef6df?w=150&auto=format&fit=crop&q=60' },
  { label: 'Tomato Leaf Mold', description: 'Velvety grey fuzz on Tomato leaflets', image: 'https://images.unsplash.com/photo-1592417817098-8f3212041400?w=150&auto=format&fit=crop&q=60' },
  { label: 'Healthy Crop', description: 'High-chlorophyll robust leaf fibers', image: 'https://images.unsplash.com/photo-1505243171617-6ac0c4415207?w=150&auto=format&fit=crop&q=60' }
];

export default function DiseaseUpload({ token, onPredictionAdded }: DiseaseUploadProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseasePrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    // Basic image size limit security checks
    if (file.size > 8 * 1024 * 1024) {
      setError('Please select an image smaller than 8 Megabytes');
      return;
    }
    setError(null);
    try {
      const b64 = await convertFileToBase64(file);
      setImageBase64(b64);
      // Run prediction immediately on upload
      await uploadAndAnalyse(b64, null);
    } catch (err) {
      setError('Failed reading the image file format.');
    }
  };

  const uploadAndAnalyse = async (base64String: string | null, labelFallback: string | null) => {
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
          imageBase64: base64String,
          cropLabel: labelFallback
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Pathology calculation failed');
      }

      setResult(data);
      onPredictionAdded(data);
    } catch (err: any) {
      setError(err.message || 'Connecting to vision core failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectSample = async (sampleLabel: string, sampleImageUrl: string) => {
    setImageBase64(sampleImageUrl);
    await uploadAndAnalyse(null, sampleLabel);
  };

  // Drag and Drop structures
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processImageFile(e.dataTransfer.files[0]);
    }
  };

  const resetScanner = () => {
    setImageBase64(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="disease-upload-parent" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Upload and presets section */}
      <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex gap-2.5 items-center mb-4">
            <Upload className="w-5 h-5 text-brand-600" />
            <h4 className="text-xl font-bold font-display text-slate-800">Foliar Pathology Scanner</h4>
          </div>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            Upload high-definition plant leaf images. Agribot evaluates computer vision models utilizing deep learning rules to isolate lesions, blemishes, and diagnose pathogens.
          </p>

          {/* Test Samples presets */}
          <div className="space-y-2 mb-6">
            <span className="text-[10px] font-mono tracking-widest font-bold text-slate-400 uppercase">Sample Leaves</span>
            <div className="grid grid-cols-2 gap-2.5">
              {BIOLOGY_SAMPLES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => selectSample(s.label, s.image)}
                  className="p-1.5 bg-slate-50/50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 rounded-xl transition duration-150 flex items-center gap-2.5 text-left cursor-pointer group"
                >
                  <img
                    src={s.image}
                    alt={s.label}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200/50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-[11px] text-slate-700 group-hover:text-brand-700 truncate">{s.label}</h5>
                    <p className="text-[9px] text-slate-400 truncate">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Uploader wrapper */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
              dragActive ? 'border-brand-600 bg-brand-50/30' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {imageBase64 ? (
              <div className="space-y-4">
                <img
                  src={imageBase64}
                  alt="Sourced Leaf"
                  className="max-h-48 mx-auto rounded-xl object-cover shadow-xs border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div className="flex justify-center gap-2">
                  <button
                    onClick={resetScanner}
                    className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold text-[11px] rounded-lg border border-slate-200 cursor-pointer"
                  >
                    Clear Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-brand-600 font-semibold text-white hover:bg-brand-700 text-[11px] rounded-lg cursor-pointer"
                  >
                    Change Source
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-10 h-10 bg-slate-55/10 text-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <FileImage className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Drag plant photo here, or browse local files</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Supports JPEG, SVG, PNG up to 8MB max</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-55/10 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Actionable results panel */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
        {loading ? (
          <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-6">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <h4 className="text-sm font-bold text-slate-800">Analyzing Foliar Diagnostics...</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed font-medium">
              Applying agricultural pathology algorithms via dynamic Gemini Vision and extracting biological lesions...
            </p>
          </div>
        ) : result ? (
          <div id="disease-result" className="space-y-5">
            {/* Health alert badge bar */}
            <div className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  result.diseaseName.toLowerCase().includes('healthy') || result.diseaseName.toLowerCase().includes('no pathogen')
                    ? 'bg-brand-600 text-white'
                    : 'bg-red-500 text-white'
                }`}>
                  {result.diseaseName.toLowerCase().includes('healthy') || result.diseaseName.toLowerCase().includes('no pathogen') ? (
                    <ShieldCheck className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest font-bold text-slate-400 uppercase block">Identified Diagnosis</span>
                  <h3 className="text-base font-bold font-display text-slate-800 leading-tight mt-0.5">{result.diseaseName}</h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">Confidence</span>
                <span className="text-lg font-mono font-bold text-slate-800">{result.confidence}%</span>
              </div>
            </div>

            {/* Triad columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100">
                <h5 className="font-mono text-[9px] tracking-wider font-bold text-red-800 uppercase mb-2">Biological Symptoms</h5>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {result.symptoms.map((s, idx) => (
                    <li key={idx} className="leading-relaxed list-none relative pl-3 text-[11px] font-medium text-slate-600">
                      <span className="absolute left-0 top-1 text-red-500 font-black">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-brand-50/30 rounded-2xl border border-brand-100">
                <h5 className="font-mono text-[9px] tracking-wider font-bold text-brand-700 uppercase mb-2">Prescribed Remedies</h5>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {result.treatments.map((t, idx) => (
                    <li key={idx} className="leading-relaxed list-none relative pl-3 text-[11px] font-medium text-slate-600">
                      <span className="absolute left-0 top-1 text-brand-600 font-bold">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-teal-50/30 rounded-2xl border border-teal-100">
                <h5 className="font-mono text-[9px] tracking-wider font-bold text-teal-800 uppercase mb-2">Prevention & Care</h5>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {result.preventionTips.map((p, idx) => (
                    <li key={idx} className="leading-relaxed list-none relative pl-3 text-[11px] font-medium text-slate-600">
                      <span className="absolute left-0 top-1 text-teal-600 font-bold">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2.5 items-center bg-brand-50 p-4 rounded-xl text-[10px] text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Plant pathology data synced to cloud history. Select and print PDF report for comprehensive hardcopy logs.</span>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-slate-200 mb-3 animate-pulse" />
            <span className="text-sm font-bold text-slate-700 font-display">Awaiting foliar sample data...</span>
            <p className="text-[11px] text-slate-400 font-medium max-w-sm mt-1.5 leading-relaxed">
              Select or drop any sample leaves on the left, or upload raw plant photographs to trigger expert AI visual pathogen detection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
