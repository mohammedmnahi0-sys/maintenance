
import { Department, Criticality } from '../types';

export interface EquipmentStandard {
  type: string;
  suggestedDays: number;
  suggestedHours: number;
  criticality: Criticality;
  defaultDept: Department;
  description: string;
}

export const OIL_FIELD_STANDARDS: EquipmentStandard[] = [
  {
    type: 'صمام بوابي كهربائي (MOV)',
    suggestedDays: 30,
    suggestedHours: 500,
    criticality: Criticality.MEDIUM,
    defaultDept: Department.ELECTRICITY,
    description: 'فحص المحرك الكهربائي والتشحيم الميكانيكي'
  },
  {
    type: 'صمام فراشي كهربائي (Butterfly MOV)',
    suggestedDays: 30,
    suggestedHours: 500,
    criticality: Criticality.MEDIUM,
    defaultDept: Department.ELECTRICITY,
    description: 'فحص آلية الفتح والغلق الكهربائية'
  },
  {
    type: 'صمام يدوي (Manual Valve)',
    suggestedDays: 180,
    suggestedHours: 0,
    criticality: Criticality.LOW,
    defaultDept: Department.MECHANICAL,
    description: 'تشحيم محور الصمام والتأكد من سلاسة الحركة'
  },
  {
    type: 'مضخة بوستر (Booster Pump)',
    suggestedDays: 45,
    suggestedHours: 1000,
    criticality: Criticality.HIGH,
    defaultDept: Department.MECHANICAL,
    description: 'فحص المحامل (Bearings) والاهتزازات'
  },
  {
    type: 'مضخة طرد مركزي رئيسية',
    suggestedDays: 30,
    suggestedHours: 720,
    criticality: Criticality.HIGH,
    defaultDept: Department.MECHANICAL,
    description: 'فحص ميكانيكال سيل ودرجة حرارة المحرك'
  },
  {
    type: 'مرسلات الإشارة (Transmitters)',
    suggestedDays: 90,
    suggestedHours: 0,
    criticality: Criticality.MEDIUM,
    defaultDept: Department.INSTRUMENTATION,
    description: 'فحص دقة القراءة ومعايرة الإشارة الخارجة'
  },
  {
    type: 'متحسسات ذكية (Sensors)',
    suggestedDays: 90,
    suggestedHours: 0,
    criticality: Criticality.MEDIUM,
    defaultDept: Department.INSTRUMENTATION,
    description: 'التأكد من التوصيلات ونظافة الحساس'
  },
  {
    type: 'جهاز استشعار غاز (Gas Detector)',
    suggestedDays: 30,
    suggestedHours: 0,
    criticality: Criticality.HIGH,
    defaultDept: Department.SAFETY,
    description: 'اختبار الاستجابة (Bump Test) والمعايرة'
  },
  {
    type: 'غير ذلك (معدة مخصصة)',
    suggestedDays: 30,
    suggestedHours: 100,
    criticality: Criticality.LOW,
    defaultDept: Department.FAW_DEPOT,
    description: 'إدخال بيانات يدوية لمعدة غير مدرجة'
  }
];
