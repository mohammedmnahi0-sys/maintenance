
import React, { useState, useRef } from 'react';
import { Department, Equipment, Role, User, Criticality, MaintenanceStatus } from '../types';
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, Loader2, Table as TableIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkImportModalProps {
  user: User;
  onClose: () => void;
  onImport: (equipment: Equipment[]) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ user, onClose, onImport }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // دالة ذكية جداً لإيجاد القيمة بناءً على مرادفات واسعة جداً لضمان عدم فقدان اسم المعدة
  const findValue = (row: any, keys: string[]) => {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const foundKey = rowKeys.find(rk => {
        const cleanRowKey = rk.trim().toLowerCase().replace(/[:\-_]/g, '');
        const cleanSearchKey = key.trim().toLowerCase().replace(/[:\-_]/g, '');
        return cleanRowKey === cleanSearchKey || cleanRowKey.includes(cleanSearchKey) || cleanSearchKey.includes(cleanRowKey);
      });
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) return row[foundKey];
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        const standardized = rawJson.map((row: any) => ({
          name: findValue(row, ['اسم المعدة', 'اسم', 'معدة', 'البيان', 'المادة', 'العنصر', 'التسمية', 'Name', 'Equipment', 'Item', 'Description', 'Tag No', 'Tag']),
          serialNumber: findValue(row, ['الرقم التسلسلي', 'رقم تسلسلي', 'سيريال', 'رقم المصنع', 'Serial', 'S/N', 'Serial Number', 'Manufacturer No']),
          deptStr: findValue(row, ['القسم المسؤول', 'القسم', 'قسم', 'Department', 'Dept', 'Section']),
          location: findValue(row, ['الموقع الميداني', 'الموقع', 'مكان', 'المكان', 'Location', 'Site', 'Area']),
          interval: findValue(row, ['دورة الصيانة', 'فترة الصيانة', 'الدورة', 'Interval', 'Days', 'Period']),
          threshold: findValue(row, ['ساعات التشغيل', 'الحد الأقصى', 'الساعات', 'Hours', 'Threshold', 'Limit']),
          description: findValue(row, ['الوصف الفني', 'الوصف', 'ملاحظات', 'Technical', 'Notes', 'Remarks'])
        }));

        setPreviewData(standardized);
      } catch (err) {
        alert('خطأ في قراءة ملف Excel. تأكد من إغلاق الملف قبل الرفع.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'اسم المعدة': 'مثال: محرك مضخة P-101',
        'الرقم التسلسلي': 'SN-998877',
        'القسم المسؤول': 'قسم الميكانيك',
        'الموقع الميداني': 'المحطة الشمالية',
        'دورة الصيانة (أيام)': 90,
        'حد ساعات التشغيل': 1000,
        'الوصف الفني': 'وصف إضافي اختياري'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Fao_Import_Template.xlsx");
  };

  const handleConfirmImport = () => {
    const newEquipment: Equipment[] = previewData.map((row, index) => {
      const name = String(row.name || '').trim();
      const serial = String(row.serialNumber || '').trim();

      if (!name || name === 'null' || name === 'undefined') return null;

      return {
        id: `bulk-${Date.now()}-${index}`,
        name: name,
        serialNumber: serial || 'N/A',
        description: row.description || '',
        departments: [user.department],
        location: row.location || '',
        criticality: Criticality.MEDIUM,
        lastMaintenanceDate: '',
        nextMaintenanceDate: 'N/A',
        maintenanceIntervalDays: parseInt(row.interval) || 30,
        currentHours: 0,
        maintenanceThresholdHours: parseInt(row.threshold) || 500,
        status: MaintenanceStatus.UNKNOWN,
        logs: [],
        lastUpdated: new Date().toISOString()
      };
    }).filter(e => e !== null) as Equipment[];

    if (newEquipment.length === 0) {
      alert('لم يتم التعرف على أي معدات. يرجى مراجعة عناوين الأعمدة في الملف.');
      return;
    }

    onImport(newEquipment);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 font-['Cairo']">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        
        <div className="px-10 py-8 bg-slate-900 text-white flex items-center justify-between border-b-4 border-blue-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-right">استيراد المعدات الذكي</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">نظام الربط الآلي للأعمدة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-10 space-y-8">
          
          {previewData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">
               <div className="w-full max-w-md p-12 border-4 border-dashed border-slate-100 rounded-[3rem] text-center space-y-6 group hover:border-blue-200 transition-all">
                  <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <Upload size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">اسحب ملف الإكسل هنا</h4>
                    <p className="text-xs text-slate-400 font-bold">يدعم النظام البحث التلقائي عن أسماء الأعمدة العربية والإنجليزية</p>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl transition-all">اختيار الملف من الحاسوب</button>
               </div>
               <button onClick={downloadTemplate} className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-sm transition-all"><Download size={20} /> تحميل نموذج استرشاد للأعمدة</button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
               <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-800 italic">نتائج التعرف الآلي ({previewData.length} معدة)</h4>
                  <button onClick={() => setPreviewData([])} className="text-xs font-black text-red-500 hover:underline">إلغاء واختيار ملف آخر</button>
               </div>
               <div className="flex-1 border-2 border-slate-50 rounded-[2rem] overflow-auto custom-scrollbar">
                  <table className="w-full text-right text-xs">
                    <thead className="sticky top-0 bg-slate-900 text-white z-10">
                      <tr>
                        <th className="p-4 font-black">اسم المعدة المكتشف</th>
                        <th className="p-4 font-black">الرقم التسلسلي</th>
                        <th className="p-4 font-black">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData.map((row, idx) => (
                        <tr key={idx} className={row.name ? 'hover:bg-blue-50' : 'bg-red-50'}>
                          <td className="p-4 font-bold">{row.name || <span className="text-red-500 italic">مفقود - سيتم تجاهله</span>}</td>
                          <td className="p-4 font-mono">{row.serialNumber || '-'}</td>
                          <td className="p-4">{row.name ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-red-500" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
               <div className="flex gap-4">
                  <button onClick={handleConfirmImport} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 shadow-2xl transition-all flex items-center justify-center gap-3 text-lg">
                    {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={24} /> تأكيد وإضافة للمستودع</>}
                  </button>
                  <button onClick={onClose} className="px-10 py-5 bg-slate-100 text-slate-500 font-black rounded-[1.5rem] hover:bg-slate-200 transition-all">إلغاء</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
