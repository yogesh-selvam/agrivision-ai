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
  Globe2,
  HeartHandshake
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
      // Parallel histories fetching
      const [cropRes, diseaseRes, chatRes, statsRes] = await Promise.all([
        fetch('/api/crop/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/disease/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/chat/history', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const crops = await cropRes.json();
      const diseases = await diseaseRes.json();
      const chats = await chatRes.json();
      const analytics = await statsRes.json();

      if (cropRes.ok) setCropHistory(crops);
      if (diseaseRes.ok) setDiseaseHistory(diseases);
      if (chatRes.ok) setChatHistory(chats);
      if (statsRes.ok) setStats(analytics);

      // If Admin, also load registered users for the audit control tab
      if (user?.role === 'Admin') {
        const usersRes = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        const usersList = await usersRes.json();
        if (usersRes.ok) setAdminUsers(usersList);
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

      // Save to localStorage
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
      
      // Auto-login registered account after 1.5 seconds
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

  // Profile editor
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
      
      // Refresh statistics & logs list
      fetchUserHistories();
    } catch (err: any) {
      setProfileStatus({ type: 'error', text: err.message || 'Connecting configuration channels failed.' });
    }
  };

  // Instant password reset simulation
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    // Real endpoint triggered in BG
    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail })
    }).catch(err => console.error(err));
  };

  // Populate pre-seeded credential helpers for instant UI demonstration
  const loadDemoCredentials = (role: 'Farmer' | 'Expert' | 'Admin') => {
    setAuthError(null);
    if (role === 'Admin') {
      setAuthEmail('admin@agribot.com');
      setAuthPassword('Password123');
    } else if (role === 'Expert') {
      setAuthEmail('expert@agribot.com');
      setAuthPassword('Password123');
    } else {
      // First, register a demo farmer if not already present, or simply enter farmer credentials.
      // We will sign them up with quick register or mock login. We'll use the expert template for instant login.
      setAuthEmail('farmer_demo@agribot.com');
      setAuthPassword('Password123');
      // If we attempt direct login, but they are not registered, we pre-fill register form.
      setAuthEmail('admin@agribot.com'); // Admin is guaranteed to exist
      setAuthPassword('Password123');
      
      // Let's make preseeds: Expert or Admin are guaranteed pre-seeded!
      // Let's use expert@agribot.com as agricultural expert, or admin@agribot.com as Admin.
      // For farmer, they can easily create an account or use admin@agribot.com (since admin can do EVERYTHING).
      // Let's offer exact expert details:
      setAuthEmail('expert@agribot.com');
      setAuthPassword('Password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FBFA] flex flex-col justify-between font-sans">
      
      {/* Universal header navigation */}
      <header className="bg-[#1B4332] text-white border-b border-[#2D6A4F]/20 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFlow(token ? 'app' : 'landing')}>
            <div className="w-9 h-9 bg-[#2D6A4F] rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm tracking-wider flex items-center gap-1.5 leading-none">
                AGRIBOT
                <span className="text-[8px] font-mono font-bold tracking-wider bg-brand-700 text-brand-100 px-1 py-0.5 rounded">ENT</span>
              </h1>
              <span className="text-[9px] font-mono tracking-widest text-emerald-350 block mt-1">Enterprise Agricultural AI Core</span>
            </div>
          </div>

          <nav id="top-nav-bar" className="flex items-center gap-4 text-xs font-bold">
            {flow === 'app' && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="font-bold block text-emerald-50">{user.name}</span>
                  <span className="px-1.5 py-0.5 bg-[#2D6A4F] font-bold text-[8px] font-mono text-white rounded uppercase tracking-wider mt-0.5 inline-block">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-[#2D6A4F]/65 hover:bg-[#2D6A4F] text-white rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {flow === 'landing' && (
                  <>
                    <button
                      onClick={() => { setFlow('login'); setAuthError(null); }}
                      className="px-3.5 py-1.5 text-emerald-100 font-bold hover:text-white transition cursor-pointer"
                    >
                      Authenticate
                    </button>
                    <button
                      onClick={() => { setFlow('register'); setAuthError(null); }}
                      className="px-4 py-1.5 bg-[#2D6A4F] hover:bg-white hover:text-[#1B4332] text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Establish Account
                    </button>
                  </>
                )}
                {flow !== 'landing' && (
                  <button
                    onClick={() => setFlow('landing')}
                    className="px-3 py-1.5 text-emerald-100 font-bold hover:text-white transition cursor-pointer"
                  >
                    Return Home
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-grow">

        {/* ---------------------------------------------------------------------
            FLOW 1: LANDING CANVAS
            --------------------------------------------------------------------- */}
        {flow === 'landing' && (
          <section id="landing-hero" className="py-16 px-6 space-y-16 max-w-7xl mx-auto">
            
            {/* Main spotlight hero */}
            <div className="text-center space-y-6">
              <span className="px-3 py-1 bg-brand-50 text-brand-700 font-bold font-mono tracking-widest text-[9px] rounded-full uppercase border border-brand-100">
                🌱 Future of Farming Intelligence
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-[#081C15] max-w-3xl mx-auto leading-tight">
                Empowering Agri-Enterprises with Generative Intelligence & Pathology Analytics
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
                Agribot integrates chemical soil modeling, high-performance leaf lesion vision, and expert multi-language advisor chatbots into a unified enterprise operations hub.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                <button
                  onClick={() => setFlow('register')}
                  className="px-6 py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  Create Agricultural Profile <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setFlow('login'); loadDemoCredentials('Expert'); handleLogin(); }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  Demonstration Access (Expert)
                </button>
              </div>
            </div>

            {/* Platform Core pillars */}
            <div id="features-grid" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-150/40 shadow-xs space-y-4 hover:border-brand-200 transition-all">
                <div className="w-10 h-10 bg-brand-50 text-[#1B4332] rounded-xl flex items-center justify-center">
                  <Wheat className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-800">Nutrient Soil Matching</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Evaluate soil Phosphorus, Nitrogen, and moisture content with optimized decision mapping logic to determine ideal seed selection compatibility.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-150/40 shadow-xs space-y-4 hover:border-brand-200 transition-all">
                <div className="w-10 h-10 bg-red-50 text-red-650 rounded-xl flex items-center justify-center">
                  <Bug className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-800">Foliar Pathology Vision</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Identify leaf infections, blight, mildew, and common plant rusts instantly. Receive full treatment dosages and preventative schedules.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white p-8 rounded-3xl border border-slate-150/40 shadow-xs space-y-4 hover:border-brand-200 transition-all">
                <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-slate-800">Multilingual AI Expert</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Obtain professional agronomic consulting in English, Tamil, Hindi, and Kannada. Conversations are persisted for historic review.
                </p>
              </div>

            </div>

            {/* Testimonials or bottom highlight block */}
            <div className="max-w-4xl mx-auto bg-[#1B4332] text-white p-8 rounded-3xl border border-none shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h4 className="text-base font-bold font-display text-white">Need immediate validation with zero photo uploads?</h4>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed max-w-lg">
                  Access the staging sandbox instantly. Our system includes ready profiles and foliar leaf pathogen samples for complete diagnostics exploration.
                </p>
              </div>
              <button
                onClick={() => setFlow('login')}
                className="px-5 py-2.5 bg-[#2D6A4F] hover:bg-white hover:text-[#1B4332] text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition"
              >
                Access Portal
              </button>
            </div>

          </section>
        )}

        {/* ---------------------------------------------------------------------
            FLOW 2: LOGIN SECURITY PORTAL
            --------------------------------------------------------------------- */}
        {flow === 'login' && (
          <section id="login-section" className="py-16 px-6 max-w-md mx-auto space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold font-display text-slate-800">Authenticate Operator</h3>
                <p className="text-xs text-slate-400 font-medium">Identify through enterprise ag-network coordinates</p>
              </div>

              {/* Demo accounts quick fill buttons */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <span className="text-[9px] font-mono tracking-wider font-bold text-slate-400 uppercase block">Staging Quick-Connect Codes</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setAuthEmail('admin@agribot.com'); setAuthPassword('Password123'); }}
                    className="px-2 py-1.5 bg-white text-slate-705 hover:bg-slate-50 border border-slate-150 text-[10px] font-mono font-bold rounded-lg truncate cursor-pointer transition"
                  >
                    Admin Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthEmail('expert@agribot.com'); setAuthPassword('Password123'); }}
                    className="px-2 py-1.5 bg-white text-slate-705 hover:bg-slate-50 border border-slate-150 text-[10px] font-mono font-bold rounded-lg truncate cursor-pointer transition"
                  >
                    Expert Account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthEmail('demo_farmer@agribot.com'); setAuthPassword('Password123'); }}
                    className="px-2 py-1.5 bg-white text-slate-705 hover:bg-slate-50 border border-slate-150 text-[10px] font-mono font-bold rounded-lg truncate cursor-pointer transition"
                  >
                    Demo Farmer
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="operator@agribot.com"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-705">Security Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotSent(false)}
                      className="text-[10px] text-[#2D6A4F] font-bold hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" /> Verify Credentials
                </button>
              </form>

              {authError && (
                <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-100 font-medium font-sans">
                  {authError}
                </div>
              )}

              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium font-sans">New operator? </span>
                <button
                  onClick={() => { setFlow('register'); setAuthError(null); }}
                  className="text-xs text-[#2D6A4F] font-bold hover:underline cursor-pointer"
                >
                  Establish Profile Account
                </button>
              </div>
            </div>

            {/* Custom password retrieval form visual block */}
            {forgotSent !== undefined && (
              <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs text-xs space-y-3">
                <span className="font-semibold block text-emerald-950">Staged Password Recovery Simulator</span>
                <form onSubmit={handleForgotSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter email to simulate check"
                    className="flex-1 text-xs p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-emerald-950 focus:outline-none"
                  />
                  <button type="submit" className="px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-100 text-[11px] rounded-lg cursor-pointer">
                    Simulate
                  </button>
                </form>
                {forgotSent && (
                  <p className="text-[10px] text-emerald-850 font-mono">
                    Recovery simulation complete. The dispatch request was monitored. Check Activity Logs!
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------------------------------
            FLOW 3: PROFILE REGISTRATION
            --------------------------------------------------------------------- */}
        {flow === 'register' && (
          <section id="register-section" className="py-12 px-6 max-w-md mx-auto">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-bold font-display text-slate-800">Operator Registration</h3>
                <p className="text-xs text-slate-400 font-medium">Establish credential access inside the Agribot core</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Operator Role</label>
                  <select
                    value={authRole}
                    onChange={(e: any) => setAuthRole(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  >
                    <option value="Farmer">Farmer (Cultivator)</option>
                    <option value="Agriculture Expert">Agriculture Expert / Agronomist</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Secure Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="username@domain.com"
                    className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-705 block mb-1">Security Entry Code (Password)</label>
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
                    <label className="text-[11px] font-bold text-slate-705 block mb-1">Farm Location</label>
                    <input
                      type="text"
                      value={authLocation}
                      onChange={(e) => setAuthLocation(e.target.value)}
                      placeholder="e.g. Nashik, MH"
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-705 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="e.g. +91 9876..."
                      className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Open Enterprise Account
                </button>
              </form>

              {authError && (
                <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-100 font-semibold">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-slate-50 text-slate-750 text-xs rounded-xl border border-slate-100 font-semibold text-center">
                  {authSuccess}
                </div>
              )}

              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium">Already registered? </span>
                <button
                  onClick={() => { setFlow('login'); setAuthError(null); }}
                  className="text-xs text-[#2D6A4F] font-semibold font-sans hover:underline cursor-pointer"
                >
                  Verify Credentials
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------------
            FLOW 4: FULL APP DASHBOARD CORE
            --------------------------------------------------------------------- */}
        {flow === 'app' && user && token && (
          <section id="app-workspace" className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            
            {/* Dashboard Tabs bar */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 no-print">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'dashboard'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Farmer Dashboard
              </button>

              <button
                onClick={() => setActiveTab('soil')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'soil'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Wheat className="w-4 h-4" />
                Crop Recommendation
              </button>

              <button
                onClick={() => setActiveTab('disease')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'disease'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Bug className="w-4 h-4" />
                Disease Vision Scanner
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'chat'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                AI Agriculture Chatbot
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'reports'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Summary PDF Reports
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'profile'
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Profile Update
              </button>

              {user.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition ${
                    activeTab === 'admin'
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'text-brand-800 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Command Panel
                </button>
              )}
            </div>

            {/* TAB RENDERING SEGMENTS */}
            <div id="tab-outlet">

              {/* TAB 1: Farmers telemetry dashboard overview */}
              {activeTab === 'dashboard' && stats && (
                <div id="tab-dashboard-view" className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white rounded-3xl border border-slate-100 shadow-xs gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-display text-slate-800">Welcome Back, {user.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">Farm Location: {user.location || 'Local Fields'} • Role Privilege: {user.role}</p>
                    </div>
                    <div className="flex gap-2 items-center text-[10px] font-mono font-bold text-[#1B4332] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full"></span>
                      <span>OPERATIONS ENCRYPTED</span>
                    </div>
                  </div>

                  {/* Render the telemetry charts */}
                  <DashboardStats stats={stats} isAdmin={user.role === 'Admin'} />
                </div>
              )}

              {/* TAB 2: Soil crop matching advisor */}
              {activeTab === 'soil' && (
                <div id="tab-soil-view">
                  <SoilForm token={token} onRecommendationAdded={fetchUserHistories} />
                </div>
              )}

              {/* TAB 3: Foliar plant pathology vision */}
              {activeTab === 'disease' && (
                <div id="tab-disease-view">
                  <DiseaseUpload token={token} onPredictionAdded={fetchUserHistories} />
                </div>
              )}

              {/* TAB 4: Agronomist advisor chatbot */}
              {activeTab === 'chat' && (
                <div id="tab-chat-view">
                  <ChatBot token={token} initialHistory={chatHistory} />
                </div>
              )}

              {/* TAB 5: PDF Reports generation */}
              {activeTab === 'reports' && (
                <div id="tab-reports-view">
                  <ReportViewer token={token} />
                </div>
              )}

              {/* TAB 6: Profile & Account Settings */}
              {activeTab === 'profile' && (
                <div id="tab-profile-view" className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-xs">
                  <div className="flex gap-2 items-center mb-6 pb-2 border-b border-slate-100">
                    <Sliders className="w-5 h-5 text-[#1B4332]" />
                    <h4 className="text-lg font-bold font-display text-slate-800">Profile Settings</h4>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Profile Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-705 block mb-1">Registered Coordinates (Location)</label>
                      <input
                        type="text"
                        value={profileLocation}
                        onChange={(e) => setProfileLocation(e.target.value)}
                        placeholder="e.g. Nashik, MH"
                        className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-705 block mb-1">Active Phone</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. +91 9988..."
                        className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-705 block mb-1">Reset Entry Password (Optional)</label>
                      <input
                        type="password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        placeholder="Leave blank to maintain current password code"
                        className="w-full text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-800 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Process Updates
                    </button>
                  </form>

                  {profileStatus && (
                    <div className={`mt-4 p-3 text-xs rounded-xl border font-bold ${
                      profileStatus.type === 'success' ? 'bg-slate-50 text-[#1B4332] border-slate-100' : 'bg-red-50 text-red-750 border-red-100'
                    }`}>
                      {profileStatus.text}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: Admin Panel list views */}
              {activeTab === 'admin' && user?.role === 'Admin' && (
                <div id="tab-admin-view" className="space-y-6">
                  
                  {/* Users audit table */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                    <div className="flex gap-2 items-center">
                      <UserCheck className="w-5 h-5 text-[#1B4332]" />
                      <h4 className="text-lg font-bold font-display text-slate-800">System Operators Master Catalog</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-150 bg-slate-50">
                            <th className="p-3 text-slate-700 font-mono uppercase tracking-wider">ID Code</th>
                            <th className="p-3 text-slate-700 font-mono uppercase tracking-wider">Full Name</th>
                            <th className="p-3 text-slate-700 font-mono uppercase tracking-wider">Email Coordinates</th>
                            <th className="p-3 text-slate-700 font-mono uppercase tracking-wider">Access Role</th>
                            <th className="p-3 text-slate-700 font-mono uppercase tracking-wider">Location</th>
                            <th className="p-3 text-slate-700 font-mono uppercase tracking-wider font-bold">Registered</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/40 font-mono text-slate-800">
                              <td className="p-3 font-bold">{u.id}</td>
                              <td className="p-3 font-bold font-sans">{u.name}</td>
                              <td className="p-3">{u.email}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  u.role === 'Admin' ? 'bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/25' :
                                  u.role === 'Agriculture Expert' ? 'bg-amber-50 text-amber-700 border border-amber-250' :
                                  'bg-slate-50 text-slate-700 border border-slate-100'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3 font-sans">{u.location || 'N/A'}</td>
                              <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </section>
        )}

      </main>

      {/* Footer copyright space with printable hidden constraints */}
      <footer className="bg-[#1B4332] text-slate-100 py-6 text-center text-xs font-mono border-t border-[#2D6A4F]/20 leading-relaxed no-print">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>&copy; 2026 AGRIBOT INC COOPERATIVE. ALL RIGHTS SAFEGUARDED FOR GLOBAL FARMERS.</span>
          <span className="flex items-center gap-1">
            <Globe2 className="w-4 h-4 text-emerald-350" />
            V3.5.0 Production-Ready Build
          </span>
        </div>
      </footer>

    </div>
  );
}
