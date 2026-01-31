
import { Department, Role, Equipment, MaintenanceStatus, User, Criticality } from '../types';

export const mockUsers: User[] = [
  { id: 'admin-1', username: 'admin', password: '123', name: 'مدير النظام الرئيسي', role: Role.ADMIN, department: Department.FAW_DEPOT },
  { id: 'elec-1', username: 'elec_user', password: '111', name: 'مسؤول الكهرباء', role: Role.MANAGER, department: Department.ELECTRICITY },
  { id: 'mech-1', username: 'mech_user', password: '222', name: 'مسؤول الميكانيك', role: Role.MANAGER, department: Department.MECHANICAL },
  { id: 'inst-1', username: 'inst_user', password: '333', name: 'مسؤول الآلات', role: Role.MANAGER, department: Department.INSTRUMENTATION },
  { id: 'safe-1', username: 'safe_user', password: '444', name: 'مسؤول السلامة', role: Role.MANAGER, department: Department.SAFETY },
  { id: 'cath-1', username: 'cath_user', password: '555', name: 'مسؤول الحماية الكاثودية', role: Role.MANAGER, department: Department.CATHODIC },
  { id: 'civil-1', username: 'civil_user', password: '666', name: 'مسؤول الهندسة المدنية', role: Role.MANAGER, department: Department.CIVIL },
  { id: 'cool-1', username: 'cool_user', password: '777', name: 'مسؤول التبريد', role: Role.MANAGER, department: Department.COOLING },
];

export const initialEquipment: Equipment[] = [
  {
    id: 'eq-1',
    name: 'مولد طاقة 500KVA',
    serialNumber: 'GEN-2023-001',
    departments: [Department.ELECTRICITY, Department.MECHANICAL],
    location: 'ساحة المولدات الشرقية',
    criticality: Criticality.HIGH,
    lastMaintenanceDate: '2024-01-10',
    nextMaintenanceDate: '2024-05-10',
    maintenanceIntervalDays: 120,
    currentHours: 450,
    maintenanceThresholdHours: 500,
    status: MaintenanceStatus.YELLOW,
    logs: [],
    lastUpdated: '2024-03-20T10:00:00.000Z'
  },
  {
    id: 'eq-2',
    name: 'مضخة نفط رئيسية',
    serialNumber: 'PUMP-FAW-09',
    departments: [Department.MECHANICAL, Department.INSTRUMENTATION, Department.FAW_DEPOT],
    location: 'محطة الضخ الرئيسية',
    criticality: Criticality.HIGH,
    lastMaintenanceDate: '2024-02-15',
    nextMaintenanceDate: '2024-03-01',
    maintenanceIntervalDays: 30,
    currentHours: 120,
    maintenanceThresholdHours: 200,
    status: MaintenanceStatus.RED,
    logs: [],
    lastUpdated: '2024-03-20T10:00:00.000Z'
  }
];
