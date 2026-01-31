
import React, { useState } from 'react';
import { X, Settings, Database, Trash2, ShieldAlert, Save, Building, Info, RefreshCw, Users } from 'lucide-react';
import { Role, User } from '../types';

interface SettingsModalProps {
  onClose: () => void;
  systemName: string;
  user: User;
  onUpdateSystemName: (newName: string) => void;
  onResetData: (type: 'EQUIPMENT' | 'ALL') => void;
  onOpenUsers: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, systemName, user, onUpdateSystemName, onResetData, onOpenUsers }) => {
  const [tempName, setTempName] = useState(systemName);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    onUpdateSystemName(tempName);
    alert('تم تحديث هوية النظام بنجاح');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-6 font-['Cairo']">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-white/20">
        
        <div className="px-12 py-10 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-500/30">
              <Settings size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black">إعدادات النظام</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">تخصيص الهوية المركزية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={32} /></button>
        </div>

        <div className="p-12 space-y-10 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-500 uppercase mr-3 flex items-center gap-2">
              <Building size={16} className="text-blue-500" /> اسم المستودع الظاهر
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="flex-1 px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-blue-600 outline-none font-black text-slate-800 text-lg shadow-inner bg-slate-50/50"
              />
              <button 
                onClick={handleSaveName}
                className="p-5 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl active:scale-95"
              >
                <Save size={24} />
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* خيار إدارة المستخدمين الجديد داخل الإعدادات */}
          {user.role === Role.ADMIN && (
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase mr-3 flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> إدارة الصلاحيات
              </label>
              <button 
                onClick={() => { onClose(); onOpenUsers(); }}
                className="w-full flex items-center justify-between p-6 bg-blue-50 border-2 border-blue-100 rounded-[2rem] hover:bg-blue-100 transition-all group"
              >
                <div className="flex items-center gap-4 text-right">
                  <Users size={24} className="text-blue-600" />
                  <div>
                    <span className="block text-sm font-black text-blue-900">فتح إدارة المستخدمين</span>
                    <span className="text-[10px] text-blue-500 font-bold italic">إضافة حسابات، تغيير كلمات المرور، وتعديل الأقسام</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="space-y-6">
            <label className="block text-xs font-black text-slate-500 uppercase mr-3 flex items-center gap-2">
              <Database size={16} className="text-amber-500" /> إدارة البيانات
            </label>
            
            <div className="grid grid-cols-1 gap-4 text-right">
              <button 
                onClick={() => { if(confirm('هل أنت متأكد من مسح كافة سجلات المعدات فقط؟')) onResetData('EQUIPMENT'); }}
                className="w-full flex items-center justify-between p-6 bg-amber-50 border-2 border-amber-100 rounded-[2rem] hover:bg-amber-100 transition-all group text-right"
              >
                <div className="flex items-center gap-4">
                  <RefreshCw size={24} className="text-amber-600" />
                  <div>
                    <span className="block text-sm font-black text-amber-900">تفريغ قائمة المعدات</span>
                    <span className="text-[10px] text-amber-500 font-bold">حذف المعدات والسجلات مع بقاء المستخدمين</span>
                  </div>
                </div>
              </button>

              {!confirmDelete ? (
                <button 
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-between p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] hover:bg-red-100 transition-all group text-right"
                >
                  <div className="flex items-center gap-4">
                    <Trash2 size={24} className="text-red-600" />
                    <div>
                      <span className="block text-sm font-black text-red-900">تصفير النظام بالكامل</span>
                      <span className="text-[10px] text-red-500 font-bold">حذف كافة البيانات نهائياً</span>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="p-8 bg-red-600 rounded-[2.5rem] text-white space-y-5 animate-in shake duration-300">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={24} />
                    <p className="text-sm font-black text-right">تنبيه: سيتم مسح كل شيء!</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { onResetData('ALL'); setConfirmDelete(false); }} className="flex-1 py-4 bg-white text-red-600 font-black rounded-2xl text-xs shadow-lg">تأكيد الحذف</button>
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 py-4 bg-red-800 text-white font-black rounded-2xl text-xs">إلغاء</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center gap-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
             <div className="p-4 bg-white/5 rounded-2xl">
               <Info size={32} className="text-blue-400" />
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إصدار النظام</p>
               <p className="text-xl font-black">FAO CMMS PRO v3.1</p>
             </div>
          </div>

        </div>

        <div className="px-12 py-8 bg-slate-50 border-t flex justify-center">
          <button onClick={onClose} className="px-20 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl">خروج وحفظ</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
