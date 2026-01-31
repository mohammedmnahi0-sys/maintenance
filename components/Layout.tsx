
import React, { useState, useEffect } from 'react';
import { User, Role, Department } from '../types';
import { LogOut, LayoutDashboard, Shield, Zap, Wrench, Microscope, HardHat, Building2, ChevronLeft, Snowflake, UserCog, Settings, RefreshCcw, Wifi, Droplets, Construction, Wind, Radio } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  activeDept: Department | 'ALL';
  setActiveDept: (dept: Department | 'ALL') => void;
  isSyncing?: boolean;
  onOpenSettings: () => void;
  systemName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeDept, setActiveDept, isSyncing = false, onOpenSettings, systemName }) => {
  const departments = Object.values(Department);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const getDeptIcon = (dept: string) => {
    if (dept.includes('كهرباء')) return <Zap size={18} />;
    if (dept.includes('ميكانيك')) return <Wrench size={18} />;
    if (dept.includes('آلات')) return <Microscope size={18} />;
    if (dept.includes('سلامة')) return <Shield size={18} />;
    if (dept.includes('كاثودية')) return <Radio size={18} />;
    if (dept.includes('مدنية')) return <Construction size={18} />;
    if (dept.includes('تبريد')) return <Wind size={18} />;
    if (dept.includes('تشغيل')) return <Droplets size={18} />;
    return <Building2 size={18} />;
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-['Cairo'] text-right">
      <aside className="w-80 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-slate-800 flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{systemName.split(' ')[0]} {systemName.split(' ')[1] || ''}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">نظام الصيانة الذكي</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 custom-scrollbar">
          {user.role === Role.ADMIN && (
            <button
              onClick={() => setActiveDept('ALL')}
              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${
                activeDept === 'ALL' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={20} />
                <span className="font-black text-sm">إدارة المستودع العامة</span>
              </div>
              {activeDept === 'ALL' && <ChevronLeft size={16} />}
            </button>
          )}

          <div className="pt-8 pb-3 text-[10px] font-black text-slate-600 uppercase px-5 tracking-widest">الأقسام الفنية المتوفرة</div>

          <div className="space-y-1">
            {departments.map((dept) => {
              // تقييد رؤية الأقسام: الأدمن يرى الكل، مدير القسم يرى قسمه فقط
              const canView = user.role === Role.ADMIN || user.department === dept;
              if (!canView) return null;

              return (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm transition-all ${
                    activeDept === dept ? 'bg-slate-800 text-blue-400 border-r-4 border-blue-400' : 'hover:bg-slate-800/30 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getDeptIcon(dept)}
                    <span className="truncate font-bold">{dept}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-6 bg-slate-950/40 border-t border-slate-800/50">
          <div className="flex items-center gap-4 mb-5 bg-slate-900 p-3 rounded-2xl border border-white/5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg ${user.role === Role.ADMIN ? 'bg-red-600' : 'bg-blue-600'}`}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-black text-xs border border-red-500/20">
            <LogOut size={16} /> خروج آمن
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-10 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
               <Building2 size={22} />
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-900">{activeDept === 'ALL' ? 'التحكم المركزي' : activeDept}</h2>
                <span className="flex items-center gap-1 text-[10px] font-black text-green-600">
                  <Wifi size={10} /> {online ? 'النظام متصل حالياً' : 'وضع العمل بدون إنترنت'}
                </span>
             </div>
          </div>
          <button onClick={onOpenSettings} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Settings size={20} /></button>
        </header>
        <div className="p-10 max-w-[1600px] mx-auto w-full">{children}</div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Layout;
