
import React, { useState } from 'react';
import { Department, Equipment, Role, User, Criticality, MaintenanceStatus } from '../types';
import { X, Save, Clock, Activity, Calendar, Tag, MapPin, Info, CheckSquare, Square, ShieldAlert, AlertCircle, Timer } from 'lucide-react';

interface EditEquipmentModalProps {
  equipment: Equipment;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Equipment>) => void;
  user: User;
}

const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({ equipment, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    name: equipment.name,
    description: equipment.description || '',
    serialNumber: equipment.serialNumber,
    departments: equipment.departments || [],
    maintenanceIntervalDays: equipment.maintenanceIntervalDays || 30,
    maintenanceThresholdHours: equipment.maintenanceThresholdHours || 500,
    currentHours: equipment.currentHours || 0,
    lastMaintenanceDate: equipment.lastMaintenanceDate || '',
    location: equipment.location || '',
    procedureFile: equipment.procedureFile || '',
    criticality: equipment.criticality || Criticality.MEDIUM
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let nextDate = 'N/A';
    if (formData.lastMaintenanceDate) {
      const lastDate = new Date(formData.lastMaintenanceDate);
      if (!isNaN(lastDate.getTime())) {
        const nextDateObj = new Date(lastDate);
        nextDateObj.setDate(nextDateObj.getDate() + (Number(formData.maintenanceIntervalDays) || 30));
        nextDate = nextDateObj.toISOString().split('T')[0];
      }
    }

    onSubmit(equipment.id, {
      ...formData,
      nextMaintenanceDate: nextDate,
      maintenanceIntervalDays: Number(formData.maintenanceIntervalDays),
      maintenanceThresholdHours: Number(formData.maintenanceThresholdHours),
      currentHours: Number(formData.currentHours)
    });
    onClose();
  };

  const toggleDepartment = (dept: Department) => {
    setFormData(prev => {
      const exists = prev.departments.includes(dept);
      if (exists) return { ...prev, departments: prev.departments.filter(d => d !== dept) };
      return { ...prev, departments: [...prev.departments, dept] };
    });
  };

  const isUnknown = equipment.status === MaintenanceStatus.UNKNOWN;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 font-['Cairo']">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        
        <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between border-b-4 border-amber-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-2xl">
              <Tag size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black">تعديل بيانات وجدولة المعدة</h3>
              <p className="text-[10px] text-amber-200 font-bold uppercase mt-1 tracking-widest">تحديث المعايير والدورة الزمنية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar text-right">
          
          {isUnknown && (
            <div className="bg-indigo-50 border-2 border-indigo-100 p-4 rounded-2xl flex items-start gap-4 animate-pulse">
               <AlertCircle className="text-indigo-600 shrink-0" size={24} />
               <p className="text-[11px] font-black text-indigo-900 leading-relaxed">يرجى استكمال البيانات (تاريخ الصيانة والدورة الزمنية) لتتمكن الجدولة التلقائية من حساب الحالة.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2">اسم المعدة</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 outline-none font-bold bg-slate-50/50" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2">الرقم التسلسلي</label>
              <input required type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 outline-none font-bold bg-slate-50/50" />
            </div>

            <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 space-y-4 shadow-inner">
              <div className="flex items-center gap-2 text-slate-900 mb-2">
                <Timer size={18} className="text-amber-500" />
                <h4 className="font-black text-sm">إعدادات الجدولة الدورية</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-500 mr-2">دورة الصيانة (كل كم يوم؟)</label>
                  <input type="number" required min="1" value={formData.maintenanceIntervalDays} onChange={(e) => setFormData({ ...formData, maintenanceIntervalDays: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3 rounded-xl border-2 border-white focus:border-amber-500 outline-none font-black text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-500 mr-2">حد ساعات التشغيل</label>
                  <input type="number" required min="0" value={formData.maintenanceThresholdHours} onChange={(e) => setFormData({ ...formData, maintenanceThresholdHours: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3 rounded-xl border-2 border-white focus:border-amber-500 outline-none font-black text-slate-800" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2 flex items-center gap-2 text-indigo-600"><Calendar size={14} /> تاريخ آخر صيانة منجزة</label>
              <input type="date" value={formData.lastMaintenanceDate} onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })} className={`w-full px-5 py-3.5 rounded-2xl border-2 outline-none font-bold ${isUnknown ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 focus:border-amber-500'}`} />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2">عداد الساعات الحالي</label>
              <input type="number" value={formData.currentHours} onChange={(e) => setFormData({ ...formData, currentHours: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 outline-none font-bold" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 mr-2 uppercase">الأقسام المسؤولة</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
              {Object.values(Department).map((dept) => (
                <button key={dept} type="button" onClick={() => toggleDepartment(dept)} className={`flex items-center gap-3 p-3 rounded-xl transition-all text-right text-[11px] font-bold ${formData.departments.includes(dept) ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-100'}`}>
                  {formData.departments.includes(dept) ? <CheckSquare size={16} /> : <Square size={16} />}
                  <span>{dept}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg"><Save size={24} /> حفظ التغييرات</button>
            <button type="button" onClick={onClose} className="px-10 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEquipmentModal;
