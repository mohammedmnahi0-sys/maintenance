
import React, { useState } from 'react';
import { Equipment, MaintenanceLog, MaintenanceStatus, Role, User } from '../types';
import { X, Upload, FileText, Camera, ExternalLink, Calendar } from 'lucide-react';

interface MaintenanceModalProps {
  equipment: Equipment;
  onClose: () => void;
  onSubmit: (log: Omit<MaintenanceLog, 'id'>) => void;
  user: User;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ equipment, onClose, onSubmit, user }) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [type, setType] = useState<'SCHEDULED' | 'EMERGENCY'>('SCHEDULED');
  const [maintenanceDate, setMaintenanceDate] = useState(new Date().toISOString().split('T')[0]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setPhotos(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleViewProcedure = () => {
    if (equipment.procedureFile) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${equipment.procedureFile}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: maintenanceDate,
      description,
      performedBy: user.name, // التثبيت التلقائي لاسم المستخدم الحالي
      photos,
      type
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">سجل صيانة جديد</h3>
            <p className="text-xs text-slate-500">{equipment.name} - {equipment.serialNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Current Performer Info */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500">القائم بالصيانة حالياً:</span>
            <span className="text-sm font-black text-blue-600">{user.name}</span>
          </div>

          {/* Maintenance Procedure Link */}
          {equipment.procedureFile && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800">إجراءات صيانة المعدة</p>
                  <p className="text-xs text-blue-600">تأكد من مراجعة الإرشادات قبل البدء</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleViewProcedure}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={14} />
                عرض الإجراءات
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">نوع الصيانة المنفذة</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setType('SCHEDULED')}
                  className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                    type === 'SCHEDULED' ? 'border-blue-500 bg-blue-50' : 'border-slate-100'
                  }`}
                >
                  <div className="font-bold text-slate-800 text-sm">صيانة دورية</div>
                </div>
                <div 
                  onClick={() => setType('EMERGENCY')}
                  className={`cursor-pointer p-4 border-2 rounded-xl transition-all ${
                    type === 'EMERGENCY' ? 'border-red-500 bg-red-50' : 'border-slate-100'
                  }`}
                >
                  <div className="font-bold text-slate-800 text-sm">عطل طارئ</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">تاريخ إجراء الصيانة</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="date"
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">وصف العمل المنجز</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm"
              placeholder="اكتب تفاصيل الصيانة هنا..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">إرفاق صور العمل المنجز</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors text-slate-400">
                <Upload size={24} className="mb-1" />
                <span className="text-[10px] font-bold">رفع صور</span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              
              {photos.map((p, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative group">
                  <img src={p} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t flex gap-3">
          <button 
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            حفظ السجل وتحديث حالة المعدة
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal;
