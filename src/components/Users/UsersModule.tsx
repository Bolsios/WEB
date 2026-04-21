import { useState } from 'react';
import { Plus, X, Edit2, Users, Save, Shield } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { User, UserRole } from '../../types';

const roles: { value: UserRole; label: string; color: string }[] = [
  { value: 'admin', label: 'Administrador', color: 'badge-danger' },
  { value: 'vendedor', label: 'Vendedor', color: 'badge-active' },
  { value: 'almacen', label: 'Almacén', color: 'badge-info' },
  { value: 'soporte', label: 'Soporte Técnico', color: 'badge-orange' },
  { value: 'cliente', label: 'Cliente', color: 'badge-neutral' },
];

interface FormData {
  nombre: string; apellido: string; email: string; password: string;
  rol: UserRole; telefono: string; activo: boolean;
}

const emptyForm: FormData = {
  nombre: '', apellido: '', email: '', password: '',
  rol: 'vendedor', telefono: '', activo: true,
};

export default function UsersModule() {
  const { users, addUser, updateUser, deleteUser } = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPass, setShowPass] = useState(false);

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ nombre: u.nombre, apellido: u.apellido, email: u.email, password: u.password, rol: u.rol, telefono: u.telefono, activo: u.activo });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nombre || !form.email) { alert('Nombre y email son requeridos'); return; }
    if (editing) { updateUser(editing.id, form); }
    else { addUser(form); }
    setShowForm(false);
  };

  const getRoleConfig = (rol: UserRole) => roles.find(r => r.value === rol) || roles[4];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
            <Users size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Registro de Usuarios</h1>
            <p className="text-xs text-slate-500">{users.length} usuarios registrados • {users.filter(u => u.activo).length} activos</p>
          </div>
        </div>
        <button className="btn-warning" onClick={openNew}><Plus size={16} />Nuevo Usuario</button>
      </div>

      {/* Role stats */}
      <div className="flex flex-wrap gap-3">
        {roles.map(r => (
          <div key={r.value} className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(15,22,35,0.8)', border: '1px solid rgba(30,58,95,0.3)' }}>
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.color}`}>{r.label}</span>
            <span className="text-sm font-bold text-white">{users.filter(u => u.rol === r.value).length}</span>
          </div>
        ))}
      </div>

      <div className="section-card p-0 overflow-hidden">
        <table className="w-full tech-table">
          <thead>
            <tr>
              <th className="text-left">Usuario</th>
              <th className="text-left">Email</th>
              <th className="text-left">Teléfono</th>
              <th className="text-center">Rol</th>
              <th className="text-center">Estado</th>
              <th className="text-left">Creado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #1e3a5f, #f59e0b)', color: 'white' }}>
                      {u.nombre[0]}{u.apellido[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{u.nombre} {u.apellido}</div>
                    </div>
                  </div>
                </td>
                <td className="text-xs text-slate-400">{u.email}</td>
                <td className="text-xs text-slate-400">{u.telefono}</td>
                <td className="text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleConfig(u.rol).color}`}>
                    {getRoleConfig(u.rol).label}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.activo ? 'badge-active' : 'badge-neutral'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('es-CR')}</td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(u)}
                      className="p-1.5 rounded hover:bg-amber-900/30 text-slate-400 hover:text-amber-400 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteUser(u.id)}
                      className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(30,58,95,0.5)' }}>
                  <Shield size={18} style={{ color: '#f59e0b' }} />
                </div>
                <h2 className="text-lg font-bold text-white">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Nombre *</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Apellido *</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Email *</label>
                <input type="email" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'}
                    className="tech-input w-full rounded-lg px-3 py-2.5 text-sm pr-10"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs">
                    {showPass ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Rol</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as UserRole }))}>
                    {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    placeholder="8888-0000" value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo-u" checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <label htmlFor="activo-u" className="text-sm text-slate-300">Usuario activo</label>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-blue-900/30">
                <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={16} />Cancelar</button>
                <button className="btn-warning" onClick={handleSave}><Save size={16} />Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
