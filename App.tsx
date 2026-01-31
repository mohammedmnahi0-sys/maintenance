
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import DashboardStats from './components/DashboardStats';
import EquipmentTable from './components/EquipmentTable';
import MaintenanceModal from './components/MaintenanceModal';
import AddEquipmentModal from './components/AddEquipmentModal';
import EditEquipmentModal from './components/EditEquipmentModal';
import EquipmentDetailsModal from './components/EquipmentDetailsModal';
import UserManagementModal from './components/UserManagementModal';
import FlashSyncModal from './components/FlashSyncModal';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';
import BulkImportModal from './components/BulkImportModal';
import { Equipment, User, Role, Department, MaintenanceLog, MaintenanceStatus } from './types';
import { initialEquipment, mockUsers } from './services/mockData';
import { calculateStatus, calculateNextDate } from './constants';
import { PlusCircle, Search, LogIn, ShieldAlert, Key, User as UserIcon, Loader2, FileSpreadsheet, Upload, Users } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeDept, setActiveDept] = useState<Department | 'ALL'>('ALL');
  const [systemName, setSystemName] = useState('مستودع الفاو النفطي');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAppReady, setIsAppReady] = useState(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const init = () => {
      try {
        const savedEq = localStorage.getItem('fao_v3_equipment');
        const savedUsers = localStorage.getItem('fao_v3_users');
        const savedName = localStorage.getItem('fao_v3_sysname');
        const savedSession = localStorage.getItem('fao_v3_session');

        if (savedEq) {
          const parsedEq = JSON.parse(savedEq);
          const validatedEq = parsedEq.map((eq: Equipment) => ({
            ...eq,
            status: calculateStatus(eq.nextMaintenanceDate, eq.currentHours, eq.maintenanceThresholdHours)
          }));
          setEquipment(validatedEq);
        } else {
          setEquipment(initialEquipment);
        }

        if (savedUsers) setUsers(JSON.parse(savedUsers));
        else setUsers(mockUsers);

        if (savedName) setSystemName(savedName);
        
        if (savedSession) {
          const user = JSON.parse(savedSession);
          setCurrentUser(user);
          setActiveDept(user.role === Role.ADMIN ? 'ALL' : user.department);
        }
      } catch (e) {
        setEquipment(initialEquipment);
        setUsers(mockUsers);
      } finally {
        setIsAppReady(true);
      }
    };
    init();
  }, []);

  const syncToStorage = (newEq: Equipment[], newUsers: User[]) => {
    localStorage.setItem('fao_v3_equipment', JSON.stringify(newEq));
    localStorage.setItem('fao_v3_users', JSON.stringify(newUsers));
    setEquipment(newEq);
    setUsers(newUsers);
  };

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedEq(null);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('fao_v3_session', JSON.stringify(user));
      setActiveDept(user.role === Role.ADMIN ? 'ALL' : user.department);
      setLoginError('');
    } else {
      setLoginError('خطأ: اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fao_v3_session');
    closeModal();
  };

  const onAddUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: `u-${Date.now()}` };
    syncToStorage(equipment, [...users, newUser]);
  };

  const onUpdateUser = (userId: string, updates: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    syncToStorage(equipment, updatedUsers);
    if (currentUser?.id === userId) {
      const updatedSelf = { ...currentUser, ...updates };
      setCurrentUser(updatedSelf);
      localStorage.setItem('fao_v3_session', JSON.stringify(updatedSelf));
    }
  };

  const onDeleteUser = (userId: string) => {
    syncToStorage(equipment, users.filter(u => u.id !== userId));
  };

  const addEquipment = (data: Omit<Equipment, 'id' | 'status' | 'logs'>) => {
    const newEq: Equipment = {
      ...data,
      id: `eq-${Date.now()}`,
      logs: [],
      status: calculateStatus(data.nextMaintenanceDate, data.currentHours, data.maintenanceThresholdHours),
      lastUpdated: new Date().toISOString()
    };
    syncToStorage([...equipment, newEq], users);
    closeModal();
  };

  const addBulkEquipment = (newData: Equipment[]) => {
    syncToStorage([...equipment, ...newData], users);
    closeModal();
    alert(`تم بنجاح إضافة ${newData.length} معدة.`);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const updated = equipment.map(eq => {
      if (eq.id === id) {
        const merged = { ...eq, ...updates, lastUpdated: new Date().toISOString() };
        const newStatus = calculateStatus(merged.nextMaintenanceDate, merged.currentHours, merged.maintenanceThresholdHours);
        return { ...merged, status: newStatus };
      }
      return eq;
    });
    syncToStorage(updated, users);
  };

  const performMaintenance = (logData: Omit<MaintenanceLog, 'id' | 'createdAt'>) => {
    if (!selectedEq) return;
    const newLog: MaintenanceLog = { ...logData, id: `log-${Date.now()}`, createdAt: new Date().toISOString() };
    const interval = selectedEq.maintenanceIntervalDays || 30;
    const nextDate = calculateNextDate(logData.date, interval);
    updateEquipment(selectedEq.id, {
      lastMaintenanceDate: logData.date,
      nextMaintenanceDate: nextDate,
      currentHours: logData.type === 'SCHEDULED' ? 0 : selectedEq.currentHours,
      logs: [newLog, ...selectedEq.logs]
    });
    closeModal();
  };

  const filteredEquipment = useMemo(() => {
    if (!currentUser) return [];
    const baseList = equipment.filter(eq => {
      const isMyDept = eq.departments.includes(currentUser.department);
      if (currentUser.role !== Role.ADMIN && !isMyDept) return false;
      const matchesDept = activeDept === 'ALL' || eq.departments.includes(activeDept as Department);
      const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSearch;
    });
    return [...baseList].sort((a, b) => {
      const weights = { [MaintenanceStatus.RED]: 0, [MaintenanceStatus.YELLOW]: 1, [MaintenanceStatus.UNKNOWN]: 2, [MaintenanceStatus.GREEN]: 3 };
      return weights[a.status] - weights[b.status];
    });
  }, [equipment, currentUser, activeDept, searchTerm]);

  if (!isAppReady) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-bold animate-pulse">جاري تحميل النظام...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-['Cairo']">
        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in">
          <div className="p-10 bg-slate-950 text-white text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20"><Key size={40} /></div>
            <h1 className="text-2xl font-black">نظام صيانة الفاو</h1>
            <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">تسجيل دخول آمن</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {loginError && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black text-right">{loginError}</div>}
            <div className="space-y-2 text-right">
              <label className="text-xs font-black text-slate-400 mr-2">اسم المستخدم</label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-600 outline-none font-bold text-right" />
            </div>
            <div className="space-y-2 text-right">
              <label className="text-xs font-black text-slate-400 mr-2">كلمة المرور</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 focus:border-blue-600 outline-none font-bold text-right" />
            </div>
            <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl transition-all">دخول للنظام</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeDept={activeDept} setActiveDept={setActiveDept} systemName={systemName} onOpenSettings={() => setActiveModal('SETTINGS')}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input type="text" placeholder={`بحث في ${activeDept === 'ALL' ? 'المستودع' : activeDept}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-16 pl-8 py-5 rounded-[2rem] border-2 border-white shadow-xl focus:border-blue-600 outline-none font-bold bg-white/50 text-right" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {currentUser.role !== Role.VIEWER && (
              <>
                <button onClick={() => setActiveModal('ADD_EQ')} className="flex-1 md:flex-none px-8 py-5 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"><PlusCircle size={22} /> إضافة معدة</button>
                <button onClick={() => setActiveModal('BULK_IMPORT')} className="flex-1 md:flex-none px-6 py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"><Upload size={22} /> استيراد Excel</button>
              </>
            )}
            <button onClick={() => setActiveModal('SYNC')} className="px-6 py-5 bg-indigo-600 text-white font-black rounded-[2rem] hover:bg-indigo-700 shadow-xl transition-all">مزامنة ونقل</button>
            {/* تم إرجاع زر إدارة المستخدمين هنا */}
            {currentUser.role === Role.ADMIN && (
              <button 
                onClick={() => setActiveModal('USERS')} 
                className="p-5 bg-white text-slate-600 rounded-[2rem] border-2 border-white shadow-xl hover:text-blue-600 transition-all active:scale-95"
                title="إدارة المستخدمين والصلاحيات"
              >
                <Users size={24} />
              </button>
            )}
          </div>
        </div>
        <DashboardStats equipment={filteredEquipment} />
        <EquipmentTable equipment={filteredEquipment} user={currentUser} onPerformMaintenance={(eq) => { setSelectedEq(eq); setActiveModal('MAINTENANCE'); }} onEditEquipment={(eq) => { setSelectedEq(eq); setActiveModal('EDIT_EQ'); }} onViewDetails={(eq) => { setSelectedEq(eq); setActiveModal('DETAILS'); }} />
      </div>

      {activeModal === 'ADD_EQ' && <AddEquipmentModal user={currentUser} onClose={closeModal} onSubmit={addEquipment} />}
      {activeModal === 'BULK_IMPORT' && <BulkImportModal user={currentUser} onClose={closeModal} onImport={addBulkEquipment} />}
      {activeModal === 'MAINTENANCE' && selectedEq && <MaintenanceModal equipment={selectedEq} user={currentUser} onClose={closeModal} onSubmit={performMaintenance} />}
      {activeModal === 'EDIT_EQ' && selectedEq && <EditEquipmentModal equipment={selectedEq} user={currentUser} onClose={closeModal} onSubmit={updateEquipment} />}
      {activeModal === 'DETAILS' && selectedEq && <EquipmentDetailsModal equipment={selectedEq} user={currentUser} onClose={closeModal} onUpdateEquipment={updateEquipment} />}
      {activeModal === 'USERS' && <UserManagementModal users={users} currentUserId={currentUser.id} onClose={closeModal} onAddUser={onAddUser} onDeleteUser={onDeleteUser} onUpdateUser={onUpdateUser} />}
      {activeModal === 'SYNC' && <FlashSyncModal equipment={equipment} users={users} currentUser={currentUser} onClose={closeModal} onSyncComplete={syncToStorage} />}
      {activeModal === 'SETTINGS' && <SettingsModal systemName={systemName} user={currentUser} onClose={closeModal} onUpdateSystemName={(name) => { setSystemName(name); localStorage.setItem('fao_v3_sysname', name); }} onResetData={(type) => { if(type === 'ALL') { localStorage.clear(); window.location.reload(); } else syncToStorage([], users); closeModal(); }} onOpenUsers={() => setActiveModal('USERS')} />}
    </Layout>
  );
};

export default App;
