import { useState } from 'react';
import { Plus, X, Edit2, BookUser, Save, Search, Phone, Mail, Building } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { Contacto } from '../../types';

interface FormData {
  nombre: string; apellido: string; empresa: string; email: string;
  telefono: string; direccion: string; ciudad: string; pais: string;
  ruc: string; tipo: 'cliente' | 'proveedor'; notas: string;
}

const emptyForm: FormData = {
  nombre: '', apellido: '', empresa: '', email: '',
  telefono: '', direccion: '', ciudad: 'San José', pais: 'Costa Rica',
  ruc: '', tipo: 'cliente', notas: '',
};

export default function ContactosModule() {
  const { contactos, addContacto, updateContacto, deleteContacto } = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contacto | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [selectedContacto, setSelectedContacto] = useState<Contacto | null>(null);

  const openNew = () => { setForm(emptyForm); setEditing(null); setShowForm(true); };
  const openEdit = (c: Contacto) => {
    setEditing(c);
    setForm({ nombre: c.nombre, apellido: c.apellido, empresa: c.empresa, email: c.email, telefono: c.telefono, direccion: c.direccion, ciudad: c.ciudad, pais: c.pais, ruc: c.ruc, tipo: c.tipo, notas: c.notas });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nombre || !form.email) { alert('Nombre y email son requeridos'); return; }
    if (editing) { updateContacto(editing.id, form); }
    else { addContacto(form); }
    setShowForm(false);
  };

  const filtered = contactos.filter(c => {
    const matchSearch = `${c.nombre} ${c.apellido} ${c.empresa} ${c.email} ${c.ruc}`.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo ? c.tipo === filterTipo : true;
    return matchSearch && matchTipo;
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
            <BookUser size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Contactos / Clientes</h1>
            <p className="text-xs text-slate-500">{contactos.length} contactos • {contactos.filter(c => c.tipo === 'cliente').length} clientes • {contactos.filter(c => c.tipo === 'proveedor').length} proveedores</p>
          </div>
        </div>
        <button className="btn-warning" onClick={openNew}><Plus size={16} />Nuevo Contacto</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
          <input className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
            placeholder="Buscar por nombre, empresa, email, RUC..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="tech-input rounded-lg px-3 py-2.5 text-sm"
          value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="cliente">Clientes</option>
          <option value="proveedor">Proveedores</option>
        </select>
      </div>

      {/* Grid de contactos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <BookUser size={40} className="mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-slate-500 text-sm">No hay contactos registrados</p>
            <button className="btn-warning mt-3 text-xs" onClick={openNew}><Plus size={14} />Agregar primer contacto</button>
          </div>
        ) : filtered.map(c => (
          <div key={c.id}
            className="section-card card-glow cursor-pointer hover:border-blue-700/40 transition-all"
            onClick={() => setSelectedContacto(c)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: 'white' }}>
                  {c.nombre[0]}{c.apellido[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{c.nombre} {c.apellido}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.tipo === 'cliente' ? 'badge-active' : 'badge-info'}`}>
                    {c.tipo}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); openEdit(c); }}
                  className="p-1 rounded hover:bg-amber-900/30 text-slate-400 hover:text-amber-400 transition-colors">
                  <Edit2 size={12} />
                </button>
                <button onClick={e => { e.stopPropagation(); deleteContacto(c.id); }}
                  className="p-1 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Building size={11} className="text-amber-400" />
                <span className="truncate">{c.empresa || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail size={11} className="text-blue-400" />
                <span className="truncate">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Phone size={11} className="text-emerald-400" />
                <span>{c.telefono || '—'}</span>
              </div>
            </div>

            {c.ruc && (
              <div className="mt-2 pt-2 border-t border-blue-900/20">
                <span className="text-xs text-slate-500">RUC: <span className="font-mono text-slate-400">{c.ruc}</span></span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedContacto && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedContacto(null)}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{selectedContacto.nombre} {selectedContacto.apellido}</h2>
              <button onClick={() => setSelectedContacto(null)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Empresa', value: selectedContacto.empresa },
                { label: 'Email', value: selectedContacto.email },
                { label: 'Teléfono', value: selectedContacto.telefono },
                { label: 'RUC', value: selectedContacto.ruc },
                { label: 'Dirección', value: `${selectedContacto.direccion}, ${selectedContacto.ciudad}, ${selectedContacto.pais}` },
                { label: 'Tipo', value: selectedContacto.tipo },
                { label: 'Notas', value: selectedContacto.notas },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(15,22,35,0.6)' }}>
                  <span className="text-xs text-amber-400 font-semibold w-24 flex-shrink-0">{f.label}:</span>
                  <span className="text-xs text-slate-300">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-warning flex-1" onClick={() => { setSelectedContacto(null); openEdit(selectedContacto); }}>
                <Edit2 size={14} /> Editar
              </button>
              <button className="btn-ghost flex-1" onClick={() => setSelectedContacto(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editing ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Empresa</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">RUC / Cédula Jurídica</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm font-mono"
                    placeholder="3-101-000000" value={form.ruc}
                    onChange={e => setForm(f => ({ ...f, ruc: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Email *</label>
                  <input type="email" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    placeholder="8888-0000" value={form.telefono}
                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Dirección</label>
                <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                  value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Ciudad</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">País</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Tipo</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as any }))}>
                    <option value="cliente">Cliente</option>
                    <option value="proveedor">Proveedor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Notas</label>
                <textarea className="tech-input w-full rounded-lg px-3 py-2.5 text-sm resize-none" rows={2}
                  value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
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
