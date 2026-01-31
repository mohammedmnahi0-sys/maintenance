
import React, { useState } from 'react';
import { Department, Equipment, MaintenanceStatus, Role, User, Criticality } from '../types';
import { X, Save, Clock, Activity, Calendar, FileText, Upload, Sparkles, ChevronDown, ShieldAlert, MapPin, Info, CheckSquare, Square, FileCheck, AlertCircle, Timer } from 'lucide-react';
import { OIL_FIELD_STANDARDS, EquipmentStandard } from '../services/standardDatabase';

interface AddEquipmentModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (equipment: Omit<Equipment, 'id' | 'status' | 'logs'>) => void;
}

const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ user, onClose, onSubmit }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    departments: user.role === Role.ADMIN ? [] : [user.department] as Department[],
    criticality: Criticality.MEDIUM,
    maintenanceIntervalDays: 30,
    maintenanceThresholdHours: 500,
    currentHours: 0,
    lastMaintenanceDate: '',
    location: '',
    procedureFile: '' as string
  });

  const handleProcedureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormData({ ...formData, procedureFile: ev.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const applyStandard = (standard: EquipmentStandard) => {
    setFormData({
      ...formData,
      name: standard.type.includes('غير ذلك') ? '' : standard.type,
      description: standard.description,
      maintenanceIntervalDays: standard.suggestedDays,
      maintenanceThresholdHours: standard.suggestedHours,
      criticality: standard.criticality,
      departments: user.role === Role.ADMIN ? [standard.defaultDept] : formData.departments
    });
    setShowSuggestions(false);
  };

  const toggleDepartment = (dept: Department) => {
    setFormData(prev => {
      const exists = prev.departments.includes(dept);
      if (exists) {
        return { ...prev, departments: prev.departments.filter(d => d !== dept) };
      } else {
        return { ...prev, departments: [...prev.departments, dept] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.departments.length === 0) {
      alert('يرجى اختيار قسم واحد على الأقل مسؤول عن المعدة');
      return;
    }
    
    let nextDate = 'N/A';
    if (formData.lastMaintenanceDate) {
      const lastDate = new Date(formData.lastMaintenanceDate);
      if (!isNaN(lastDate.getTime())) {
        const nextDateObj = new Date(lastDate);
        nextDateObj.setDate(nextDateObj.getDate() + (formData.maintenanceIntervalDays || 0));
        nextDate = nextDateObj.toISOString().split('T')[0];
      }
    }
    
    const { procedureFile, ...rest } = formData;

    onSubmit({
      ...rest,
      name: formData.name || 'معدة غير مسماة',
      serialNumber: formData.serialNumber || 'بدون رقم تسلسلي',
      procedureFile: procedureFile || undefined,
      nextMaintenanceDate: nextDate,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 font-['Cairo']">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-10 py-8 bg-slate-900 text-white flex items-center justify-between relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-right">إضافة معدة جديدة</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">نظام الإدخال الذكي لجميع الأقسام</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto custom-scrollbar text-right">
          
          {/* Smart Suggestions */}
          <div className="relative">
            <label className="block text-xs font-black text-slate-500 uppercase mb-3 mr-2">اختيار معيار صيانة جاهز (اختياري)</label>
            <button 
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] hover:border-blue-400 transition-all text-right group"
            >
              <span className={`font-black ${formData.name ? 'text-blue-600' : 'text-slate-400'}`}>
                {formData.name || 'اختر نوع المعدة لملء المعايير تلقائياً...'}
              </span>
              <ChevronDown size={20} className={`text-slate-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
            </button>

            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-[60] max-h-64 overflow-y-auto p-2 grid grid-cols-1 md:grid-cols-2 gap-2 animate-in slide-in-from-top-2">
                {OIL_FIELD_STANDARDS.map((std) => (
                  <button
                    key={std.type}
                    type="button"
                    onClick={() => applyStandard(std)}
                    className="flex flex-col items-start p-4 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 text-right"
                  >
                    <span className="font-black text-sm text-slate-800">{std.type}</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1">{std.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2 uppercase">الاسم / TAG الميداني</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-500 outline-none font-bold bg-white"
                placeholder="P-101-A"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2 uppercase">الرقم التسلسلي (Serial No.)</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-500 outline-none font-bold bg-white"
              />
            </div>

            {/* Added Description Textarea */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2 uppercase flex items-center gap-2">
                <Info size={14} className="text-blue-500" /> وصف المعدة والمهام الفنية
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-500 outline-none font-bold bg-white h-24 resize-none"
                placeholder="أدخل وصفاً تفصيلياً للمعدة ومهامها هنا..."
              ></textarea>
            </div>
          </div>

          {/* New Section: Maintenance Interval Settings */}
          <div className="bg-amber-50 p-6 rounded-[2rem] border-2 border-amber-100 space-y-4 shadow-sm">
             <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Timer size={18} />
                <h4 className="font-black text-sm">تحديد دورة الصيانة الدورية (جدولة ذكية)</h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="block text-[11px] font-black text-amber-700 mr-2 flex items-center gap-2">
                   <Calendar size={14} /> الدورة الزمنية (عدد الأيام)
                 </label>
                 <input
                   type="number"
                   required
                   min="1"
                   value={formData.maintenanceIntervalDays}
                   onChange={(e) => setFormData({ ...formData, maintenanceIntervalDays: parseInt(e.target.value) || 0 })}
                   className="w-full px-6 py-3 rounded-xl border-2 border-white focus:border-amber-500 outline-none font-black text-slate-800"
                   placeholder="مثلاً: 30 يوم"
                 />
                 <p className="text-[9px] text-amber-500 font-bold mr-2">عدد الأيام بين كل صيانتين متتاليتين.</p>
               </div>

               <div className="space-y-2">
                 <label className="block text-[11px] font-black text-amber-700 mr-2 flex items-center gap-2">
                   <Activity size={14} /> حد ساعات التشغيل
                 </label>
                 <input
                   type="number"
                   required
                   min="0"
                   value={formData.maintenanceThresholdHours}
                   onChange={(e) => setFormData({ ...formData, maintenanceThresholdHours: parseInt(e.target.value) || 0 })}
                   className="w-full px-6 py-3 rounded-xl border-2 border-white focus:border-amber-500 outline-none font-black text-slate-800"
                   placeholder="مثلاً: 500 ساعة"
                 />
                 <p className="text-[9px] text-amber-500 font-bold mr-2">تستحق الصيانة عند وصول العداد لهذا الرقم.</p>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2 uppercase flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" /> تاريخ آخر صيانة منجزة
              </label>
              <input
                type="date"
                value={formData.lastMaintenanceDate}
                onChange={(e) => setFormData({ ...formData, lastMaintenanceDate: e.target.value })}
                className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-500 outline-none font-bold"
              />
              {!formData.lastMaintenanceDate && (
                <div className="flex items-center gap-2 text-indigo-600 px-2 mt-1">
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black italic">سيتم تصنيفها كـ "بيانات ناقصة" لعدم وجود تاريخ</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 mr-2 flex items-center gap-2">
                <MapPin size={14} className="text-blue-500" /> الموقع الميداني الدقيق
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-500 outline-none font-bold"
                placeholder="محطة الضخ 4 - المنطقة الجنوبية"
              />
            </div>
          </div>

          {/* Departments Multi-Select */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 mr-2 uppercase flex items-center gap-2">
              <CheckSquare size={14} className="text-blue-500" /> الأقسام الفنية المسؤولة
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-[1.5rem] border-2 border-slate-100">
              {Object.values(Department).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-right text-[11px] font-bold ${
                    formData.departments.includes(dept) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  {formData.departments.includes(dept) ? <CheckSquare size={16} /> : <Square size={16} />}
                  <span>{dept}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 mr-2 uppercase flex items-center gap-2">
              <FileCheck size={14} className="text-blue-600" /> إرفاق ملف الإجراءات الفنية
            </label>
            <div className="relative group">
               <input type="file" id="procedure-upload" className="hidden" accept=".pdf,image/*" onChange={handleProcedureUpload} />
               <label htmlFor="procedure-upload" className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer ${formData.procedureFile ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'}`}>
                 <div className="flex items-center gap-3 text-right">
                   {formData.procedureFile ? <FileCheck size={20} /> : <Upload size={20} />}
                   <span className="font-bold text-sm">{formData.procedureFile ? 'تم إرفاق الملف بنجاح' : 'اختر ملف الإرشادات (PDF أو صور)'}</span>
                 </div>
               </label>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30 text-lg">
              <Save size={24} /> حفظ المعدة في النظام
            </button>
            <button type="button" onClick={onClose} className="px-10 py-5 bg-slate-100 text-slate-600 font-black rounded-[1.5rem] hover:bg-slate-200 transition-all">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentModal;
