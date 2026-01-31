
import React, { useState } from 'react';
import { User, Role, Department } from '../types';
import { X, ShieldCheck, Key, Save, UserCog, UserPlus, Trash2, BadgeCheck, Building } from 'lucide-react';

interface UserManagementModalProps {
  users: User[];
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  currentUserId: string;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ users, onClose, onUpdateUser, onAddUser, onDeleteUser, currentUserId }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', username: '', password: '', role: Role.VIEWER, department: Department.FAW_DEPOT });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const allDepartments = Object.values(Department);

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    department: Department.FAW_DEPOT,
    role: Role.MANAGER
  });

  const handleStartEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({ 
      name: user.name, 
      username: user.username,
      password: user.password || '', 
      role: user.role, 
      department: user.department 
    });
  };

  const handleSaveEdit = (userId: string) => {
    onUpdateUser(userId, editForm);
    setEditingId(null);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.username && newUser.password) {
      onAddUser(newUser);
      setShowAddForm(false);
      setNewUser({ name: '', username: '', password: '', department: Department.FAW_DEPOT, role: Role.MANAGER });
    }
  };

  const getRoleLabel = (role: Role) => {
    switch(role) {
      case Role.ADMIN: return 'مدير عام';
      case Role.MANAGER: return 'مدير قسم';
      case Role.OPERATOR: return 'مشغل فني';
      default: return 'مشاهد';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-['Cairo']">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
        
        <div className="px-10 py-8 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <UserCog size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-right">إدارة الحسابات والأقسام</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">التحكم في صلاحيات الوصول لـ 8 أقسام</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          
          {!showAddForm ? (
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full py-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 font-black flex items-center justify-center gap-3 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
            >
              <UserPlus size={28} /> إضافة مستخدم جديد
            </button>
          ) : (
            <form onSubmit={handleAddNew} className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 space-y-6 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                 <h4 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                   <ShieldCheck size={24} className="text-blue-600" /> تسجيل حساب جديد
                 </h4>
                 <button type="button" onClick={() => setShowAddForm(false)} className="text-red-500 font-black">إلغاء</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2">الاسم الثلاثي</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2">اسم الدخول (Username)</label>
                  <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2">كلمة المرور</label>
                  <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-black text-slate-500 mr-2">القسم المسؤول عنه</label>
                  <select 
                    value={newUser.department} 
                    onChange={e => setNewUser({...newUser, department: e.target.value as Department})} 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black"
                  >
                    {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 mr-2">المستوى الوظيفي</label>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value as Role})} 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white font-black"
                  >
                    <option value={Role.MANAGER}>مدير قسم (Manager)</option>
                    <option value={Role.OPERATOR}>مشغل فني (Operator)</option>
                    <option value={Role.VIEWER}>مشاهد (Viewer)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 shadow-xl transition-all">تأكيد الإضافة</button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map(user => (
              <div key={user.id} className={`p-8 rounded-[3rem] border-2 transition-all ${editingId === user.id ? 'border-blue-600 bg-blue-50/20' : 'bg-white border-slate-50'}`}>
                {editingId === user.id ? (
                  <div className="space-y-4 text-right">
                    <h5 className="font-black mb-4">تعديل بيانات: {user.name}</h5>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 font-bold" placeholder="الاسم" />
                    <input type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 font-bold" placeholder="تغيير كلمة المرور" />
                    <select value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value as Department})} className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 font-bold bg-white">
                      {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as Role})} className="w-full px-5 py-3 rounded-xl border-2 border-blue-100 font-bold bg-white">
                      <option value={Role.ADMIN}>مدير عام</option>
                      <option value={Role.MANAGER}>مدير قسم</option>
                      <option value={Role.OPERATOR}>مشغل</option>
                      <option value={Role.VIEWER}>مشاهد</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(user.id)} className="flex-1 bg-green-600 text-white font-black py-3 rounded-xl hover:bg-green-700 transition-all">حفظ التغييرات</button>
                      <button onClick={() => setEditingId(null)} className="px-6 bg-slate-200 text-slate-600 font-black py-3 rounded-xl">إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white ${user.role === Role.ADMIN ? 'bg-red-600' : 'bg-slate-800'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black">{getRoleLabel(user.role)}</span>
                    </div>
                    <h5 className="font-black text-slate-900 text-lg mb-1">{user.name}</h5>
                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase">Username: {user.username}</p>
                    <div className="bg-slate-50 p-3 rounded-xl mb-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase">القسم</p>
                       <p className="text-xs font-black text-blue-600">{user.department}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleStartEdit(user)} className="flex-1 bg-slate-900 text-white font-black py-3 rounded-xl text-xs">تعديل</button>
                      {user.id !== currentUserId && (
                        <button onClick={() => { if(confirm('حذف هذا المستخدم؟')) onDeleteUser(user.id); }} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-10 py-6 bg-slate-50 border-t flex justify-center">
          <button onClick={onClose} className="px-16 py-4 bg-slate-900 text-white font-black rounded-2xl">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
