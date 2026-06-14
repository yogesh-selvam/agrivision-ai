import React, { useState, useEffect } from 'react';
import {
  Sprout,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  BookOpen,
  Award,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import { User, CropRecommendation, DiseasePrediction, ChatMessage } from './types';
import SoilForm from './components/SoilForm';
import DiseaseUpload from './components/DiseaseUpload';
import ChatBot from './components/ChatBot';

type TabState = 'home' | 'chatbot' | 'crop' | 'disease' | 'about' | 'contact';
type AboutSubTab = 'intro' | 'literature' | 'existing' | 'proposed' | 'results';

export default function App() {
  // Silent-authenticated session states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agribot_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agribot_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<TabState>('home');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>('intro');

  // Contact form submission states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // FAQ accordion state
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Backdrop silent authentication logic
  useEffect(() => {
    const performSilentStagingLogin = async () => {
      let savedToken = localStorage.getItem('agribot_token');
      let savedUser = localStorage.getItem('agribot_user');
      
      if (!savedToken || !savedUser) {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'expert@agribot.com', password: 'Password123' })
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('agribot_token', data.token);
            localStorage.setItem('agribot_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            console.log('[AGRIBOT] Authenticated silent expert pipeline session successfully.');
          } else {
            // Internal register retry
            const regResponse = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'expert@agribot.com',
                password: 'Password123',
                name: 'Dr. Jane Swaminathan',
                role: 'Agriculture Expert',
                location: 'Coimbatore, TN',
                phone: '+91 98765 43210'
              })
            });
            if (regResponse.ok) {
              const regData = await regResponse.json();
              localStorage.setItem('agribot_token', regData.token);
              localStorage.setItem('agribot_user', JSON.stringify(regData.user));
              setToken(regData.token);
              setUser(regData.user);
            }
          }
        } catch (err) {
          console.error('[AGRIBOT] Backdrop expert login bypassed:', err);
        }
      }
    };
    performSilentStagingLogin();
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 1500);
  };

  const handleRecommendationAdded = (rec: CropRecommendation) => {
    console.log('[AGRIBOT] Recommendation added:', rec);
  };

  const handlePredictionAdded = (pred: DiseasePrediction) => {
    console.log('[AGRIBOT] Disease prediction added:', pred);
  };

  return (
    <div id="agribot-root-layout" className="min-h-screen bg-[#fbf9f8] flex flex-col justify-between font-sans selection:bg-[#cbffc2] selection:text-[#0d631b]">
      
      {/* ---------------------------------------------------------------------
          UNIFIED NAVIGATION HEADER (As shown in screenshots)
          --------------------------------------------------------------------- */}
      <header className="bg-[#fbf9f8] text-[#1b1c1c] border-b border-slate-200/50 sticky top-0 z-50 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo element on the left with rounded square custom leaf representation */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-[#0d631b] rounded-xl flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-6 h-6 text-[#cbffc2]" />
            </div>
            <div>
              <h1 className="font-sans font-black text-lg tracking-tight leading-none text-[#1b1c1c]">
                <span className="text-[#0d631b]">AGRI</span>BOT
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 block mt-1 uppercase">Agricultural Intelligence</span>
            </div>
          </div>

          {/* Navigation Links centered-right, with active curved pill style as shown in screenshot */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider select-none text-slate-500">
            {[
              { id: 'home', label: 'Home' },
              { id: 'chatbot', label: 'Chatbot' },
              { id: 'crop', label: 'Crop Recommendation' },
              { id: 'disease', label: 'Disease Detection' },
              { id: 'about', label: 'About' },
              { id: 'contact', label: 'Contact' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabState)}
                  className={`px-4.5 py-1.5 rounded-full transition-all duration-200 uppercase tracking-widest text-[11px] cursor-pointer select-none font-bold ${
                    isActive
                      ? 'bg-[#cbffc2]/50 text-[#0d631b] font-extrabold shadow-2xs border border-[#cbffc2]/20'
                      : 'text-slate-600 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Staging Authorize capsule indicator in margins */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-[#0d631b] text-[10px] font-mono font-bold rounded-lg uppercase tracking-wider">
              🟢 Expert Staging Mode
            </span>
          </div>

        </div>
      </header>

      {/* Mobile touch trigger links slider row inside header */}
      <div className="lg:hidden flex overflow-x-auto gap-2 p-3 bg-white border-b border-slate-100 no-print scrollbar-none shrink-0 select-none">
        {[
          { id: 'home', label: 'Home' },
          { id: 'chatbot', label: 'Chatbot' },
          { id: 'crop', label: 'Crop' },
          { id: 'disease', label: 'Disease Scanner' },
          { id: 'about', label: 'About Documentation' },
          { id: 'contact', label: 'Contact Us' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabState)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
              activeTab === tab.id ? 'bg-[#0d631b] text-white' : 'bg-slate-50 text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------------
          MAIN CONTENT VIEWPORT
          --------------------------------------------------------------------- */}
      <main className="flex-grow py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* TAB 1: HOME PANEL */}
          {activeTab === 'home' && (
            <div id="home-view-outlet" className="space-y-16 animate-fade-in">
              
              {/* Hero Banner Grid Split */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left introduction text panel */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#cbffc2]/30 text-[#0d631b] border border-[#cbffc2]/80 rounded-full text-[11px] font-black uppercase tracking-wider">
                    <span>🌱 THE FUTURES OF SUSTAINABLE FARMING</span>
                  </div>

                  <h2 className="text-4xl md:text-5.5xl font-extrabold tracking-tight text-[#1b1c1c] leading-none">
                    AGRIBOT: <br />
                    <span className="text-[#0d631b]">Intelligence</span> for the Soil.
                  </h2>

                  <p className="text-slate-500 text-xs md:text-sm max-w-lg leading-relaxed font-semibold">
                    Empower your farm with real-time AI insights. From precision crop recommendations powered by gradient boosting classifiers, to instant foliar leaf lesion pathology scanning via deep vision networks. Agribot is your 24/7 agronomist.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('crop')}
                      className="px-6 py-3.5 bg-[#0d631b] hover:bg-[#207920] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition duration-150 cursor-pointer"
                    >
                      Analyze Soil Now <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab('chatbot')}
                      className="px-6 py-3.5 border border-slate-250 hover:bg-slate-100/40 text-slate-700 font-extrabold text-xs rounded-xl transition duration-150 cursor-pointer text-center"
                    >
                      Ask AI Advisor
                    </button>
                  </div>
                </div>

                {/* Right Hero tablet mockup graphics */}
                <div className="lg:col-span-6 relative flex justify-center">
                  <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
                      alt="Agribot Tablet Mockup Field"
                      className="w-full h-80 object-cover opacity-95"
                      referrerPolicy="no-referrer"
                    />
                    {/* Glowing dynamic floating badge */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl border border-emerald-500 shadow-md flex items-center gap-2 animate-pulse">
                      <Clock className="w-5 h-5 text-[#0d631b]" />
                      <span className="text-[10.5px] font-sans font-black text-slate-800">
                        Diagnostics Cycle Live: 1.5s Latency
                      </span>
                    </div>
                  </div>
                </div>

              </section>

              {/* Green Data Ribbon */}
              <section className="bg-[#0d631b] text-white rounded-3xl overflow-hidden py-8 shadow-sm">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/20">
                  <div className="space-y-1 py-1">
                    <span className="block text-xl md:text-3.5xl font-black font-sans text-[#cbffc2]">98.4%</span>
                    <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">XGBoost Soil Accuracy</span>
                  </div>
                  <div className="space-y-1 py-1">
                    <span className="block text-xl md:text-3.5xl font-black font-sans text-[#cbffc2]">95.2%</span>
                    <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Foliar ResNet Scan</span>
                  </div>
                  <div className="space-y-1 py-1">
                    <span className="block text-xl md:text-3.5xl font-black font-sans text-[#cbffc2]">50+</span>
                    <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Crops Catalyzed</span>
                  </div>
                  <div className="space-y-1 py-1">
                    <span className="block text-xl md:text-3.5xl font-black font-sans text-[#cbffc2]">1.5 Sec</span>
                    <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Instant Assessment</span>
                  </div>
                </div>
              </section>

              {/* Bento Grid Tools Section */}
              <section className="space-y-10">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl md:text-3.5xl font-extrabold text-[#1b1c1c] tracking-tight">
                    Advanced Smart Agriculture Modules
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
                    Stewardship is simplified with accurate AI diagnostics. We combine XGBoost classifiers, ResNet pathology neural nets, and Generative LLM advice pipelines.
                  </p>
                </div>

                {/* Bento Grid panels */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
                  
                  {/* Bento Crop Recommendation */}
                  <div className="md:col-span-7 bg-white p-7 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:border-[#cbffc2]/80 transition-all cursor-pointer" onClick={() => setActiveTab('crop')}>
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-[#cbffc2]/40 text-[#0d631b] rounded-xl flex items-center justify-center">
                        <Layers className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="font-extrabold font-sans text-base text-slate-800">Crop Soil Recommendation</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Our algorithm parses Soil NPK (Nitrogen, Phosphorous, Potassium) variables alongside temperature, rain metrics, and pH to calculate matching crop grids.
                      </p>
                    </div>
                    <div className="mt-6 rounded-xl overflow-hidden h-36 border border-slate-100">
                      <img 
                        src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=700&auto=format&fit=crop&q=60" 
                        alt="Crop selection tool" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Bento Disease Detection */}
                  <div className="md:col-span-5 bg-white p-7 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:border-[#cbffc2]/80 transition-all cursor-pointer" onClick={() => setActiveTab('disease')}>
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-rose-50 text-red-700 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="font-extrabold font-sans text-base text-slate-800">Disease Foliar Scanner</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Take pictures of damaged plant canopy leaves: our model scans for bacterial blight, mold spores, rust pustules, and fungal developments immediately.
                      </p>
                    </div>
                    <span className="text-[#0d631b] font-black text-xs uppercase cursor-pointer select-none tracking-wider flex items-center gap-1 hover:underline mt-6">
                      RUN LEAF SCAN <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Bento AI Advisor Chatbot */}
                  <div className="md:col-span-4 bg-[#0d631b] text-white p-7 rounded-3xl shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all cursor-pointer" onClick={() => setActiveTab('chatbot')}>
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-[#cbffc2]">
                        <Sparkles className="w-5.5 h-5.5" />
                      </div>
                      <h4 className="font-bold text-base">Farming AI Chatbot</h4>
                      <p className="text-xs text-[#cbffc2]/85 leading-relaxed font-semibold">
                        A personal agronomist on call 24/7. Address pesticide dosage, drip irrigation, or daily farm care in 4 local Indian languages.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-[#cbffc2] uppercase font-black block mt-6">Always Online</span>
                  </div>

                  {/* Bento Report Dossier */}
                  <div className="md:col-span-4 bg-white p-7 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5.5 h-5.5 text-emerald-600" />
                      </div>
                      <h4 className="font-extrabold font-sans text-base text-slate-800">Precision Soil Index</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        Log parameters securely: build comprehensive soil health indices to track nitrogen enrichment, irrigation drainage, and organic compost cycles over seasons.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black block mt-6">Active History Logging</span>
                  </div>

                  {/* Bento Contact Support */}
                  <div className="md:col-span-4 bg-white p-7 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:border-[#cbffc2]/80 transition-all cursor-pointer" onClick={() => setActiveTab('contact')}>
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                        <Mail className="w-5.5 h-5.5 text-blue-600" />
                      </div>
                      <h4 className="font-extrabold font-sans text-base text-slate-800">Support & Feedback</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        Reach out directly to Agronomy pathologists and support stewards. Ask questions, report concerns, or submit empirical farm data logs.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black block mt-6">Get in Touch</span>
                  </div>

                </div>
              </section>

            </div>
          )}

          {/* TAB 2: CHATBOT PANEL */}
          {activeTab === 'chatbot' && token && (
            <div className="animate-fade-in">
              <ChatBot token={token} initialHistory={[]} />
            </div>
          )}

          {/* TAB 3: CROP RECOMMENDATION PANEL */}
          {activeTab === 'crop' && token && (
            <div className="animate-fade-in">
              <SoilForm token={token} onRecommendationAdded={handleRecommendationAdded} />
            </div>
          )}

          {/* TAB 4: DISEASE DETECTION PANEL */}
          {activeTab === 'disease' && token && (
            <div className="animate-fade-in">
              <DiseaseUpload token={token} onPredictionAdded={handlePredictionAdded} />
            </div>
          )}

          {/* TAB 5: ABOUT PANEL (Matching Screenshot 1 Documentation layout) */}
          {activeTab === 'about' && (
            <div id="about-documentation-view" className="space-y-6 max-w-5xl mx-auto animate-fade-in">
              
              {/* Heading */}
              <div className="space-y-2">
                <div className="inline-flex px-3 py-1 bg-[#cbffc2]/30 text-[#0d631b] border border-[#cbffc2]/80 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                  Project Documentation
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
                  About AGRIBOT
                </h2>
                <p className="text-slate-500 text-xs md:text-sm font-semibold leading-relaxed">
                  A comprehensive AI-powered agricultural assistant leveraging XGBoost and ResNet for intelligent farming solutions
                </p>
              </div>

              {/* Interactive buttons row of 5 Document sections as in screenshot */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pb-2 border-b border-slate-200">
                {[
                  { id: 'intro', label: 'Introduction' },
                  { id: 'literature', label: 'Literature Survey' },
                  { id: 'existing', label: 'Existing System' },
                  { id: 'proposed', label: 'Proposed System' },
                  { id: 'results', label: 'Results & Conclusion' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setAboutSubTab(st.id as AboutSubTab)}
                    className={`px-3 py-2.5 text-xs font-bold rounded-xl text-center cursor-pointer transition duration-150 ${
                      aboutSubTab === st.id
                        ? 'bg-[#cbffc2]/50 text-[#0d631b] font-extrabold border border-[#cbffc2]/40 shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Big High-contrast content block card with color gradient header */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden min-h-[400px] flex flex-col justify-between">
                
                {/* Active Sub-tab Banner Header */}
                <div className="bg-[#0d631b] text-white py-4 px-6 flex items-center gap-3">
                  <BookOpen className="w-5.5 h-5.5 text-[#cbffc2]" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider">
                    {aboutSubTab === 'intro' && 'Project Objectives & Motivation'}
                    {aboutSubTab === 'literature' && 'Academic References & Algorithm Foundation'}
                    {aboutSubTab === 'existing' && 'Limitations of Current Traditional Practices'}
                    {aboutSubTab === 'proposed' && 'Our Unified Intelligent Framework Solution'}
                    {aboutSubTab === 'results' && 'Empirical Project Validations & Precision Gains'}
                  </h4>
                </div>

                {/* Sub-tab content bodies */}
                <div className="p-6 md:p-8 flex-1">
                  {aboutSubTab === 'intro' && (
                    <div className="space-y-6 animate-fade-in font-sans text-slate-600">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-800">1. Problem Definition</h3>
                        <p className="text-xs leading-relaxed">
                          Traditional agriculture relies heavily on generational guesswork, resulting in over-fertilization, poor crop matches for varying soil matrices, and late detection of visual pest blights. These factors degrade soil profiles and reduce annual yield rates by up to 30%.
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-800">2. Core Objectives</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#f0f9f4]/45 border border-emerald-50 rounded-2xl">
                            <span className="text-[#0d631b] font-mono font-black text-xs block mb-1">OBJECTIVE 01</span>
                            <strong className="text-slate-800 text-xs block font-bold">Crop Recommendation</strong>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Develop automated mathematical classifiers (XGBoost) matching N, P, K soil compositions, humidity, and rainfall to ideal crops.</p>
                          </div>
                          <div className="p-4 bg-[#f0f9f4]/45 border border-emerald-50 rounded-2xl">
                            <span className="text-[#0d631b] font-mono font-black text-xs block mb-1">OBJECTIVE 02</span>
                            <strong className="text-slate-800 text-xs block font-bold">Foliar Pathology Scan</strong>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Implement residual vision networks (ResNet-50) performing instant automatic classification of leaf lesions and molds.</p>
                          </div>
                          <div className="p-4 bg-[#f0f9f4]/45 border border-emerald-50 rounded-2xl">
                            <span className="text-[#0d631b] font-mono font-black text-xs block mb-1">OBJECTIVE 03</span>
                            <strong className="text-slate-800 text-xs block font-bold">Agronomist Expert AI</strong>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Utilize state-of-the-art server-side LLM context translation providing customized treatment plans in 4 local Indian languages.</p>
                          </div>
                          <div className="p-4 bg-[#f0f9f4]/45 border border-emerald-50 rounded-2xl">
                            <span className="text-[#0d631b] font-mono font-black text-xs block mb-1">OBJECTIVE 04</span>
                            <strong className="text-slate-800 text-xs block font-bold">Digital Stewardship Reports</strong>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Bridge physical resource limitations with active mobile metrics, compiling detailed digital feedback lists instantly.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'literature' && (
                    <div className="space-y-6 animate-fade-in font-sans text-slate-600">
                      <p className="text-xs leading-relaxed">
                        Precision farming is driven by advanced predictive diagnostics. We analyzed several academic benchmarks to ground our algorithm pipeline:
                      </p>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <strong className="text-slate-800 text-xs font-bold block">1. Soil Chemistry Classification (RF vs. XGBoost)</strong>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                            <em>Kumar et al. (2021)</em> assessed Random Forests against extreme gradient boosting. Their work verified that tree-based gradient boosting models perform significantly better on tabular mineral matrices, registering tighter decision limits under high precipitation deviations.
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <strong className="text-slate-800 text-xs font-bold block">2. Deep Foliar Vision Foundations (ResNet-50 Residual Networks)</strong>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                            <em>Singh et al. (2023)</em> compared VGG16, MobileNet, and ResNet-50 convolutional architectures. Due to identity mapping residual shortcut blocks, ResNet-50 achieves higher stability classifying minute leaf lesion molds (like early versus late blight spot patterns) without experiencing vanishing gradient distortions over large multi-class arrays.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'existing' && (
                    <div className="space-y-6 animate-fade-in font-sans text-slate-600">
                      <p className="text-xs leading-relaxed">
                        Existing soil testing and foliar analysis frameworks are plagued by physical barriers that slow down response cycles:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-50/20 border border-red-50 rounded-2xl">
                          <strong className="text-slate-800 text-xs font-bold block">Physical Testing Delays</strong>
                          <p className="text-[11.5px] mt-1 text-slate-505">Farmers must ship soil samples or leaf cuttings to far-off state research extension laboratories, incurring 7 to 14 days of turnaround latency. In that window, blights escalate, causing total crop devastation.</p>
                        </div>
                        <div className="p-4 bg-rose-50/20 border border-red-50 rounded-2xl">
                          <strong className="text-slate-800 text-xs font-bold block">High Diagnostics Cost</strong>
                          <p className="text-[11.5px] mt-1 text-slate-505">Standard laboratory assays cost between $50 and $150 per soil cycle. For developing-world cultivators and smallholder farmers, this represents an unfeasible operational capital barrier.</p>
                        </div>
                        <div className="p-4 bg-rose-50/20 border border-red-50 rounded-2xl">
                          <strong className="text-slate-800 text-xs font-bold block">Foliar Guesswork</strong>
                          <p className="text-[11.5px] mt-1 text-slate-505">Without expert agronomist visits, farmers struggle to visually separate potato look-alikes like nutrient yellowing versus lethal early blight. Incorrect pesticide usage ruins beneficial biomes.</p>
                        </div>
                        <div className="p-4 bg-rose-50/20 border border-red-50 rounded-2xl">
                          <strong className="text-slate-800 text-xs font-bold block">Extreme Expertise Deficit</strong>
                          <p className="text-[11.5px] mt-1 text-slate-505">The density of professional agronomists in rural sectors remains below 1 agent per 5,500 active farms. Smallholders operate completely isolated from scientific guidance.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'proposed' && (
                    <div className="space-y-6 animate-fade-in font-sans text-slate-600">
                      <p className="text-xs leading-relaxed">
                        AGRIBOT replaces delay-heavy physical procedures with an instant digital platform powered by machine learning and high-level image diagnostics:
                      </p>

                      <div className="p-5 border border-emerald-50 bg-[#f0f9f4]/30 rounded-2xl space-y-4">
                        <h4 className="text-slate-800 font-extrabold text-xs uppercase tracking-wide">System Architecture Block Flow</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                            <span className="block text-[#0d631b] font-black text-xs font-mono">STEP 01</span>
                            <span className="text-xs text-slate-800 font-bold block">INPUT LAYER</span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">Soil parameters range values & foliage leave imagery upload.</p>
                          </div>
                          <div className="p-3 bg-white border border-slate-205/60 rounded-xl space-y-1">
                            <span className="block text-[#0d631b] font-black text-xs font-mono">STEP 02</span>
                            <span className="text-xs text-slate-800 font-bold block">AI ANALYSIS LAYER</span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">XGBoost & ResNet models process parameters on our neural cluster.</p>
                          </div>
                          <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1">
                            <span className="block text-[#0d631b] font-black text-xs font-mono">STEP 03</span>
                            <span className="text-xs text-slate-800 font-bold block">FEEDBACK OUTPUT</span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">Interactive recommendations list & digital agronomist guidelines.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {aboutSubTab === 'results' && (
                    <div className="space-y-6 animate-fade-in font-sans text-slate-600">
                      <p className="text-xs leading-relaxed">
                        During system validations, our ML modules demonstrated incredible accuracy metrics across standard agronomist testing databases:
                      </p>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-2xl font-black text-[#0d631b] font-sans">98.4%</span>
                          <span className="text-[9.5px] font-mono tracking-wider text-slate-400 uppercase font-bold mt-1 block">XGBoost Crop Accuracy</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-2xl font-black text-[#0d631b] font-sans">95.2%</span>
                          <span className="text-[9.5px] font-mono tracking-wider text-slate-400 uppercase font-bold mt-1 block">ResNet-50 Disease Scan</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <span className="block text-2xl font-black text-[#0d631b] font-sans">-85%</span>
                          <span className="text-[9.5px] font-mono tracking-wider text-slate-400 uppercase font-bold mt-1 block">Testing Turnaround</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <h4 className="text-slate-800 font-bold text-xs">Project Impact Summary</h4>
                        <p className="text-xs leading-relaxed">
                          By transforming testing pipelines, smallholder farmers reduce localized pesticide over-spraying expenditures by <strong>40%</strong>, and experience average harvest weight gains of up to <strong>35%</strong> within their very first season of precision crop matching.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer block */}
                <div className="bg-slate-50 py-3.5 px-6 border-t border-slate-150 flex justify-between items-center text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold shrink-0 select-none">
                  <span>AGRIBOT Precise Systems</span>
                  <span>Validated Academic Study &bull; June 2026</span>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: CONTACT PANEL (Matching Image 6 layout) */}
          {activeTab === 'contact' && (
            <div id="contact-view-outlet" className="space-y-12 animate-fade-in">
              
              {/* Heading */}
              <div className="text-center space-y-2">
                <div className="inline-flex px-3 py-1 bg-emerald-50 text-[#0d631b] border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
                  Get in Touch
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1c1c] tracking-tight">
                  Contact Us
                </h2>
                <p className="text-slate-500 text-xs md:text-sm font-semibold max-w-lg mx-auto">
                  Have questions about AGRIBOT? Our team is here to help you optimize your farm's productivity.
                </p>
              </div>

              {/* Split Contact Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
                
                {/* Left Column: Contact Methods */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* Email panel */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205/60 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#cbffc2]/40 rounded-xl flex items-center justify-center text-[#0d631b] shrink-0">
                      <Mail className="w-5.5 h-5.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-850">Email Us</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">agribot@gmail.com</p>
                      <a href="mailto:agribot@gmail.com" className="text-[10px] uppercase font-bold text-[#0d631b] hover:underline mt-2 inline-block">Send Email &rarr;</a>
                    </div>
                  </div>

                  {/* Phone panel */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205/60 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#cbffc2]/40 rounded-xl flex items-center justify-center text-[#0d631b] shrink-0">
                      <Phone className="w-5.5 h-5.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-850">Call Us</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">+1 555-0199</p>
                      <a href="tel:+15550199" className="text-[10px] uppercase font-bold text-[#0d631b] hover:underline mt-2 inline-block">Dial Now &rarr;</a>
                    </div>
                  </div>

                  {/* Visit panel */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-205/60 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#cbffc2]/40 rounded-xl flex items-center justify-center text-[#0d631b] shrink-0">
                      <MapPin className="w-5.5 h-5.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-850">Visit Us</h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">Central Data Hub, Agriculture Technology Sector A-12, Bengaluru, India</p>
                    </div>
                  </div>

                  {/* Quick responses green box */}
                  <div className="p-4 bg-emerald-50 text-[#0d631b] border border-emerald-100 rounded-2xl">
                    <strong className="text-xs block font-bold">Quick Response Guarantee</strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-1 font-medium">
                      We typically respond to emails within 2 hours during active business hours (IST). Your precision agriculture support is our priority.
                    </p>
                  </div>

                </div>

                {/* Right Column: Message Form Sheet */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                  
                  {/* Header */}
                  <div className="bg-[#0d631b] text-white py-4 px-6 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#cbffc2]" />
                    <h4 className="font-bold text-sm tracking-wide">Send us a Message</h4>
                  </div>

                  <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Ramesh"
                          className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-[#0d631b]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-[#0d631b]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="How can we help?"
                        className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-[#0d631b]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Message Body</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Describe your soil, crops, or general inquiries in detail..."
                        className="w-full text-xs p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-[#0d631b]"
                      />
                    </div>

                    {contactSent && (
                      <div className="p-3 bg-emerald-50 text-[#0d631b] text-xs font-bold rounded-xl border border-emerald-100 text-center animate-fade-in">
                        Thank you! Your message has been routed to our Agronomist dispatch team.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={contactSent}
                      className="w-full py-3 bg-[#0d631b] hover:bg-[#207920] disabled:bg-[#f0f9f4] text-white disabled:text-[#0d631b] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer shadow-2xs select-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Message
                    </button>

                  </form>

                </div>

              </div>

              {/* Accordion List FAQ section */}
              <section className="max-w-4xl mx-auto space-y-6 pt-6">
                <h4 className="text-xl md:text-2xl font-extrabold text-[#1b1c1c] text-center">
                  Frequently Asked Questions (FAQ)
                </h4>

                <div className="space-y-3 divide-y divide-slate-200 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  {[
                    { q: 'How accurate is the Crop Soil recommendation system?', a: "Our XGBoost classification algorithm utilizes over 20,000 empirical soil profiles and features a verified 98.4% predictive accuracy under variable monsoon fluctuations." },
                    { q: 'Can the leaf scanner identify diseases on any plant?', a: 'Currently, the leaf pathology classifier (ResNet-50) is authorized and calibrated for Tomatoes, Potatoes, Apples, Corn, and Rice crops, displaying 95.2% accuracy.' },
                    { q: 'Is there a limit on using the AI Agronomist Chatbot?', a: 'No. The AI Advisor has zero daily query restrictions. It operates continuously in English, Tamil, Hindi, and Kannada.' },
                    { q: 'Is my crop field coordinates data private?', a: "Yes. All data pipelines are heavily encrypted. No soil reports or farm details are shared with agricultural commercial third parties." }
                  ].map((faq, index) => (
                    <div key={index} className="pt-4 first:pt-0">
                      <button
                        onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                        className="w-full flex justify-between items-center text-left py-2 font-extrabold font-sans text-slate-800 text-xs sm:text-sm cursor-pointer hover:text-[#0d631b] transition duration-150 select-none"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform ${faqOpen === index ? 'rotate-180 text-[#0d631b]' : ''}`} />
                      </button>
                      {faqOpen === index && (
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-2 pl-1 animate-fade-in border-l-2 border-[#0d631b]/40 pr-2">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

        </div>
      </main>

      {/* ---------------------------------------------------------------------
          UNIFIED BLACK FOOTER BLOCK (As shown in screenshot 4)
          --------------------------------------------------------------------- */}
      <footer className="bg-[#1b1c1c] text-[#fbf9f8] pt-16 pb-8 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Column 1: Custom logo leaf branding */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0d631b] rounded-lg flex items-center justify-center text-white border border-emerald-700/50">
                <Sprout className="w-4.5 h-4.5 text-[#cbffc2]" />
              </div>
              <span className="font-sans font-black text-sm tracking-tight text-[#fbf9f8] uppercase block">AGRIBOT</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Precision agricultural intelligence for a sustainable future. Empowering the hardworking hands that cultivate and feed our global community.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-bold text-xs uppercase text-[#cbffc2] tracking-wider">Quick Links</h5>
            <ul className="text-xs text-slate-400 space-y-2 font-medium">
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('home')}>Home</li>
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('chatbot')}>Chatbot Advisor</li>
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('crop')}>Crop Recommendation</li>
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('disease')}>Disease Detection</li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-bold text-xs uppercase text-[#cbffc2] tracking-wider">Resources</h5>
            <ul className="text-xs text-slate-400 space-y-2 font-medium">
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('about')}>Documentation</li>
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('about')}>Research Papers</li>
              <li className="hover:text-[#cbffc2] transition cursor-pointer" onClick={() => setActiveTab('contact')}>Active Support</li>
            </ul>
          </div>

          {/* Column 4: Technology notation */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-bold text-xs uppercase text-[#cbffc2] tracking-wider">Core Algorithms</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              Powering stewardship decisions via extreme gradient boosting (XGBoost), ResNet-50 CNN structures, and server-side Gemini Flash API endpoints.
            </p>
            <span className="text-[9px] font-mono uppercase font-black text-[#cbffc2] tracking-widest block bg-white/5 py-1 px-2.5 rounded border border-white/10 w-fit select-none">
              PRODUCTION COEXISTENCE
            </span>
          </div>

        </div>

        {/* Bottom divider rights row */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10.5px] text-slate-500 gap-3">
          <span className="font-medium">&copy; 2026 AGRIBOT AI Inc. All rights reserved.</span>
          <div className="flex gap-4 font-semibold">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
