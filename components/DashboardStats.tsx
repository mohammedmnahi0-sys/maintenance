
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Equipment, MaintenanceStatus, Criticality } from '../types';
import { ShieldCheck, AlertCircle, Activity, Target, HelpCircle } from 'lucide-react';

interface DashboardStatsProps {
  equipment: Equipment[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ equipment }) => {
  const statusCounts = {
    [MaintenanceStatus.GREEN]: equipment.filter(e => e.status === MaintenanceStatus.GREEN).length,
    [MaintenanceStatus.YELLOW]: equipment.filter(e => e.status === MaintenanceStatus.YELLOW).length,
    [MaintenanceStatus.RED]: equipment.filter(e => e.status === MaintenanceStatus.RED).length,
    [MaintenanceStatus.UNKNOWN]: equipment.filter(e => e.status === MaintenanceStatus.UNKNOWN).length,
  };

  const criticalOverdue = equipment.filter(e => e.status === MaintenanceStatus.RED && e.criticality === Criticality.HIGH).length;
  
  const totalRelevant = equipment.length;
  const compliant = statusCounts[MaintenanceStatus.GREEN];
  const complianceScore = totalRelevant > 0 ? Math.round((compliant / totalRelevant) * 100) : 100;

  const pieData = [
    { name: 'حالة جيدة', value: statusCounts[MaintenanceStatus.GREEN], color: '#22c55e' },
    { name: 'قيد الاستحقاق', value: statusCounts[MaintenanceStatus.YELLOW], color: '#eab308' },
    { name: 'صيانة فورية', value: statusCounts[MaintenanceStatus.RED], color: '#ef4444' },
    { name: 'بيانات ناقصة', value: statusCounts[MaintenanceStatus.UNKNOWN], color: '#4f46e5' }, // Indigo-600
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Compliance Score Gauge */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
           <ShieldCheck size={140} />
        </div>
        <div className="relative z-10 text-center">
          <Target className="mx-auto mb-2 text-blue-200" size={24} />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">مؤشر الكفاءة العام</p>
          <div className="text-5xl font-black mt-2">{complianceScore}%</div>
          <p className="text-[10px] mt-4 font-bold bg-white/20 px-4 py-1.5 rounded-full inline-block">تغطية الصيانة للمستودع</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div className="p-2 bg-green-50 text-green-600 rounded-xl"><Activity size={20} /></div>
             {statusCounts[MaintenanceStatus.RED] > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
           </div>
           <div>
             <p className="text-3xl font-black text-slate-900">{statusCounts[MaintenanceStatus.GREEN]}</p>
             <p className="text-[10px] font-black text-slate-400 uppercase mt-1">معدات بكامل الكفاءة</p>
           </div>
        </div>

        <div className={`p-6 rounded-[2rem] shadow-sm border transition-all flex flex-col justify-between ${statusCounts[MaintenanceStatus.UNKNOWN] > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
           <div className="flex justify-between items-start">
             <div className={`p-2 rounded-xl ${statusCounts[MaintenanceStatus.UNKNOWN] > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}><HelpCircle size={20} /></div>
           </div>
           <div>
             <p className={`text-3xl font-black ${statusCounts[MaintenanceStatus.UNKNOWN] > 0 ? 'text-indigo-600' : 'text-slate-900'}`}>{statusCounts[MaintenanceStatus.UNKNOWN]}</p>
             <p className="text-[10px] font-black text-slate-400 uppercase mt-1">معدات ببيانات ناقصة</p>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black">
                {statusCounts[MaintenanceStatus.RED]}
              </div>
              <div>
                <p className="font-black text-slate-800">تجاوزت الاستحقاق</p>
                <p className="text-[10px] text-slate-400 font-bold">معدات تحتاج صيانة فورية الآن</p>
              </div>
            </div>
            <div className="text-right">
               <span className="text-xs font-black text-red-600 px-3 py-1 bg-red-50 rounded-lg">إجراء عاجل</span>
            </div>
        </div>
      </div>

      {/* Chart View */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 self-start">توزع الأصول</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', direction: 'rtl' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
