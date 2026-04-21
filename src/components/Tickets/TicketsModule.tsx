import { useState } from 'react';
import { Plus, X, Edit2, Ticket, Search, Save, Tag, Shield, Wrench, BadgeCheck, Clock } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { Ticket as TicketType, TipoTicket, PrioridadTicket, EstadoTicket } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  tipo?: TipoTicket;
}

const marcas = ['Dahua', 'Hikvision', 'Ubiquiti', 'TP-Link', 'ZKTeco', 'Axis', 'Bosch', 'Panduit', 'Otra'];

const tipoIcons: Record<TipoTicket, React.ReactNode> = {
  rma: <Shield size={14} />,
  reparacion: <Wrench size={14} />,
  garantia: <BadgeCheck size={14} />,
  soporte: <Ticket size={14} />,
};

const tipoLabels: Record<TipoTicket, string> = {
  rma: 'RMA con Marca',
  reparacion: 'Reparación',
  garantia: 'Garantía',
  soporte: 'Soporte Técnico',
};

const prioridadColor: Record<PrioridadTicket, string> = {
  baja: 'badge-neutral',
  media: 'badge-info',
  alta: 'badge-warning',
  critica: 'badge-danger',
};

const estadoColor: Record<EstadoTicket, string> = {
  abierto: 'badge-warning',
  en_proceso: 'badge-info',
  esperando_cliente: 'badge-orange',
  resuelto: 'badge-active',
  cerrado: 'badge-neutral',
};

interface TicketForm {
  tipo: TipoTicket; contactoId: string; titulo: string; descripcion: string;
  marca: string; modelo: string; serie: string; estado: EstadoTicket;
  prioridad: PrioridadTicket; asignadoA: string; rmaRelacionadoId: string; notas: string;
}

const emptyForm: TicketForm = {
  tipo: 'soporte', contactoId: '', titulo: '', descripcion: '',
  marca: '', modelo: '', serie: '', estado: 'abierto',
  prioridad: 'media', asignadoA: '', rmaRelacionadoId: '', notas: '',
};

export default function TicketsModule({ tipo }: Props) {
  const { tickets, addTicket, updateTicket, contactos, users, getNextNumero } = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [newNote, setNewNote] = useState('');
  const [showEtiqueta, setShowEtiqueta] = useState<TicketType | null>(null);
  const [migrateFrom, setMigrateFrom] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchTipo = tipo ? t.tipo === tipo : true;
    const matchSearch = t.numero.toLowerCase().includes(search.toLowerCase()) ||
      t.titulo.toLowerCase().includes(search.toLowerCase()) ||
      t.contactoNombre.toLowerCase().includes(search.toLowerCase()) ||
      t.serie.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado ? t.estado === filterEstado : true;
    const matchPrioridad = filterPrioridad ? t.prioridad === filterPrioridad : true;
    return matchTipo && matchSearch && matchEstado && matchPrioridad;
  });

  const openNew = () => {
    setForm({ ...emptyForm, tipo: tipo || 'soporte' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (t: TicketType) => {
    setEditing(t);
    setForm({
      tipo: t.tipo, contactoId: t.contactoId, titulo: t.titulo, descripcion: t.descripcion,
      marca: t.marca, modelo: t.modelo, serie: t.serie, estado: t.estado,
      prioridad: t.prioridad, asignadoA: t.asignadoA, rmaRelacionadoId: t.rmaRelacionadoId, notas: t.notas,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.titulo || !form.contactoId) { alert('Título y contacto son requeridos'); return; }
    const contacto = contactos.find(c => c.id === form.contactoId);
    const ticketData = {
      ...form,
      contactoNombre: contacto ? `${contacto.nombre} ${contacto.apellido} - ${contacto.empresa}` : '',
      etiqueta: '',
      historial: editing?.historial || [],
    };

    if (editing) {
      updateTicket(editing.id, ticketData);
    } else {
      addTicket({
        ...ticketData,
        numero: getNextNumero('TKT', tickets),
        historial: [{
          id: uuidv4(),
          fecha: new Date().toISOString(),
          usuario: 'Sistema',
          accion: 'Ticket creado',
          notas: form.descripcion,
        }],
      });
    }
    setShowForm(false);
  };

  const addNote = (ticket: TicketType) => {
    if (!newNote.trim()) return;
    const historial = [
      ...ticket.historial,
      { id: uuidv4(), fecha: new Date().toISOString(), usuario: 'Admin', accion: 'Nota agregada', notas: newNote }
    ];
    updateTicket(ticket.id, { historial });
    setNewNote('');
    setSelectedTicket({ ...ticket, historial });
  };

  const generateEtiqueta = (t: TicketType) => {
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TECHSECURE PRO — ${tipoLabels[t.tipo].toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Ticket:  ${t.numero}
  Marca:   ${t.marca}
  Modelo:  ${t.modelo}
  Serie:   ${t.serie}
  Cliente: ${t.contactoNombre}
  Fecha:   ${new Date(t.createdAt).toLocaleDateString('es-CR')}
  Estado:  ${t.estado.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  };

  const handleMigrateToGarantia = (rmaTicket: TicketType) => {
    const migratedForm: TicketForm = {
      tipo: 'garantia',
      contactoId: rmaTicket.contactoId,
      titulo: `Garantía: ${rmaTicket.titulo}`,
      descripcion: `Migrado desde RMA ${rmaTicket.numero}. ${rmaTicket.descripcion}`,
      marca: rmaTicket.marca,
      modelo: rmaTicket.modelo,
      serie: rmaTicket.serie,
      estado: 'abierto',
      prioridad: rmaTicket.prioridad,
      asignadoA: rmaTicket.asignadoA,
      rmaRelacionadoId: rmaTicket.id,
      notas: `Origen RMA: ${rmaTicket.numero}`,
    };
    setForm(migratedForm);
    setEditing(null);
    setShowForm(true);
  };

  const rmaTickets = tickets.filter(t => t.tipo === 'rma');

  const moduleTitle: Record<string, string> = {
    rma: 'Gestión RMA con Marca',
    reparacion: 'Gestión de Reparaciones',
    garantia: 'Garantías',
    soporte: 'Tickets de Soporte',
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
            {tipo ? tipoIcons[tipo] : <Ticket size={18} />}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{tipo ? moduleTitle[tipo] : 'Panel de Tickets'}</h1>
            <p className="text-xs text-slate-500">{filteredTickets.length} tickets • {filteredTickets.filter(t => t.estado === 'abierto').length} abiertos</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tipo === 'garantia' && rmaTickets.length > 0 && (
            <div className="relative">
              <select
                className="tech-input rounded-lg px-3 py-2.5 text-sm pr-8"
                value={migrateFrom}
                onChange={e => {
                  const t = rmaTickets.find(r => r.id === e.target.value);
                  if (t) handleMigrateToGarantia(t);
                  setMigrateFrom('');
                }}
              >
                <option value="">↩ Migrar desde RMA...</option>
                {rmaTickets.map(r => <option key={r.id} value={r.id}>{r.numero} — {r.titulo}</option>)}
              </select>
            </div>
          )}
          <button className="btn-warning" onClick={openNew}><Plus size={16} />Nuevo</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
          <input className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
            placeholder="Buscar por número, título, cliente, serie..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="tech-input rounded-lg px-3 py-2.5 text-sm"
          value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_proceso">En Proceso</option>
          <option value="esperando_cliente">Esperando Cliente</option>
          <option value="resuelto">Resuelto</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <select className="tech-input rounded-lg px-3 py-2.5 text-sm"
          value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)}>
          <option value="">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
      </div>

      {/* Tickets Grid */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="section-card text-center py-12">
            <Ticket size={40} className="mx-auto mb-3 opacity-20 text-slate-400" />
            <p className="text-slate-500 text-sm">No hay tickets</p>
            <button className="btn-warning mt-3 text-xs" onClick={openNew}><Plus size={14} />Crear ticket</button>
          </div>
        ) : filteredTickets.slice().reverse().map(t => (
          <div key={t.id} className="section-card hover:border-blue-700/40 transition-all cursor-pointer"
            onClick={() => setSelectedTicket(t)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(30,58,95,0.4)', color: '#f59e0b' }}>
                  {tipoIcons[t.tipo]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-amber-400 font-bold">{t.numero}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[t.estado]}`}>{t.estado.replace('_',' ')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${prioridadColor[t.prioridad]}`}>{t.prioridad}</span>
                    {!tipo && <span className="badge-neutral text-xs px-2 py-0.5 rounded-full">{tipoLabels[t.tipo]}</span>}
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5 truncate">{t.titulo}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>{t.contactoNombre}</span>
                    {t.marca && <span>• {t.marca} {t.modelo}</span>}
                    {t.serie && <span>• S/N: <span className="font-mono text-slate-400">{t.serie}</span></span>}
                    {t.rmaRelacionadoId && <span className="text-blue-400">• RMA vinculado</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('es-CR')}</div>
                  {t.asignadoA && <div className="text-xs text-blue-400">→ {t.asignadoA}</div>}
                </div>
                <button onClick={e => { e.stopPropagation(); setShowEtiqueta(t); }}
                  className="p-1.5 rounded hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 transition-colors" title="Generar etiqueta">
                  <Tag size={14} />
                </button>
                <button onClick={e => { e.stopPropagation(); openEdit(t); }}
                  className="p-1.5 rounded hover:bg-amber-900/30 text-slate-400 hover:text-amber-400 transition-colors">
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedTicket(null)}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-mono text-amber-400 font-bold text-lg">{selectedTicket.numero}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[selectedTicket.estado]}`}>{selectedTicket.estado.replace('_',' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${prioridadColor[selectedTicket.prioridad]}`}>{selectedTicket.prioridad}</span>
                  <span className="badge-neutral text-xs px-2 py-0.5 rounded-full">{tipoLabels[selectedTicket.tipo]}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">{selectedTicket.titulo}</h3>
                <p className="text-sm text-slate-400">{selectedTicket.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cliente', value: selectedTicket.contactoNombre },
                  { label: 'Asignado a', value: selectedTicket.asignadoA || 'Sin asignar' },
                  { label: 'Marca', value: selectedTicket.marca },
                  { label: 'Modelo', value: selectedTicket.modelo },
                  { label: 'N° Serie', value: selectedTicket.serie },
                  { label: 'RMA vinculado', value: selectedTicket.rmaRelacionadoId ? tickets.find(t => t.id === selectedTicket.rmaRelacionadoId)?.numero || '—' : '—' },
                ].map(f => (
                  <div key={f.label} className="p-2.5 rounded-lg" style={{ background: 'rgba(15,22,35,0.8)' }}>
                    <div className="text-xs text-amber-400 mb-0.5">{f.label}</div>
                    <div className="text-sm text-white font-medium">{f.value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Historial */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock size={12} /> Historial de Actividad
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTicket.historial.map(h => (
                    <div key={h.id} className="flex gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(15,22,35,0.6)' }}>
                      <div className="flex-shrink-0 w-1 rounded-full bg-amber-400/30" />
                      <div>
                        <div className="text-xs text-amber-400 font-semibold">{h.accion} <span className="text-slate-500 font-normal">— {h.usuario}</span></div>
                        <div className="text-xs text-slate-400">{h.notas}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{new Date(h.fecha).toLocaleString('es-CR')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add note */}
              <div className="flex gap-2">
                <input className="tech-input flex-1 rounded-lg px-3 py-2 text-sm"
                  placeholder="Agregar nota al historial..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNote(selectedTicket)}
                />
                <button className="btn-primary" onClick={() => addNote(selectedTicket)}>
                  <Plus size={16} /> Nota
                </button>
              </div>

              {/* Quick status change */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-500">Cambiar estado:</span>
                {(['abierto','en_proceso','esperando_cliente','resuelto','cerrado'] as EstadoTicket[]).map(est => (
                  <button key={est}
                    className={`text-xs px-2 py-1 rounded-full transition-all ${selectedTicket.estado === est ? estadoColor[est] : 'badge-neutral opacity-50 hover:opacity-100'}`}
                    onClick={() => { updateTicket(selectedTicket.id, { estado: est }); setSelectedTicket({ ...selectedTicket, estado: est }); }}>
                    {est.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etiqueta Modal */}
      {showEtiqueta && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowEtiqueta(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><Tag size={16} className="text-amber-400" />Etiqueta — {showEtiqueta.numero}</h2>
              <button onClick={() => setShowEtiqueta(null)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors"><X size={18} /></button>
            </div>
            <pre className="font-mono text-xs text-emerald-400 p-4 rounded-lg overflow-auto"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(16,185,129,0.2)' }}>
              {generateEtiqueta(showEtiqueta)}
            </pre>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" onClick={() => {
                navigator.clipboard?.writeText(generateEtiqueta(showEtiqueta));
              }}>
                Copiar Etiqueta
              </button>
              <button className="btn-ghost" onClick={() => setShowEtiqueta(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editing ? 'Editar Ticket' : 'Nuevo Ticket'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Tipo *</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoTicket }))}>
                    <option value="soporte">Soporte Técnico</option>
                    <option value="rma">RMA con Marca</option>
                    <option value="reparacion">Reparación</option>
                    <option value="garantia">Garantía</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Prioridad</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.prioridad} onChange={e => setForm(f => ({ ...f, prioridad: e.target.value as PrioridadTicket }))}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Cliente / Contacto *</label>
                <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                  value={form.contactoId} onChange={e => setForm(f => ({ ...f, contactoId: e.target.value }))}>
                  <option value="">— Seleccione un contacto —</option>
                  {contactos.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} — {c.empresa}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Título *</label>
                <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                  placeholder="Descripción corta del problema..."
                  value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Descripción</label>
                <textarea className="tech-input w-full rounded-lg px-3 py-2.5 text-sm resize-none" rows={3}
                  placeholder="Descripción detallada del problema, pasos reproducción..."
                  value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Marca</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}>
                    <option value="">— Seleccione —</option>
                    {marcas.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Modelo</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    placeholder="Modelo del equipo..." value={form.modelo}
                    onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">N° de Serie</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm font-mono"
                    placeholder="S/N..." value={form.serie}
                    onChange={e => setForm(f => ({ ...f, serie: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Estado</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as EstadoTicket }))}>
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="esperando_cliente">Esperando Cliente</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Asignado a</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.asignadoA} onChange={e => setForm(f => ({ ...f, asignadoA: e.target.value }))}>
                    <option value="">— Sin asignar —</option>
                    {users.filter(u => u.rol === 'soporte' || u.rol === 'admin').map(u => (
                      <option key={u.id} value={`${u.nombre} ${u.apellido}`}>{u.nombre} {u.apellido}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(form.tipo === 'garantia') && (
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">RMA Relacionado (migración)</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.rmaRelacionadoId} onChange={e => setForm(f => ({ ...f, rmaRelacionadoId: e.target.value }))}>
                    <option value="">— Sin RMA relacionado —</option>
                    {tickets.filter(t => t.tipo === 'rma').map(r => <option key={r.id} value={r.id}>{r.numero} — {r.titulo}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Notas Internas</label>
                <textarea className="tech-input w-full rounded-lg px-3 py-2.5 text-sm resize-none" rows={2}
                  value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-blue-900/30">
                <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={16} />Cancelar</button>
                <button className="btn-warning" onClick={handleSave}><Save size={16} />Guardar Ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
