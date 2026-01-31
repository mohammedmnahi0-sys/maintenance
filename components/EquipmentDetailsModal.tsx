
import React, { useState } from 'react';
import { Equipment, MaintenanceStatus, Role, User as UserType, Criticality } from '../types';
import { X, Calendar, Clock, Activity, FileText, History, User, CheckCircle2, Image as ImageIcon, ExternalLink, Upload, Edit3, Trash2, MapPin, QrCode, ShieldAlert, Info, Printer } from 'lucide-react';
import { STATUS_COLORS, STATUS_TEXT } from '../constants';

interface EquipmentDetailsModalProps {
  equipment: Equipment;
  onClose: () => void;
  user: UserType;
  onUpdateEquipment: (id: string, updates: Partial<Equipment>) => void;
}

const EquipmentDetailsModal: React.FC<EquipmentDetailsModalProps> = ({ equipment, onClose, user, onUpdateEquipment }) => {
  const [isUploading, setIsUploading] = useState(false);
  const canEdit = user.role === Role.ADMIN || user.role === Role.MANAGER;

  const handleViewProcedure = () => {
    if (equipment.procedureFile) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${equipment.procedureFile}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // توليد رابط QR بسيط (يمكن تغييره لرابط النظام الحقيقي)
    const qrData = `FAO-EQUIP-${equipment.id}-${equipment.serialNumber}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طباعة ملصق - ${equipment.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
          body { font-family: 'Cairo', sans-serif; margin: 0; padding: 20px; background: white; }
          .sticker {
            width: 100mm;
            height: 60mm;
            border: 2px solid black;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          .header {
            border-bottom: 2px solid black;
            padding-bottom: 5px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header h1 { font-size: 14px; margin: 0; font-weight: 900; }
          .header p { font-size: 8px; margin: 0; font-weight: bold; }
          .main-info { display: flex; gap: 10px; flex: 1; }
          .details { flex: 1; }
          .details h2 { font-size: 18px; margin: 0 0 5px 0; font-weight: 900; color: black; }
          .details p { font-size: 10px; margin: 2px 0; font-weight: 700; }
          .qr-box { width: 80px; height: 80px; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; }
          .qr-box img { width: 100%; height: 100%; }
          .footer {
            margin-top: 10px;
            padding-top: 5px;
            border-top: 1px dashed black;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-weight: bold;
          }
          @media print {
            body { padding: 0; }
            .sticker { border: 2px solid black; }
          }
        </style>
      </head>
      <body>
        <div class="sticker">
          <div class="header">
            <div>
              <h1>مستودع الفاو - شركة خطوط الأنابيب</h1>
              <p>نظام إدارة الصيانة الوقائية (CMMS)</p>
            </div>
            <div style="text-align: left">
              <p>بطاقة تعريف أصول</p>
            </div>
          </div>
          <div class="main-info">
            <div class="details">
              <h2>${equipment.name}</h2>
              <p>الرقم التسلسلي: ${equipment.serialNumber}</p>
              <p>الموقع: ${equipment.location || 'غير محدد'}</p>
              <p>القسم: ${equipment.departments.join(' | ')}</p>
              <p>تاريخ الصيانة: ${equipment.lastMaintenanceDate}</p>
            </div>
            <div class="qr-box">
              <img src="${qrImageUrl}" alt="QR Code" />
            </div>
          </div>
          <div class="footer">
            <span>تاريخ الاستحقاق: ${equipment.nextMaintenanceDate}</span>
            <span>ID: ${equipment.id}</span>
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onUpdateEquipment(equipment.id, { procedureFile: ev.target.result as string });
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProcedure = () => {
    if (window.confirm('هل أنت متأكد من حذف إجراءات الصيانة؟')) {
      onUpdateEquipment(equipment.id, { procedureFile: undefined });
    }
  };

  const getCriticalityBadge = (level: Criticality) => {
    switch(level) {
      case Criticality.HIGH: return 'bg-red-600 text-white';
      case Criticality.MEDIUM: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getCriticalityText = (level: Criticality) => {
    switch(level) {
      case Criticality.HIGH: return 'أهمية قصوى (حرج)';
      case Criticality.MEDIUM: return 'أهمية متوسطة';
      default: return 'أهمية عادية';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="px-10 py-8 bg-slate-50 border-b flex items-start justify-between sticky top-0 z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900">{equipment.name}</h2>
              <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase shadow-lg ${STATUS_COLORS[equipment.status]}`}>
                {STATUS_TEXT[equipment.status]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
               <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500" /> {equipment.location || 'غير محدد'}</span>
               <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
               <span className="flex items-center gap-1.5 text-slate-500">S/N: {equipment.serialNumber}</span>
               <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
               <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-black text-[10px] ${getCriticalityBadge(equipment.criticality)}`}>
                 <ShieldAlert size={12} /> {getCriticalityText(equipment.criticality)}
               </span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          
          {/* Equipment Description Section */}
          <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
             <div className="flex items-center gap-3 mb-3 text-blue-600">
                <Info size={20} />
                <h4 className="font-black text-sm uppercase">وصف المعدة والمهام</h4>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed font-bold">
               {equipment.description || 'لم يتم إدخال وصف تفصيلي لهذه المعدة بعد.'}
             </p>
          </div>

          {/* Identity & QR Printing */}
          <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl">
             <div className="bg-white p-4 rounded-[2rem] shadow-xl shrink-0 group cursor-pointer hover:scale-105 transition-transform flex flex-col items-center">
                <div className="bg-slate-50 p-2 rounded-xl mb-2">
                   <QrCode size={100} className="text-slate-900" />
                </div>
                <p className="text-[9px] text-center font-black text-slate-400 uppercase tracking-widest">توليد QR ذكي</p>
             </div>
             <div className="space-y-4">
                <h4 className="text-xl font-black">ملصق التعريف الميداني</h4>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                  يمكنك طباعة ملصق التعريف الميداني الخاص بهذه المعدة. يحتوي الملصق على كافة المعلومات الأساسية ورمز استجابة سريعة للوصول السريع من الهواتف الذكية.
                </p>
                <button 
                  onClick={handlePrintLabel}
                  className="w-full px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                >
                  <Printer size={20} /> طباعة ملصق التعريف الآن
                </button>
             </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
              <Calendar className="text-blue-600 mb-3" size={24} />
              <p className="text-[9px] text-slate-400 font-black uppercase">آخر صيانة</p>
              <p className="text-sm font-black text-slate-800 mt-1">{equipment.lastMaintenanceDate}</p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
              <Clock className="text-amber-600 mb-3" size={24} />
              <p className="text-[9px] text-slate-400 font-black uppercase">الصيانة القادمة</p>
              <p className="text-sm font-black text-slate-800 mt-1">{equipment.nextMaintenanceDate}</p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
              <History className="text-purple-600 mb-3" size={24} />
              <p className="text-[9px] text-slate-400 font-black uppercase">الدورة</p>
              <p className="text-sm font-black text-slate-800 mt-1">{equipment.maintenanceIntervalDays} يوم</p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
              <Activity className="text-green-600 mb-3" size={24} />
              <p className="text-[9px] text-slate-400 font-black uppercase">العداد</p>
              <p className="text-sm font-black text-slate-800 mt-1">{equipment.currentHours} h</p>
            </div>
          </div>

          {/* Procedures */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <FileText className="text-blue-600" size={24} /> الوثائق والإرشادات الفنية
            </h3>

            {equipment.procedureFile ? (
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-blue-500 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg">دليل الصيانة الوقائية</p>
                    <p className="text-xs text-slate-400 font-bold italic mt-1">المخطط الفني وإجراءات السلامة</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={handleViewProcedure} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl">
                      <ExternalLink size={20} />
                   </button>
                   {canEdit && (
                     <button onClick={removeProcedure} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={20} />
                     </button>
                   )}
                </div>
              </div>
            ) : (
              <div className="p-10 border-4 border-dashed border-slate-50 rounded-[3rem] text-center flex flex-col items-center gap-4">
                <ShieldAlert size={40} className="text-slate-300" />
                <p className="text-lg font-black text-slate-400">لا يوجد دليل مرفق</p>
                {canEdit && (
                  <button onClick={() => setIsUploading(true)} className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Upload size={18} /> ارفق الدليل الآن
                  </button>
                )}
              </div>
            )}
          </div>

          {/* History */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
              <History className="text-purple-600" size={24} /> السجل التاريخي للأعمال
            </h3>
            
            <div className="relative space-y-6 before:absolute before:inset-y-0 before:right-6 before:w-1 before:bg-slate-50">
              {equipment.logs.length > 0 ? (
                equipment.logs.map((log) => (
                  <div key={log.id} className="relative pr-16">
                    <div className={`absolute right-0 top-0 w-12 h-12 rounded-[1.25rem] border-4 border-white shadow-xl flex items-center justify-center z-10 ${log.type === 'EMERGENCY' ? 'bg-red-500' : 'bg-green-500'}`}>
                      <CheckCircle2 size={24} className="text-white" />
                    </div>
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.type === 'EMERGENCY' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                             {log.type === 'EMERGENCY' ? 'طارئ' : 'دوري'}
                           </span>
                           <span className="text-base font-black text-slate-900">{log.date}</span>
                        </div>
                        <div className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl">
                          بواسطة: {log.performedBy}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium mb-4">{log.description}</p>
                      
                      {log.photos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {log.photos.map((photo, i) => (
                            <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-md">
                              <img src={photo} className="w-full h-full object-cover" alt="سجل صيانة" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pr-16 py-10 text-center italic font-bold text-slate-400">
                  لم يتم تسجيل أي أعمال صيانة لهذه المعدة بعد.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailsModal;
