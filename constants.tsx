
import { Department, MaintenanceStatus } from './types';

export const DEPARTMENTS = Object.values(Department);

export const STATUS_COLORS = {
  [MaintenanceStatus.GREEN]: 'bg-green-500',
  [MaintenanceStatus.YELLOW]: 'bg-yellow-500',
  [MaintenanceStatus.RED]: 'bg-red-500',
  [MaintenanceStatus.UNKNOWN]: 'bg-indigo-600', // لون مميز لنقص المعلومات
};

export const STATUS_TEXT = {
  [MaintenanceStatus.GREEN]: 'حالة جيدة',
  [MaintenanceStatus.YELLOW]: 'قيد الاستحقاق',
  [MaintenanceStatus.RED]: 'متأخر / صيانة فورية',
  [MaintenanceStatus.UNKNOWN]: 'نقص بيانات / صيانة جديدة',
};

/**
 * حساب تاريخ الصيانة القادم
 */
export const calculateNextDate = (lastDateStr: string | null | undefined, intervalDays: number): string => {
  if (!lastDateStr || lastDateStr === '' || lastDateStr === 'N/A') return 'N/A';
  const lastDate = new Date(lastDateStr);
  if (isNaN(lastDate.getTime())) return 'N/A';
  
  // تأمين: إذا كانت المدة صفراً أو غير موجودة، نفترض 30 يوماً كحد أدنى للصيانة الوقائية
  const safeInterval = intervalDays > 0 ? intervalDays : 30;
  
  const nextDateObj = new Date(lastDate);
  nextDateObj.setDate(nextDateObj.getDate() + safeInterval);
  return nextDateObj.toISOString().split('T')[0];
};

export const calculateStatus = (nextDate: string, hours: number, threshold: number): MaintenanceStatus => {
  // إذا لم يوجد تاريخ استحقاق، فهي حالة بيانات ناقصة
  if (!nextDate || nextDate === '' || nextDate === 'N/A') {
    return MaintenanceStatus.UNKNOWN;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // تصفير الوقت للمقارنة الدقيقة للتاريخ
  
  const maintenanceDate = new Date(nextDate);
  maintenanceDate.setHours(0, 0, 0, 0);
  
  if (isNaN(maintenanceDate.getTime())) {
    return MaintenanceStatus.UNKNOWN;
  }

  // تحقق الساعات أولاً: إذا تجاوزت الساعات الحد فهي حمراء فوراً
  if (threshold > 0 && hours >= threshold) return MaintenanceStatus.RED;
  if (threshold > 0 && hours >= threshold * 0.9) return MaintenanceStatus.YELLOW;

  const diffTime = maintenanceDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // تحقق التواريخ
  if (diffDays <= 0) return MaintenanceStatus.RED;
  if (diffDays <= 7) return MaintenanceStatus.YELLOW; // جعل التنبيه الأصفر يبدأ قبل أسبوع ليكون منطقياً

  return MaintenanceStatus.GREEN;
};
