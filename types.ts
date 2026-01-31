
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export enum Department {
  FAW_DEPOT = 'تشغيل وصيانة مستودع الفاو',
  ELECTRICITY = 'قسم الكهرباء',
  MECHANICAL = 'قسم الميكانيك',
  INSTRUMENTATION = 'قسم الآلات الدقيقة',
  SAFETY = 'قسم السلامة',
  CATHODIC = 'قسم الحماية الكاثودية',
  CIVIL = 'قسم الهندسة المدنية',
  COOLING = 'قسم التبريد'
}

export enum MaintenanceStatus {
  GREEN = 'NORMAL',
  YELLOW = 'WARNING',
  RED = 'OVERDUE',
  UNKNOWN = 'UNKNOWN'
}

export enum Criticality {
  HIGH = 'CRITICAL',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: Role;
  department: Department;
  lastActive?: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  performedBy: string;
  photos: string[];
  pdfUrl?: string;
  type: 'SCHEDULED' | 'EMERGENCY';
  createdAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  serialNumber: string;
  departments: Department[];
  location?: string;
  criticality: Criticality;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceIntervalDays: number;
  currentHours: number;
  maintenanceThresholdHours: number;
  status: MaintenanceStatus;
  logs: MaintenanceLog[];
  procedureFile?: string;
  lastUpdated: string;
}
