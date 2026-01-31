
import React, { useState, useMemo } from 'react';
import { Equipment, Department, Role, User } from '../types';
import { X, FileSpreadsheet, Download, CheckSquare, Square, Calendar, Filter, FileText, Loader2, AlertTriangle, Eye, Table as TableIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  equipment: Equipment[];
  user: User;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ equipment, user, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<'MONTH' | 'YEAR' | 'CUSTOM'>('MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>(user.role === Role.ADMIN ? 'ALL' : user.department);
  const [showPreview, setShowPreview] = useState(true);
  
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'name', 'serialNumber', 'lastMaintenanceDate', 'performedBy', 'description', 'type'
  ]);

  const fields = [
    { id: 'name', label: 'اسم المعدة' },
    { id: 'serialNumber', label: 'الرقم التسلسلي' },
    { id: 'location', label: 'الموقع الميداني' },
    { id: 'lastMaintenanceDate', label: 'تاريخ الصيانة' },
    { id: 'type', label: 'نوع الصيانة' },
    { id: 'performedBy', label: 'المنفذ للعمل' },
    { id: 'description', label: 'تفاصيل الإجراء' },
    { id: 'nextMaintenanceDate', label: 'الاستحقاق القادم' }
  ];

  // احتساب البيانات التي سيتم تصديرها بناءً على الفلاتر المختارة (للمعاينة والتصدير)
  const reportData = useMemo(() => {
    const data: any[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    equipment.forEach(eq => {
      // فلترة القسم
      if (selectedDept !== 'ALL' && !eq.departments.includes(selectedDept as Department)) return;

      eq.logs.forEach(log => {
        const logDate = new Date(log.date);
        let include = false;

        if (reportType === 'MONTH') {
          include = logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        } else if (reportType === 'YEAR') {
          include = logDate.getFullYear() === currentYear;
        } else if (reportType === 'CUSTOM') {
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            include = logDate >= start && logDate <= end;
          }
        }

        if (include) {
          const row: any = {};
          if (selectedFields.includes('name')) row['اسم المعدة'] = eq.name;
          if (selectedFields.includes('serialNumber')) row['الرقم التسلسلي'] = eq.serialNumber;
          if (selectedFields.includes('location')) row['الموقع'] = eq.location || 'غير محدد';
          if (selectedFields.includes('lastMaintenanceDate')) row['تاريخ الصيانة'] = log.date;
          if (selectedFields.includes('type')) row['النوع'] = log.type === 'EMERGENCY' ? 'طارئة' : 'دورية';
          if (selectedFields.includes('performedBy')) row['المنفذ'] = log.performedBy;
          if (selectedFields.includes('description')) row['التفاصيل المنجزة'] = log.description;
          if (selectedFields.includes('nextMaintenanceDate')) row['الاستحقاق القادم'] = eq.nextMaintenanceDate;
          
          data.push(row);
        }
      });
    });
    return data;
  }, [equipment, selectedDept, reportType, startDate, endDate, selectedFields]);

  const toggleField = (id: string) => {
    setSelectedFields(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const generateExcel = async () => {
    if (reportData.length === 0) {
      alert('تنبيه: لا توجد سجلات صيانة منجزة ضمن النطاق المختار للمعالجة.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // 1. إنشاء ورقة العمل من البيانات المحسوبة
      const ws = XLSX.utils.json_to_sheet(reportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Maintenance Report");

      // 2. توليد السلسلة الثنائية
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

      // 3. تحويلها إلى Blob
      const blob = new Blob([s2ab(wbout)], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `FAO_Report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // 4. آلية التنزيل القوية
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      onClose();
    } catch (error) {
      console.error('Export Error:', error);
      alert('حدث خطأ فني. تأكد من السماح بالتحميلات التلقائية في متصفحك.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 font-['Cairo']">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300 border-4 border-white">
        
        {/* Header */}
        <div className="px-10 py-6 bg-green-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black">مركز التقارير والاستخراج</h3>
              <p className="text-xs text-green-100 font-bold uppercase mt-1">تصدير سجلات الصيانة الميدانية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Settings Side */}
          <div className="w-full md:w-80 bg-slate-50 border-l p-8 overflow-y-auto space-y-8 custom-scrollbar text-right">
            
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                <Calendar size={14} className="text-green-600" /> الفترة الزمنية
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'MONTH', label: 'الشهر الحالي' },
                  { id: 'YEAR', label: 'السنة الحالية' },
                  { id: 'CUSTOM', label: 'فترة مخصصة' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setReportType(t.id as any)}
                    className={`w-full py-3 px-4 rounded-xl font-black text-[11px] transition-all text-right ${
                      reportType === t.id ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              
              {reportType === 'CUSTOM' && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 mr-2">من:</span>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2.5 rounded-lg border-2 border-slate-200 font-bold text-xs outline-none focus:border-green-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 mr-2">إلى:</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2.5 rounded-lg border-2 border-slate-200 font-bold text-xs outline-none focus:border-green-500" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                <Filter size={14} className="text-green-600" /> فلترة القسم
              </label>
              <select 
                disabled={user.role !== Role.ADMIN}
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white font-black text-xs outline-none focus:border-green-500"
              >
                {user.role === Role.ADMIN && <option value="ALL">جميع الأقسام</option>}
                {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                <FileText size={14} className="text-green-600" /> الأعمدة المطلوبة
              </label>
              <div className="grid grid-cols-1 gap-2">
                {fields.map(field => (
                  <button
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                      selectedFields.includes(field.id) 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-white border-slate-200 text-slate-300'
                    }`}
                  >
                    {selectedFields.includes(field.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                    <span className="font-black text-[10px]">{field.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-10 overflow-hidden flex flex-col bg-white">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3 text-slate-800">
                  <TableIcon className="text-green-600" size={24} />
                  <h4 className="text-lg font-black italic">معاينة البيانات (Preview)</h4>
               </div>
               <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-500">
                     إجمالي السجلات: {reportData.length}
                  </div>
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-2 text-slate-400 hover:text-green-600 transition-all"
                    title="تبديل عرض المعاينة"
                  >
                    <Eye size={20} />
                  </button>
               </div>
            </div>

            <div className="flex-1 border-2 border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50 relative group">
              {reportData.length > 0 ? (
                <div className="absolute inset-0 overflow-auto custom-scrollbar">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-900 text-white z-10">
                      <tr>
                        {selectedFields.map(fid => {
                          const f = fields.find(field => field.id === fid);
                          return <th key={fid} className="p-4 font-black whitespace-nowrap">{f?.label}</th>
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="bg-white hover:bg-green-50 transition-colors">
                          {selectedFields.map(fid => {
                            const f = fields.find(field => field.id === fid);
                            return <td key={fid} className="p-4 font-bold text-slate-600 whitespace-nowrap">{row[f?.label || '']}</td>
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4">
                   <AlertTriangle size={48} />
                   <p className="font-black">لا توجد سجلات مطابقة لهذا البحث</p>
                   <p className="text-[10px] font-bold">يرجى تعديل الفلاتر من القائمة الجانبية</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <button 
                disabled={isGenerating || reportData.length === 0}
                onClick={generateExcel}
                className={`flex-1 py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                  reportData.length === 0 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/20 active:scale-95'
                }`}
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin" size={24} /> جاري المعالجة...</>
                ) : (
                  <><Download size={24} /> تصدير ملف الـ Excel الآن</>
                )}
              </button>
              <button onClick={onClose} className="px-10 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">إغلاق</button>
            </div>
          </div>
        </div>

        {/* Footer Warning */}
        <div className="px-10 py-4 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500" />
          <p className="text-[10px] text-amber-700 font-black">تأكد من مراجعة "المعاينة" قبل التصدير. يتم استخراج البيانات المنجزة (logs) فقط وليس بيانات المعدة العامة.</p>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
