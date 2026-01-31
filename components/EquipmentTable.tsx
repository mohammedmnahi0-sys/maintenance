
import React from 'react';
import { Equipment, MaintenanceStatus, Role, User, Department } from '../types';
import { STATUS_COLORS, STATUS_TEXT } from '../constants';
import { AlertCircle, CheckCircle, Clock, History, MoreVertical, Plus, Edit, Eye, Lock, ClipboardList, Layers } from 'lucide-react';

interface EquipmentTableProps {
  equipment: Equipment[];
  onPerformMaintenance: (eq: Equipment) => void;
  onEditEquipment: (eq: Equipment) => void;
  onViewDetails: (eq: Equipment) => void;
  user: User;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({ equipment, onPerformMaintenance, onEditEquipment, onViewDetails, user }) => {
  const canEdit = user.role === Role.ADMIN || user.role === Role.MANAGER;
  const canPerform = user.role !== Role.VIEWER;
  const isViewer = user.role === Role.VIEWER;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">المعدة والبيانات</th>
              <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">الأقسام المسؤولة</th>
              <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">عداد الساعات</th>
              <th className="px-8 py-6 text-sm font-black uppercase tracking-widest">تاريخ الاستحقاق</th>
              <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-center">الحالة التشغيلية</th>
              <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-center">أوامر التحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {equipment.map((eq) => (
              <tr key={eq.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <button onClick={() => onViewDetails(eq)} className="text-right">
                    <p className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{eq.name}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">S/N: {eq.serialNumber}</p>
                  </button>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {eq.departments.map(dept => (
                      <span key={dept} className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 whitespace-nowrap">
                        {dept}
                      </span>
                    ))}
                    {eq.departments.length === 0 && <span className="text-slate-300 italic text-[10px]">غير محدد</span>}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="w-48">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${STATUS_COLORS[eq.status]}`} 
                        style={{ width: `${Math.min(100, (eq.currentHours / eq.maintenanceThresholdHours) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 mt-2 flex justify-between">
                      <span>{eq.currentHours} ساعة</span>
                      <span className="text-slate-300">/</span>
                      <span>الحد: {eq.maintenanceThresholdHours}</span>
                    </p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2.5 text-sm font-black text-slate-600">
                    <Clock size={18} className="text-slate-300" />
                    {eq.nextMaintenanceDate}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black text-white shadow-lg ${STATUS_COLORS[eq.status]} shadow-current/10`}>
                      {eq.status === MaintenanceStatus.RED && <AlertCircle size={14} />}
                      {eq.status === MaintenanceStatus.GREEN && <CheckCircle size={14} />}
                      {STATUS_TEXT[eq.status]}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onViewDetails(eq)}
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                      title="عرض التفاصيل والسجل"
                    >
                      <Eye size={22} />
                    </button>
                    
                    {isViewer ? (
                      <div className="p-3 text-slate-200" title="صلاحية المشاهدة فقط">
                        <Lock size={20} />
                      </div>
                    ) : (
                      <>
                        {canPerform && (
                          <button 
                            onClick={() => onPerformMaintenance(eq)}
                            className="p-3 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-blue-500/10"
                            title="إضافة سجل صيانة"
                          >
                            <History size={22} />
                          </button>
                        )}
                        {canEdit && (
                          <button 
                            onClick={() => onEditEquipment(eq)}
                            className="p-3 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl transition-all shadow-lg shadow-amber-500/10"
                            title="تعديل بيانات المعدة"
                          >
                            <Edit size={22} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {equipment.length === 0 && (
          <div className="p-32 text-center">
            <div className="inline-flex p-8 bg-slate-50 rounded-[3rem] text-slate-300 mb-4">
              <ClipboardList size={64} />
            </div>
            <p className="text-xl font-black text-slate-300">لا توجد معدات مسجلة في هذا النطاق</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentTable;
