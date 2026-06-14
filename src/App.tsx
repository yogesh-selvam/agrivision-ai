import React, { useState, useEffect } from 'react';
import {
  Sprout,
  User as UserIcon,
  LogIn,
  UserPlus,
  LogOut,
  Sliders,
  Flame,
  LayoutDashboard,
  Bug,
  MessageSquare,
  FileText,
  UserCheck,
  ShieldCheck,
  Building,
  CheckCircle,
  HelpCircle,
  Wheat,
  Activity,
  UserX,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  Globe,
  HeartHandshake,
  Plus,
  Bell,
  CheckCircle2,
  ChevronDown,
  Mail,
  Send,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';
import { User, CropRecommendation, DiseasePrediction, ChatMessage, SystemStats } from './types';
import DashboardStats from './components/DashboardStats';
import SoilForm from './components/SoilForm';
import DiseaseUpload from './components/DiseaseUpload';
import ChatBot from './components/ChatBot';
import ReportViewer from './components/ReportViewer';

type AppTab = 'dashboard' | 'soil' | 'disease' | 'chat' | 'reports' | 'profile' | 'admin';

export default function App() {
  // Authentication & session state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agribot_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agribot_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Flow State: 'landing' | 'login' | 'register' | 'app'
  const [flow, setFlow] = useState<'landing' | 'login' | 'register' | 'app'>(() => {
    return localStorage.getItem('agribot_token') ? 'app' : 'landing';
  });

  // Forms state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLocation, setAuthLocation] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authRole, setAuthRole] = useState<'Farmer' | 'Agriculture Expert' | 'Admin'>('Farmer');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Profile Form state
  const [profileName, setProfileName] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Histories state for global analytics synchronization
  const [cropHistory, setCropHistory] = useState<CropRecommendation[]>([]);
  const [diseaseHistory, setDiseaseHistory] = useState<DiseasePrediction[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);

  // Admin section: lists of users for audit views
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // Password retrieval sequence simulated logic
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Active language toggle inside landing & app
  const [activeLang, setActiveLang] = useState<'English' | 'Tamil' | 'Hindi' | 'Kannada'>('English');

  // FAQ state toggles
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Initialize profile values when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileLocation(user.location || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  // Sync historical values on login
  useEffect(() => {
    if (token && flow === 'app') {
      fetchUserHistories();
    }
  }, [token, flow]);

  const fetchUserHistories = async () => {
    if (!token) return;
    try {
      const [cropRes, diseaseRes, chatRes, statsRes] = await Promise.all([
        fetch('/api/crop/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/disease/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/chat/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const parseJsonSafe = async (res: Response) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            return await res.json();
          } catch (e) {
            console.warn('Response was OK but JSON parse failed:', e);
            return null;
          }
        }
        return null;
      };

      const crops = await parseJsonSafe(cropRes);
      const diseases = await parseJsonSafe(diseaseRes);
      const chats = await parseJsonSafe(chatRes);
      const analytics = await parseJsonSafe(statsRes);

      if (crops) setCropHistory(crops);
      if (diseases) setDiseaseHistory(diseases);
      if (chats) setChatHistory(chats);
      if (analytics) setStats(analytics);

      if (user?.role === 'Admin') {
        const usersRes = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        const usersList = await parseJsonSafe(usersRes);
        if (usersList) setAdminUsers(usersList);
      }
    } catch (err) {
      console.error('Failed syncing cloud collections:', err);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication rejected');
      }

      localStorage.setItem('agribot_token', data.token);
      localStorage.setItem('agribot_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      
      setAuthEmail('');
      setAuthPassword('');
      setFlow('app');
      setActiveTab('dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Connecting to auth server failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          name: authName,
          role: authRole,
          location: authLocation,
          phone: authPhone
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setAuthSuccess('Account registered successfully! Initiating session dashboard...');
      
      setTimeout(() => {
        localStorage.setItem('agribot_token', data.token);
        localStorage.setItem('agribot_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
        setAuthLocation('');
        setAuthPhone('');
        setFlow('app');
        setActiveTab('dashboard');
      }, 1200);
    } catch (err: any) {
      setAuthError(err.message || 'Connecting server registration channels failed.');
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout log registration collapsed:', err);
      }
    }
    
    localStorage.removeItem('agribot_token');
    localStorage.removeItem('agribot_user');
    setToken(null);
    setUser(null);
    setFlow('landing');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          location: profileLocation,
          phone: profilePhone,
          password: profilePassword || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Updating profile failed');
      }

      localStorage.setItem('agribot_user', JSON.stringify(data.user));
      setUser(data.user);
      setProfilePassword('');
      setProfileStatus({ type: 'success', text: 'All contact details and security codes updated successfully.' });
      
      fetchUserHistories();
    } catch (err: any) {
      setProfileStatus({ type: 'error', text: err.message || 'Connecting configuration channels failed.' });
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail })
    }).catch(err => console.error(err));
  };

  const loadDemoCredentials = (role: 'Farmer' | 'Expert' | 'Admin') => {
    setAuthError(null);
    if (role === 'Admin') {
      setAuthEmail('admin@agribot.com');
      setAuthPassword('Password123');
    } else if (role === 'Expert') {
      setAuthEmail('expert@agribot.com');
      setAuthPassword('Password123');
    } else {
      setAuthEmail('expert@agribot.com');
      setAuthPassword('Password123');
    }
  };

  return (
    <div id="agribot-root-layout" className="min-h-screen bg-[#fbf9f8] flex flex-col justify-between font-sans">
      
      {/* ---------------------------------------------------------------------
          UNAUTHENTICATED HEADER / NAVIGATION
          --------------------------------------------------------------------- */}
      {flow !== 'app' && (
        <header className="bg-[#fbf9f8] text-[#1b1c1c] border-b border-slate-200/50 sticky top-0 z-50 transition duration-150 py-4 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            
            {/* Logo Group */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFlow('landing')}>
              <div className="w-10 h-10 bg-[#0d631b] rounded-xl flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="font-sans font-black text-base tracking-tight text-[#0d631b] leading-none">
                  AGRIBOT
                </h1>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 block mt-1 uppercase">Agricultural Intelligence</span>
              </div>
            </div>

            {/* Middle Nav Links */}
            <div className="hidden lg:flex items-center gap-8 text-[11.5px] font-black uppercase text-slate-500 tracking-wider">
              <span className="hover:text-brand-600 transition cursor-pointer">Recommendations</span>
              <span className="hover:text-brand-600 transition cursor-pointer">Disease Scan</span>
              <span className="hover:text-brand-600 transition cursor-pointer">AI Advisor</span>
              <span className="hover:text-brand-600 transition cursor-pointer">Enterprise</span>
            </div>

            {/* Right Controls: Languages Toggles & Auth actions */}
            <div className="flex items-center gap-4">
              
              {/* Language toggler */}
              <div id="landing-language-picker" className="hidden sm:flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-150">
                {(['English', 'Tamil', 'Hindi', 'Kannada'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition cursor-pointer ${
                      activeLang === lang
                        ? 'bg-[#0d631b] text-white'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {lang === 'English' ? 'EN' : lang === 'Tamil' ? 'தமிழ்' : lang === 'Hindi' ? 'हिंदी' : 'ಕನ್ನಡ'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5">
                {flow === 'landing' ? (
                  <>
                    <button
                      onClick={() => { setFlow('login'); setAuthError(null); }}
                      className="px-4 py-2 bg-white text-[#1b1c1c] hover:bg-slate-50 border border-slate-205 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setFlow('register'); setAuthError(null); }}
                      className="px-4 py-2 bg-[#0d631b] hover:bg-[#2e7d32] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Get Started
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setFlow('landing')}
                    className="px-4 py-2 border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 text-xs rounded-xl transition cursor-pointer"
                  >
                    Back to Cover
                  </button>
                )}
              </div>
            </div>

          </div>
        </header>
      )}

      {/* ---------------------------------------------------------------------
          MAIN CONTENT VIEWPORT
          --------------------------------------------------------------------- */}
      <main className="flex-grow">

        {/* ---------------------------------------------------------------------
            1. LANDING PAGE REDESIGN MATCHING SCREENSHOTS 1, 3, 4
            --------------------------------------------------------------------- */}
        {flow === 'landing' && (
          <div id="landing-container" className="space-y-16 pb-20">
            
            {/* Hero Split Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left text panel */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Active Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#cbffc2]/30 text-[#0d631b] border border-[#cbffc2]/80 rounded-full text-[11px] font-black uppercase tracking-wider">
                  <span>🌱 The Future of Farming is Here</span>
                </div>

                <h2 className="text-4xl md:text-5.5xl font-extrabold tracking-tight text-[#1b1c1c] leading-none">
                  AGRIBOT: <br />
                  <span className="text-[#0d631b]">Intelligence</span> for the Soil.
                </h2>

                <p className="text-slate-500 text-xs md:text-sm max-w-lg leading-relaxed font-semibold">
                  Empower your farm with real-time AI insights. From precision crop recommendations to instant disease detection. Agribot is your 24/7 agricultural expert, designed to maximize yield and minimize waste.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setFlow('register')}
                    className="px-6 py-3.5 bg-[#0d631b] hover:bg-[#2e7d32] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition duration-150 cursor-pointer"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setFlow('login'); loadDemoCredentials('Expert'); handleLogin(); }}
                    className="px-6 py-3.5 border border-slate-250 hover:bg-slate-55/10 text-slate-700 font-extrabold text-xs rounded-xl transition duration-150 cursor-pointer"
                  >
                    Try Demo Staging
                  </button>
                </div>
              </div>

              {/* Right Mockup image panel */}
              <div className="lg:col-span-6 relative flex justify-center">
                <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/50 shadow-lg bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80"
                    alt="Agribot Tablet Mockup Field"
                    className="w-full h-80 object-cover opacity-95"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating badge inside picture */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-500 shadow-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#0d631b]" />
                    <span className="text-[10.5px] font-sans font-black text-slate-800">
                      Live Analysis: Soil Health: 85% Optimum
                    </span>
                  </div>
                </div>
              </div>

            </section>

            {/* Custom Green Ribbon row container matching screenshots */}
            <section className="bg-[#0d631b] py-8 text-white">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/20 whitespace-nowrap">
                <div className="space-y-1">
                  <span className="block text-xl md:text-3xl font-black font-sans">98%</span>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Prediction Accuracy</span>
                </div>
                <div className="space-y-1 pt-4 md:pt-0">
                  <span className="block text-xl md:text-3xl font-black font-sans">95%</span>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Disease Detection</span>
                </div>
                <div className="space-y-1 pt-4 md:pt-0">
                  <span className="block text-xl md:text-3xl font-black font-sans">50+</span>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Crops Supported</span>
                </div>
                <div className="space-y-1 pt-4 md:pt-0">
                  <span className="block text-xl md:text-3xl font-black font-sans">40+</span>
                  <span className="text-[9px] md:text-[10px] font-mono tracking-widest text-[#cbffc2]/80 uppercase font-black">Diseases Identified</span>
                </div>
              </div>
            </section>

            {/* Bento-grid Features Section (Image 4 Features Grid) */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
              <div className="text-center space-y-2">
                <h3 className="text-2xl md:text-3.5xl font-extrabold text-[#1b1c1c] tracking-tight">
                  Advanced Tools for the Modern Farm
                </h3>
                <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-semibold">
                  Precision stewardship means having the right information at your fingertips. Agribot combines satellite data, field sensors, and deep learning.
                </p>
              </div>

              {/* Bento Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
                
                {/* Bento Card 1 - Crop Recommendation (Span 7, doubled) */}
                <div className="md:col-span-7 bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-brand-100 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-[#cbffc2]/40 text-[#0d631b] rounded-xl flex items-center justify-center">
                      <Wheat className="w-5.5 h-5.5" />
                    </div>
                    <h4 className="font-extrabold font-sans text-base text-slate-800">Crop Recommendation</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-md">
                      Our AI analyzes soil pH, nitrogen, phosphorus, and potassium levels alongside climate data to suggest the most profitable and sustainable crops for your specific plot.
                    </p>
                  </div>
                  <div className="mt-6 rounded-xl overflow-hidden h-36 border border-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=60" 
                      alt="Crop selection tool" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Bento Card 2 - Disease Detection */}
                <div className="md:col-span-5 bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-brand-100 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-orange-100/60 text-[#7a5649] rounded-xl flex items-center justify-center">
                      <Bug className="w-5.5 h-5.5" />
                    </div>
                    <h4 className="font-extrabold font-sans text-base text-slate-800">Disease Detection</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Upload a photo of your plant leaves to instantly identify pests or diseases with 95% accuracy.
                    </p>
                  </div>
                  <button 
                    onClick={() => setFlow('login')}
                    className="text-[#0d631b] font-black text-xs uppercase tracking-wider flex items-center gap-1 hover:underline mt-6 text-left"
                  >
                    SCAN NOW <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Bento Card 3 - AI Chatbot (Solid green panel) */}
                <div className="md:col-span-4 bg-[#0d631b] text-white p-7 rounded-3xl shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                      <MessageSquare className="w-5.5 h-5.5" />
                    </div>
                    <h4 className="font-bold text-base">AI Chatbot</h4>
                    <p className="text-xs text-[#cbffc2]/85 leading-relaxed font-semibold">
                      Your virtual agronomist available 24/7. Ask questions about irrigation, pests, or harvest timing in any language.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-[#cbffc2] uppercase font-black block mt-6">Active Multilingual</span>
                </div>

                {/* Bento Card 4 - Expert reports */}
                <div className="md:col-span-4 bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-brand-100 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
                      <FileText className="w-5.5 h-5.5" />
                    </div>
                    <h4 className="font-extrabold font-sans text-base text-slate-800">Expert Reports</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      Generate comprehensive PDF reports of your farm's health to share with stakeholders or banks for financing.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black block mt-6">Dossier PDF Ready</span>
                </div>

                {/* Bento Card 5 - Local Language Support */}
                <div className="md:col-span-4 bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-brand-100 transition-all">
                  <div className="space-y-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center">
                      <Globe className="w-5.5 h-5.5" />
                    </div>
                    <h4 className="font-extrabold font-sans text-base text-slate-800">Local Language Support</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                      Access technology in English, Tamil, Hindi, or Kannada. No language barrier to smart farming.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-black block mt-6">4 Global Languages</span>
                </div>

              </div>
            </section>

            {/* Testimonials section with drone image */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Quote cards layout */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3.5xl font-extrabold text-[#1b1c1c] tracking-tight">
                    What Our Farmers Say
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Testimonial 1 */}
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs relative">
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      "Agribot saved my tomato crop this season. The disease detection identified early blight before it spread, saving me thousands."
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-205 flex items-center justify-center font-bold text-xs">RK</div>
                      <div>
                        <h6 className="font-extrabold text-slate-850 text-xs">Rajesh Kumar</h6>
                        <span className="text-[10px] text-slate-400">Horticulture Specialist, Tamil Nadu</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs relative">
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      "The multi-language support is a game changer. My team can use the AI assistant in Kannada, which has drastically improved our daily operations."
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-205 flex items-center justify-center font-bold text-xs">SG</div>
                      <div>
                        <h6 className="font-extrabold text-slate-850 text-xs">Sunita Gowda</h6>
                        <span className="text-[10px] text-slate-400">Organic Farm Owner, Karnataka</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side Drone layout photo banner */}
              <div className="lg:col-span-5 h-[360px] rounded-3xl overflow-hidden border border-slate-200/55 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1505243171617-6ac0c4415207?w=600&auto=format&fit=crop&q=80"
                  alt="Drone field scan"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

            </section>

            {/* Accordion Frequently Asked Questions FAQ section */}
            <section className="max-w-4xl mx-auto px-6 space-y-6">
              <h4 className="text-xl md:text-2xl font-extrabold text-[#1b1c1c] text-center">
                Frequently Asked Questions
              </h4>

              <div className="space-y-3 divide-y divide-slate-100">
                {[
                  { q: 'How accurate is the disease detection?', a: "Agribot's AI model has been trained on over 500,000 agricultural images and achieves a verified 95% accuracy rate for major crops like rice, wheat, tomatoes, and potatoes." },
                  { q: 'Does it work without an internet connection?', a: 'You can use the native offline features to record data on-site, which auto-syncs securely with the cloud once internet connectivity is restored.' },
                  { q: 'Is my farm data secure and private?', a: 'Yes. All records, photos, and analysis are protected under premium 256-bit encryption. We never share farmer coordinates or proprietary yield margins with external parties.' }
                ].map((faq, index) => (
                  <div key={index} className="pt-4 first:pt-0">
                    <button
                      onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                      className="w-full flex justify-between items-center text-left py-2 font-bold font-sans text-slate-800 text-xs sm:text-sm cursor-pointer hover:text-brand-600 transition"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen === index ? 'rotate-180' : ''}`} />
                    </button>
                    {faqOpen === index && (
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-2 pl-1 animate-fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom CTA Card */}
            <section className="max-w-4xl mx-auto px-6">
              <div className="bg-[#0d631b] text-white p-8 sm:p-12 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-md">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                  <Sprout className="w-64 h-64 text-white" />
                </div>
                
                <h3 className="text-2xl sm:text-3.5xl font-extrabold max-w-xl mx-auto leading-tight">
                  Ready to transform your farm?
                </h3>
                <p className="text-[#cbffc2]/85 text-xs max-w-lg mx-auto leading-relaxed font-semibold">
                  Join over 10,000+ farmers using Agribot to optimize their yield and secure their future. Get your free soil analysis report for free.
                </p>

                <button
                  onClick={() => setFlow('register')}
                  className="px-6 py-3 bg-white text-[#0d631b] hover:bg-slate-50 font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  Start Free Trial
                </button>
              </div>
            </section>

          </div>
        )}

        {/* ---------------------------------------------------------------------
            2. SECURITY AUTHENTICATE / REGISTER LOGIN SCREENS (Matching Images)
            --------------------------------------------------------------------- */}
        {flow === 'login' && (
          <section id="login-section" className="py-16 px-6 max-w-md mx-auto space-y-6">
            <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Verify Credentials</h3>
                <p className="text-xs text-slate-400 font-semibold">Identify through staging ag-network coordinates</p>
              </div>

              {/* preseeds helper block */}
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
                <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase block">Staging Quick-Connect Logs</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setAuthEmail('admin@agribot.com'); setAuthPassword('Password123'); }}
                    className="px-3 py-1.5 bg-white border border-slate-150 text-[10.5px] font-mono font-bold rounded-lg cursor-pointer transition text-left truncate"
                  >
                    Admin Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthEmail('expert@agribot.com'); setAuthPassword('Password123'); }}
                    className="px-3 py-1.5 bg-white border border-slate-150 text-[10.5px] font-mono font-bold rounded-lg cursor-pointer transition text-left truncate"
                  >
                    Expert Account
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Registered Email Coordinates</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="operator@agribot.com"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-850 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10.5px] font-bold text-slate-400">Security Password</label>
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-850 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Verify Credentials
                </button>
              </form>

              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {authError}
                </div>
              )}

              <div className="text-center text-xs">
                <span className="text-slate-400 font-medium">New agronomist operator? </span>
                <button
                  onClick={() => { setFlow('register'); setAuthError(null); }}
                  className="text-[#0d631b] font-bold hover:underline cursor-pointer"
                >
                  Establish Profile
                </button>
              </div>
            </div>
          </section>
        )}

        {flow === 'register' && (
          <section id="register-section" className="py-12 px-6 max-w-lg mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Operator Registration</h3>
                <p className="text-xs text-slate-400 font-semibold">Join the unified Agribot Enterprise network</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-400 block mb-1 font-sans">Role Classification</label>
                  <select
                    value={authRole}
                    onChange={(e: any) => setAuthRole(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  >
                    <option value="Farmer font-sans">Farmer (Cultivator)</option>
                    <option value="Agriculture Expert font-sans">Agriculture Expert / Agronomist</option>
                    <option value="Admin font-sans">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Ramesh Miller"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Secure Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Set Password Code</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Farm Location Coordinates</label>
                    <input
                      type="text"
                      value={authLocation}
                      onChange={(e) => setAuthLocation(e.target.value)}
                      placeholder="e.g. Nashik, MH"
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="e.g. +91 998..."
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer mt-2"
                >
                  Create Account
                </button>
              </form>

              {authError && (
                <div className="p-3 bg-red-50 text-red-750 text-xs rounded-xl border border-red-200">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-slate-50 text-slate-700 text-xs rounded-xl border border-slate-100 text-center font-bold">
                  {authSuccess}
                </div>
              )}

              <div className="text-center text-xs">
                <span className="text-slate-400 font-medium">Already have an account? </span>
                <button
                  onClick={() => { setFlow('login'); setAuthError(null); }}
                  className="text-[#0d631b] font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            3. AUTHENTICATED WORKSPACE WITH DESKTOP LEFT SIDEBAR (Images 2, 6, 7, 8)
            --------------------------------------------------------------------- */}
        {flow === 'app' && user && token && (
          <div id="auth-app-workspace" className="flex min-h-screen bg-[#fbf9f8] text-[#1b1c1c]">
            
            {/* Desktop permanent left sidebar */}
            <aside id="agribot-desktop-sidebar" className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-slate-150 p-6 space-y-8 shrink-0 relative">
              
              {/* Sidebar Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#0d631b] text-white rounded-xl flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-sans font-black text-sm tracking-tight text-[#0d631b] leading-all">
                      AGRIBOT
                    </h2>
                    <span className="text-[9.5px] font-semibold text-slate-400 block">Precision Stewardship</span>
                  </div>
                </div>

                {/* Sidebar Navigation items list */}
                <nav className="space-y-1.5 flex flex-col pt-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold transition text-left cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-[#cbffc2]/35 text-[#0d631b]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4.5 h-4.5" />
                    Dashboard Overview
                  </button>

                  <button
                    onClick={() => setActiveTab('soil')}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold transition text-left cursor-pointer ${
                      activeTab === 'soil'
                        ? 'bg-[#cbffc2]/35 text-[#0d631b]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Wheat className="w-4.5 h-4.5" />
                    Soil & Parameters
                  </button>

                  <button
                    onClick={() => setActiveTab('disease')}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold transition text-left cursor-pointer ${
                      activeTab === 'disease'
                        ? 'bg-[#cbffc2]/35 text-[#0d631b]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Bug className="w-4.5 h-4.5" />
                    Disease Scanner
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold transition text-left cursor-pointer ${
                      activeTab === 'chat'
                        ? 'bg-[#cbffc2]/35 text-[#0d631b]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    AI Expert Chat
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold transition text-left cursor-pointer ${
                      activeTab === 'reports'
                        ? 'bg-[#cbffc2]/35 text-[#0d631b]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4.5 h-4.5" />
                    Summary Dossier
                  </button>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold transition text-left cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-[#cbffc2]/35 text-[#0d631b]'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className="w-4.5 h-4.5" />
                    Account Settings
                  </button>

                  {user.role === 'Admin' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`w-full px-3 py-2.5 text-xs rounded-xl flex items-center gap-3 font-bold tracking-tight transition text-left cursor-pointer ${
                        activeTab === 'admin'
                          ? 'bg-red-50 text-red-700'
                          : 'text-red-650 hover:bg-red-50/30'
                      }`}
                    >
                      <ShieldCheck className="w-4.5 h-4.5" />
                      System Operators
                    </button>
                  )}
                </nav>
              </div>

              {/* Sidebar Footer Details Container */}
              <div className="space-y-4">
                
                {/* Floating "New Prediction" panel trigger */}
                <button
                  onClick={() => setActiveTab('soil')}
                  className="w-full py-2.5 bg-[#0d631b] hover:bg-[#2e7d32] text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs tracking-wide shadow-xs cursor-pointer transition-all duration-200"
                >
                  <Plus className="w-4 h-4" /> New Prediction
                </button>

                {/* Avatar detailed card block */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 relative">
                  <div className="w-9 h-9 rounded-full bg-[#cbffc2] text-[#0d631b] flex items-center justify-center font-bold text-xs shrink-0 relative">
                    {user.name.substring(0,2).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div className="min-w-0 pr-2">
                    <h5 className="font-bold text-[11px] text-slate-800 truncate leading-none">
                      {user.name}
                    </h5>
                    <span className="text-[9px] text-[#0d631b] font-mono block mt-1 uppercase tracking-wide truncate">
                      {user.role === 'Admin' ? 'Admin Steward' : 'Elite steward'}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded-md hover:bg-slate-100 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </aside>

            {/* Right side Main workspace canvas block */}
            <div className="flex-1 flex flex-col min-w-0">
              
              {/* Authenticated main upper banner navigation controls */}
              <header className="bg-white border-b border-rose-50/50 py-4 px-6 flex justify-between items-center no-print">
                <div className="flex items-center gap-3">
                  {/* Title indicator of selected view */}
                  <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight capitalize font-sans">
                    {activeTab === 'dashboard' ? 'Steward Operations Control' : activeTab === 'soil' ? 'Precision Soil Matching' : activeTab === 'disease' ? 'Foliar Vision Diagnostics' : 'Unified Workspace View'}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  {/* Notifications Alert block icon with active dot */}
                  <button className="relative p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-205/30 transition cursor-pointer">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  </button>

                  {/* Profile capsule representation representing Image 3 */}
                  <div className="flex items-center gap-2">
                    <span className="hidden lg:block text-right">
                      <span className="text-xs font-bold font-sans text-slate-800 block leading-all">{user.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono block uppercase">{user.role}</span>
                    </span>
                  </div>
                </div>
              </header>

              {/* Mobile Navbar Tabs list showing up to render on touch targets */}
              <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-white border-b border-slate-100 no-print scrollbar-none">
                {[
                  { id: 'dashboard', label: 'Monitor' },
                  { id: 'soil', label: 'Nutrient' },
                  { id: 'disease', label: 'Foliar' },
                  { id: 'chat', label: 'Advisor' },
                  { id: 'reports', label: 'Dossier' },
                  { id: 'profile', label: 'Profile' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AppTab)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer transition ${
                      activeTab === item.id ? 'bg-[#0d631b] text-white' : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Central Dynamic content outlet container */}
              <div className="flex-grow p-5 sm:p-7 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                  
                  {activeTab === 'dashboard' && stats && (
                    <div className="space-y-6">
                      
                      {/* Greeting Banner */}
                      <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Welcome back, {user.name}</h3>
                          <p className="text-xs text-slate-400 font-semibold mt-0.5">Farm Location: {user.location || 'Central Fields'} • Operational Authorization: {user.role}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-[#cbffc2]/20 text-[#0d631b] text-[10px] font-mono font-bold rounded-lg border border-[#cbffc2] uppercase tracking-wider">
                          Stewardship Secure
                        </div>
                      </div>

                      {/* Main interactive charts block */}
                      <DashboardStats stats={stats} isAdmin={user.role === 'Admin'} />

                    </div>
                  )}

                  {activeTab === 'soil' && (
                    <SoilForm token={token} onRecommendationAdded={fetchUserHistories} />
                  )}

                  {activeTab === 'disease' && (
                    <DiseaseUpload token={token} onPredictionAdded={fetchUserHistories} />
                  )}

                  {activeTab === 'chat' && (
                    <ChatBot token={token} initialHistory={chatHistory} />
                  )}

                  {activeTab === 'reports' && (
                    <ReportViewer token={token} />
                  )}

                  {activeTab === 'profile' && (
                    <div id="settings-profile-container" className="max-w-xl mx-auto bg-white p-7 rounded-2xl border border-slate-100 shadow-xs">
                      <div className="flex gap-2.5 items-center mb-6 pb-2 border-b border-slate-100">
                        <Sliders className="w-5 h-5 text-[#0d631b]" />
                        <h4 className="text-base font-bold text-slate-800">Account Configuration</h4>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Operator Profile Name</label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none focus:border-brand-600"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Farming Location</label>
                          <input
                            type="text"
                            value={profileLocation}
                            onChange={(e) => setProfileLocation(e.target.value)}
                            className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none focus:border-brand-600"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Active Contact phone</label>
                          <input
                            type="text"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none focus:border-brand-600"
                          />
                        </div>

                        <div>
                          <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Update Security Code (Optional)</label>
                          <input
                            type="password"
                            value={profilePassword}
                            onChange={(e) => setProfilePassword(e.target.value)}
                            placeholder="Leave blank to maintain current password"
                            className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none focus:border-brand-600"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full mt-2 py-3 bg-[#0d631b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Process Updates
                        </button>
                      </form>

                      {profileStatus && (
                        <div className={`mt-4 p-3 text-xs rounded-xl border font-bold ${
                          profileStatus.type === 'success' ? 'bg-[#cbffc2]/10 text-[#0d631b] border-[#cbffc2]/40' : 'bg-red-50 text-red-750 border-red-100'
                        }`}>
                          {profileStatus.text}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'admin' && user?.role === 'Admin' && (
                    <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                      <div className="flex gap-2.5 items-center mb-2 pb-2 border-b border-slate-50">
                        <UserCheck className="w-5 h-5 text-[#0d631b]" />
                        <h4 className="text-base font-bold text-slate-800">Master Operations Command</h4>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                              <th className="p-3 text-slate-400 font-bold uppercase tracking-wider">Operator ID</th>
                              <th className="p-3 text-slate-400 font-bold uppercase">Name</th>
                              <th className="p-3 text-slate-400 font-bold uppercase">Email Coordinates</th>
                              <th className="p-3 text-slate-400 font-bold uppercase">Role Classification</th>
                              <th className="p-3 text-slate-400 font-bold uppercase">Location</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                            {adminUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-slate-50/40">
                                <td className="p-3 font-mono font-bold text-[11px] text-slate-400">{u.id}</td>
                                <td className="p-3 font-bold text-slate-800">{u.name}</td>
                                <td className="p-3 text-slate-500 font-medium font-sans">{u.email}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.role === 'Admin' ? 'bg-[#cbffc2]/30 text-[#0d631b]' :
                                    u.role === 'Agriculture Expert' ? 'bg-orange-50 text-orange-850' : 
                                    'bg-slate-100 text-slate-650'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-3 font-medium font-sans">{u.location || 'Global Field'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ---------------------------------------------------------------------
          UNAUTHENTICATED FOOTER REDESIGN (Screenshot 4 multi-columns)
          --------------------------------------------------------------------- */}
      {flow !== 'app' && (
        <footer className="bg-[#1b1c1c] text-[#fbf9f8] pt-16 pb-8 border-t border-slate-800 no-print">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Column 1 - Brand description */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0d631b] rounded-lg flex items-center justify-center text-white">
                  <Sprout className="w-4.5 h-4.5" />
                </div>
                <span className="font-sans font-black text-sm tracking-tight text-[#fbf9f8]">AGRIBOT</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Precision AI for a sustainable agricultural future. Empowering the hands that feed the world.
              </p>
            </div>

            {/* Column 2 - Links Product */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-bold text-xs uppercase text-slate-350 tracking-wider">Product</h5>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="hover:text-white transition cursor-pointer">Crop Recommendations</li>
                <li className="hover:text-white transition cursor-pointer">Disease Detection</li>
                <li className="hover:text-white transition cursor-pointer">AI Assistant</li>
                <li className="hover:text-white transition cursor-pointer">Market Pricing</li>
              </ul>
            </div>

            {/* Column 3 - Links Company */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-bold text-xs uppercase text-slate-350 tracking-wider">Company</h5>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="hover:text-white transition cursor-pointer">About Us</li>
                <li className="hover:text-white transition cursor-pointer">Case Studies</li>
                <li className="hover:text-white transition cursor-pointer">Sustainability</li>
                <li className="hover:text-white transition cursor-pointer">Contact</li>
              </ul>
            </div>

            {/* Column 4 - Newsletter Input */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-bold text-xs uppercase text-slate-350 tracking-wider">Newsletter</h5>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                Get the latest agri-tech insights delivered to your inbox.
              </p>
              
              <div className="flex gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-transparent text-xs text-white placeholder-slate-500 pl-2 focus:outline-none w-full"
                />
                <button className="p-2 bg-[#0d631b] text-white rounded-lg hover:bg-[#2e7d32] transition cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Underlay bottom bar row */}
          <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10.5px] text-slate-500 gap-3">
            <span>&copy; 2026 AGRIBOT AI. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
              <span className="hover:text-white transition cursor-pointer">Cookie Settings</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
