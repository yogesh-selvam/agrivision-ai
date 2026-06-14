import React, { useState, useEffect } from 'react';
import { Download, FileText, Printer, Loader2, Sprout, ShieldAlert, BadgeInfo, Calendar, CheckCircle } from 'lucide-react';

interface ReportViewerProps {
  token: string;
}

interface CompiledReport {
  reportId: string;
  generatedAt: string;
  farmer: {
    name: string;
    email: string;
    location: string;
    phone: string;
  };
  latestSoilAnalysis: {
    params: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      temperature: number;
      humidity: number;
      ph: number;
      rainfall: number;
    };
  } | null;
  latestCropRecommendations: Array<{
    name: string;
    description: string;
    confidence: number;
    suitabilityScore: number;
  }>;
  farmingAdvice: string;
  latestDiseaseDiagnostic: {
    cropName: string;
    diseaseName: string;
    confidence: number;
    symptoms: string[];
    treatments: string[];
    preventionTips: string[];
  } | null;
  totalCropsAnalyzed: number;
  totalDiseasesDiagnosed: number;
  totalChatSessions: number;
}

export default function ReportViewer({ token }: ReportViewerProps) {
  const [report, setReport] = useState<CompiledReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/report/generate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Report generation failed');
      }
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Connecting to report compiler failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <span className="text-sm font-bold text-slate-700 font-display">Generating Summary Report...</span>
        <p className="text-xs text-slate-400 mt-1 max-w-xs font-medium">Aggregating session logs, diagnostics, and cultivating insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xs text-center">
        <p className="text-xs text-red-650 font-mono mb-4">Error: {error}</p>
        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 cursor-pointer"
        >
          Retry Compilation
        </button>
      </div>
    );
  }

  return (
    <div id="report-viewer-parent" className="space-y-6">
      
      {/* Upper action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-xs gap-3 no-print">
        <div className="flex gap-2.5 items-center">
          <FileText className="w-5 h-5 text-brand-600" />
          <div>
            <h4 className="text-sm font-bold text-slate-800">Agribot Summary Dossier</h4>
            <p className="text-[11px] text-slate-400 font-medium">Generates enterprise-grade formatted document prints or save-to-PDF ready logs</p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchReport}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Re-Compile Data
          </button>
          
          <button
            onClick={handlePrint}
            disabled={!report}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Report Page preview */}
      {report ? (
        <div
          id="printable-report-card"
          className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/60 shadow-xs max-w-4xl mx-auto print-card font-sans text-slate-800 relative"
        >
          {/* Accent farm badge decoration */}
          <div className="absolute right-8 top-8 opacity-[0.03] pointer-events-none">
            <Sprout className="w-32 h-32 text-slate-800" />
          </div>

          {/* Corporate Header Section */}
          <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
            <div>
              <span className="text-brand-600 font-black font-display tracking-widest text-lg">🌱 AGRIBOT</span>
              <h2 className="text-xl font-bold font-display tracking-tight text-slate-800 mt-1">E-AGRICULTURE PERFORMANCE DOSSIER</h2>
              <div className="flex gap-3 text-xs text-slate-400 font-medium font-mono mt-2 flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Compiled: {new Date(report.generatedAt).toLocaleString()}</span>
                <span>•</span>
                <span>Dossier: {report.reportId.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-[9px] font-bold font-mono rounded-md uppercase border border-brand-100">Official Report</span>
              <p className="text-[11px] font-mono font-medium text-slate-400 mt-2">Agribot Analytics Core</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-slate-100">
            {/* Column 1: Farmer particulars */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-[10px] font-mono tracking-wider font-bold uppercase text-slate-400">Farmer Particulars</h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-slate-850 text-sm">{report.farmer.name}</p>
                <p><span className="text-slate-400 font-medium">Email:</span> {report.farmer.email}</p>
                <p><span className="text-slate-400 font-medium">Phone:</span> {report.farmer.phone}</p>
                <p><span className="text-slate-400 font-medium">Sectors:</span> {report.farmer.location}</p>
              </div>
            </div>

            {/* Column 2: Performance aggregate diagnostics */}
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-[10px] font-mono tracking-wider font-bold uppercase text-slate-400">Platform Diagnostic Volume</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="block font-bold text-2xl text-slate-800 font-display">{report.totalCropsAnalyzed}</span>
                  <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest block mt-1">Soils Evaluated</span>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="block font-bold text-2xl text-slate-800 font-display">{report.totalDiseasesDiagnosed}</span>
                  <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest block mt-1">Vision Scans</span>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="block font-bold text-2xl text-slate-800 font-display">{report.totalChatSessions}</span>
                  <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest block mt-1">Bot Sequences</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Soil Dynamics and crop matches */}
          <div className="py-6 border-b border-slate-100 space-y-4">
            <h4 className="text-[10px] font-mono tracking-wider font-bold uppercase text-slate-400">Soil Dynamics & Recommendation Match</h4>
            
            {report.latestSoilAnalysis ? (
              <div className="space-y-4">
                {/* Micro soil metrics log table */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {Object.entries(report.latestSoilAnalysis.params).map(([key, val]) => (
                    <div key={key} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">{key.substring(0, 4)}</span>
                      <span className="font-mono text-xs font-bold text-slate-700 mt-1 block">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Crop matches */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.latestCropRecommendations.map((crop, idx) => (
                    <div key={crop.name} className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-brand-50/40 border-brand-200' : 'bg-slate-50/20 border-slate-100'}`}>
                      <span className="font-mono text-[9px] text-brand-650 font-bold block">{idx === 0 ? 'PRIMARY SUITABILITY' : `MATCH RANK ${idx + 1}`}</span>
                      <span className="font-bold text-sm text-slate-800 font-display mt-1 block">{crop.name}</span>
                      <span className="text-xs font-mono font-bold text-slate-500 mt-1 block">Confidence: {crop.confidence}%</span>
                    </div>
                  ))}
                </div>

                {/* Agronomist detail plan */}
                {report.farmingAdvice && (
                  <div className="p-4 bg-slate-50/40 rounded-2xl border border-slate-100 text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    <p className="font-mono font-bold text-[9px] tracking-wider uppercase text-slate-400 mb-2">Cultivation Roadmap Details</p>
                    {report.farmingAdvice}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">No soil analysis sessions recorded yet for this operational season.</p>
            )}
          </div>

          {/* Section: Disease Diagnostics */}
          <div className="py-6 space-y-4">
            <h4 className="text-[10px] font-mono tracking-wider font-bold uppercase text-slate-400">Latest Biological Foliar Diagnosis</h4>
            {report.latestDiseaseDiagnostic ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start bg-slate-55/10 p-4 border border-slate-100 rounded-2xl">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase">IDENTIFIED PATHOLOGY</span>
                    <h5 className="font-bold text-base text-slate-800 font-display mt-0.5">{report.latestDiseaseDiagnostic.diseaseName}</h5>
                    <p className="text-xs text-slate-500 mt-1 font-medium"><span className="font-semibold text-slate-600">Crop:</span> {report.latestDiseaseDiagnostic.cropName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Confidence</span>
                    <span className="font-mono text-lg font-bold text-slate-800">{report.latestDiseaseDiagnostic.confidence}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase mb-2">Symptoms spotted</span>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                      {report.latestDiseaseDiagnostic.symptoms.map((s, idx) => (
                        <li key={idx} className="leading-relaxed list-none pl-3 relative">
                          <span className="absolute left-0 text-red-500">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase mb-2">Biotic Prescriptions</span>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                      {report.latestDiseaseDiagnostic.treatments.map((t, idx) => (
                        <li key={idx} className="leading-relaxed list-none pl-3 relative">
                          <span className="absolute left-0 text-brand-600">•</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-50/30 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase mb-2">Preventative Measures</span>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                      {report.latestDiseaseDiagnostic.preventionTips.map((p, idx) => (
                        <li key={idx} className="leading-relaxed list-none pl-3 relative">
                          <span className="absolute left-0 text-teal-600">•</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">No plant pathology diagnostic records available for this cycle.</p>
            )}
          </div>

          {/* Footer validation stamp */}
          <div className="border-t border-slate-200 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-400 font-mono tracking-widest font-bold uppercase gap-3">
            <span>PLATFORM: LOGGED AGRI-ANALYSIS</span>
            <span>STATUS: CERTIFIED DIGITALLY COMPLETED</span>
          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-xs text-center flex flex-col items-center justify-center">
          <BadgeInfo className="w-10 h-10 text-slate-300 mb-2" />
          <span className="text-sm font-bold text-slate-700 font-display">No summary records compiled yet</span>
          <p className="text-xs text-slate-400 font-medium max-w-sm mt-1">Run some soil predictions or disease scans to generate a comprehensive agribusiness report here.</p>
        </div>
      )}
    </div>
  );
}
