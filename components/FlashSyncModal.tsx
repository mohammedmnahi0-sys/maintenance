
import React, { useState, useRef } from 'react';
import { Equipment, User, MaintenanceLog, Role, Department } from '../types';
import { X, Usb, Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, FileWarning, ArrowRightLeft, Image as ImageIcon, FileText, Share2 } from 'lucide-react';

interface FlashSyncModalProps {
  equipment: Equipment[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSyncComplete: (newEquipment: Equipment[], newUsers: User[]) => void;
}

interface SyncFileData {
  version: string;
  timestamp: string;
  source: {
    name: string;
    role: Role;
    department: Department;
  };
  equipment: Equipment[];
  users: User[];
}

const FlashSyncModal: React.FC<FlashSyncModalProps> = ({ equipment, users, currentUser, onClose, onSyncComplete }) => {
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'PREVIEW' | 'IMPORTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [incomingFile, setIncomingFile] = useState<SyncFileData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({ addedLogs: 0, updatedEq: 0, filteredOut: 0, attachmentCount: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // حساب إجمالي المرفقات للتأكيد المرئي
  const countAttachments = (eqList: Equipment[]) => {
    let photos = 0;
    let docs = 0;
    eqList.forEach(eq => {
      if (eq.procedureFile) docs++;
      eq.logs.forEach(log => {
        photos += (log.photos?.length || 0);
      });
    });
    return { photos, docs };
  };

  // تصدير البيانات مع الهوية والمرفقات الكاملة
  const handleExport = () => {
    const { photos, docs } = countAttachments(equipment);
    
    const syncData: SyncFileData = {
      version: '2.5-FULL-BUNDLE',
      timestamp: new Date().toISOString(),
      source: {
        name: currentUser.name,
        role: currentUser.role,
        department: currentUser.department
      },
      equipment, // تحتوي تلقائياً على Base64 للصور والتقارير
      users
    };

    const blob = new Blob([JSON.stringify(syncData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FAO_FULL_SYNC_${currentUser.department.split(' ')[1]}_${new Date().toISOString().split('T')[0]}.fao`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`تم بنجاح تصدير البيانات مع المرفقات:\n- عدد الصور: ${photos}\n- تقارير الإجراءات: ${docs}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as SyncFileData;
        
        if (!data.source || !data.equipment) throw new Error('تنسيق الملف غير مدعوم أو تالف');

        const isSourceAdmin = data.source.role === Role.ADMIN;
        const isCurrentAdmin = currentUser.role === Role.ADMIN;
        const isSameDept = data.source.department === currentUser.department;

        if (!isCurrentAdmin && !isSourceAdmin && !isSameDept) {
          setErrorMessage(`بيانات غير مطابقة! أنت في ${currentUser.department} والملف قادم من ${data.source.department}. لا يمكن نقل البيانات بين الأقسام إلا عن طريق الإدارة.`);
          setSyncStatus('ERROR');
          return;
        }

        setIncomingFile(data);
        setSyncStatus('PREVIEW');
      } catch (err) {
        setErrorMessage('فشل في تحليل الحزمة. تأكد من أن الملف بصيغة .fao الأصلية.');
        setSyncStatus('ERROR');
      }
    };
    reader.readAsText(file);
  };

  const executeSync = () => {
    if (!incomingFile) return;

    setSyncStatus('IMPORTING');
    
    setTimeout(() => {
      let updatedCount = 0;
      let logsCount = 0;
      let filtered = 0;
      let newAttachments = 0;

      const isCurrentAdmin = currentUser.role === Role.ADMIN;

      const filteredIncomingEq = incomingFile.equipment.filter(ie => {
        if (isCurrentAdmin) return true;
        const match = ie.department === currentUser.department;
        if (!match) filtered++;
        return match;
      });

      const mergedEquipment = [...equipment].map(localEq => {
        if (!isCurrentAdmin && localEq.department !== currentUser.department) return localEq;

        const incomingEq = filteredIncomingEq.find(ie => ie.id === localEq.id);
        if (incomingEq) {
          const localLogIds = new Set(localEq.logs.map(l => l.id));
          const newLogs = incomingEq.logs.filter(il => !localLogIds.has(il.id));
          
          const hasNewReport = incomingEq.procedureFile && incomingEq.procedureFile !== localEq.procedureFile;
          
          if (newLogs.length > 0 || incomingEq.lastUpdated > localEq.lastUpdated || hasNewReport) {
            updatedCount++;
            logsCount += newLogs.length;
            if (hasNewReport) newAttachments++;

            return {
              ...incomingEq,
              // دمج السجلات مع الحفاظ على كافة الصور بداخلها
              logs: [...newLogs, ...localEq.logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            };
          }
        }
        return localEq;
      });

      const localEqIds = new Set(equipment.map(e => e.id));
      const brandNewEq = filteredIncomingEq.filter(ie => !localEqIds.has(ie.id));
      const finalEquipment = [...mergedEquipment, ...brandNewEq];

      let finalUsers = users;
      if (isCurrentAdmin) {
        const localUserIds = new Set(users.map(u => u.id));
        const newUsers = incomingFile.users.filter(iu => !localUserIds.has(iu.id));
        finalUsers = [...users, ...newUsers];
      }

      setStats({ 
        addedLogs: logsCount, 
        updatedEq: updatedCount + brandNewEq.length, 
        filteredOut: filtered,
        attachmentCount: newAttachments + brandNewEq.filter(b => !!b.procedureFile).length
      });
      
      onSyncComplete(finalEquipment, finalUsers);
      setSyncStatus('SUCCESS');
    }, 1500);
  };

  const incomingStats = incomingFile ? countAttachments(incomingFile.equipment) : { photos: 0, docs: 0 };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 font-['Cairo']">
      <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-500 border border-white/20">
        
        {/* Header */}
        <div className="px-12 py-10 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
          <div className="flex items-center gap-6 z-10">
            <div className="p-4 bg-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-500/40 animate-pulse">
              <Usb size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight">النقل الشامل</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest flex items-center gap-2">
                <Share2 size={12} className="text-blue-400" /> دمج الصور والتقارير والبيانات
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all z-10 text-slate-400 hover:text-white"><X size={28} /></button>
        </div>

        <div className="p-12">
          {syncStatus === 'IDLE' && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button 
                  onClick={handleExport}
                  className="group relative flex flex-col items-center gap-5 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Download size={36} />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-slate-900 text-xl">تصدير كامل</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase mt-1 block">تغليف البيانات + الصور + الملفات</span>
                  </div>
                </button>

                <label className="group relative flex flex-col items-center gap-5 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                  <input type="file" ref={fileInputRef} className="hidden" accept=".fao" onChange={handleFileSelect} />
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Upload size={36} />
                  </div>
                  <div className="text-center">
                    <span className="block font-black text-slate-900 text-xl">استيراد ودمج</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase mt-1 block">فك التغليف وتحديث المرفقات</span>
                  </div>
                </label>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                 <div className="flex items-center gap-3 text-blue-600">
                    <ShieldCheck size={20} />
                    <span className="font-black text-sm">بروتوكول الأمان v2.5</span>
                 </div>
                 <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                   سيتم تحويل كافة الصور والتقارير المرفقة إلى بيانات نصية مشفرة داخل ملف المزامنة. 
                   هذه العملية تضمن عدم ضياع أي وثيقة فنية عند الانتقال بين أجهزة الأقسام المختلفة.
                 </p>
              </div>
            </div>
          )}

          {syncStatus === 'PREVIEW' && incomingFile && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6">
               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Usb size={120} />
                  </div>
                  <h4 className="text-[10px] font-black text-blue-400 uppercase mb-8 tracking-[0.2em]">تحليل حزمة البيانات الواردة</h4>
                  
                  <div className="flex items-center gap-8 mb-10">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl ${incomingFile.source.role === Role.ADMIN ? 'bg-red-600' : 'bg-blue-600'}`}>
                      <ShieldCheck size={48} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-black">{incomingFile.source.name}</p>
                      <p className="text-sm font-bold text-slate-400">{incomingFile.source.department}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/10">
                        <ImageIcon className="text-blue-400" size={24} />
                        <div>
                           <span className="block text-[10px] font-black text-slate-500 uppercase">صور فوتوغرافية</span>
                           <span className="text-xl font-black">{incomingStats.photos} صورة</span>
                        </div>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 border border-white/10">
                        <FileText className="text-purple-400" size={24} />
                        <div>
                           <span className="block text-[10px] font-black text-slate-500 uppercase">تقارير وإجراءات</span>
                           <span className="text-xl font-black">{incomingStats.docs} ملف</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                 <button onClick={executeSync} className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3">
                   <CheckCircle2 size={24} /> دمج المحتويات بالكامل
                 </button>
                 <button onClick={() => setSyncStatus('IDLE')} className="px-10 py-5 bg-slate-100 text-slate-600 font-black rounded-[1.5rem] hover:bg-slate-200 transition-all">إلغاء</button>
               </div>
            </div>
          )}

          {syncStatus === 'IMPORTING' && (
            <div className="py-20 flex flex-col items-center justify-center gap-8">
              <div className="relative">
                <RefreshCw size={80} className="text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Share2 size={32} className="text-blue-400" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-black text-slate-900">جاري استخراج ودمج المرفقات...</h4>
                <p className="text-sm text-slate-500 font-bold mt-2 italic">يتم الآن نقل الصور والملفات الإلكترونية إلى قاعدة البيانات المحلية</p>
              </div>
            </div>
          )}

          {syncStatus === 'SUCCESS' && (
            <div className="py-10 flex flex-col items-center justify-center gap-8 animate-in zoom-in">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                <CheckCircle2 size={48} />
              </div>
              <div className="text-center space-y-6">
                <h4 className="text-3xl font-black text-slate-900">نجح النقل المتكامل!</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <span className="block text-[10px] text-blue-400 font-black uppercase">سجلات</span>
                    <span className="text-xl font-black text-blue-700">+{stats.addedLogs}</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <span className="block text-[10px] text-green-400 font-black uppercase">معدات</span>
                    <span className="text-xl font-black text-green-700">{stats.updatedEq}</span>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <span className="block text-[10px] text-purple-400 font-black uppercase">مرفقات</span>
                    <span className="text-xl font-black text-purple-700">+{stats.attachmentCount}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-black uppercase">تم فلترتها</span>
                    <span className="text-xl font-black text-slate-600">{stats.filteredOut}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="px-16 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-2xl">العودة للوحة التحكم</button>
            </div>
          )}

          {syncStatus === 'ERROR' && (
            <div className="py-10 flex flex-col items-center text-center gap-8 animate-in shake">
              <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-xl">
                <FileWarning size={48} />
              </div>
              <div className="space-y-3 max-w-sm">
                <h4 className="text-2xl font-black text-slate-900">خطأ في توافق الحزمة</h4>
                <p className="text-sm text-red-500 font-bold leading-relaxed">{errorMessage}</p>
              </div>
              <button onClick={() => setSyncStatus('IDLE')} className="px-16 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all">محاولة استيراد أخرى</button>
            </div>
          )}
        </div>

        <div className="px-12 py-8 bg-amber-50 border-t border-amber-100 flex items-start gap-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <p className="text-[11px] text-amber-700 font-black leading-relaxed">
            تحذير: ملفات المزامنة الشاملة قد تكون كبيرة الحجم (حسب عدد الصور). تأكد من عدم إزالة الفلاش ميزة أثناء عملية الاستيراد أو التصدير لتجنب تلف ملفات المرفقات.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashSyncModal;
