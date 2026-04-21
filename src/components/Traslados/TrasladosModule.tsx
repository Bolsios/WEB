import { useState } from 'react';
import { Plus, X, Check, AlertTriangle, ArrowLeftRight, ClipboardCheck, Search, Package } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { Traslado, Tienda, LineaDocumento } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const tiendas: Tienda[] = ['TiendaA', 'TiendaB', 'TiendaC'];
const tiendaLabels: Record<Tienda, string> = {
  TiendaA: 'Tienda A - San José',
  TiendaB: 'Tienda B - Alajuela',
  TiendaC: 'Tienda C - Heredia',
};

const estadoColor: Record<string, string> = {
  pendiente: 'badge-warning',
  aprobado: 'badge-info',
  rechazado: 'badge-danger',
  en_transito: 'badge-orange',
  recibido: 'badge-active',
};

export default function TrasladosModule() {
  const { traslados, addTraslado, updateTraslado, getNextNumero, productos, currentUser, documentos } = useStoreContext();
  const [tab, setTab] = useState<'lista' | 'nuevo' | 'aprobacion' | 'recepcion'>('lista');
  const [selectedTraslado, setSelectedTraslado] = useState<Traslado | null>(null);

  // Form state
  const [origen, setOrigen] = useState<Tienda>('TiendaA');
  const [destino, setDestino] = useState<Tienda>('TiendaB');
  const [lineas, setLineas] = useState<LineaDocumento[]>([]);
  const [notas, setNotas] = useState('');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [showProdDropdown, setShowProdDropdown] = useState(false);
  const [numeroOrden, setNumeroOrden] = useState('');

  // Recepcion form
  const [recibidoPor, setRecibidoPor] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const productosFiltrados = productos.filter(p =>
    p.codigo.toLowerCase().includes(codigoBusqueda.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(codigoBusqueda.toLowerCase())
  ).slice(0, 6);

  const agregarLinea = (p: typeof productos[0]) => {
    const existe = lineas.find(l => l.productoId === p.id);
    if (existe) {
      setLineas(prev => prev.map(l => l.productoId === p.id
        ? { ...l, cantidad: l.cantidad + 1, subtotal: (l.cantidad + 1) * l.precioUnitario }
        : l
      ));
    } else {
      setLineas(prev => [...prev, {
        id: uuidv4(), productoId: p.id, codigo: p.codigo,
        descripcion: p.descripcion, cantidad: 1,
        precioUnitario: p.precioUnitario, subtotal: p.precioUnitario
      }]);
    }
    setCodigoBusqueda('');
    setShowProdDropdown(false);
  };

  const handleSubmitTraslado = () => {
    if (origen === destino) { alert('El origen y destino no pueden ser iguales'); return; }
    if (lineas.length === 0) { alert('Agregue al menos un producto'); return; }

    addTraslado({
      numero: getNextNumero('TRL', traslados),
      origen, destino,
      solicitanteId: currentUser.id,
      solicitanteNombre: `${currentUser.nombre} ${currentUser.apellido}`,
      lineas,
      estado: 'pendiente',
      motivoRechazo: '',
      aprobadoPor: '',
      fechaAprobacion: '',
      recibidoPor: '',
      fechaRecepcion: '',
      numeroOrdenRelacionada: numeroOrden,
      notas,
    });
    setLineas([]);
    setNotas('');
    setNumeroOrden('');
    setTab('lista');
  };

  const aprobarTraslado = (t: Traslado) => {
    updateTraslado(t.id, {
      estado: 'aprobado',
      aprobadoPor: `${currentUser.nombre} ${currentUser.apellido}`,
      fechaAprobacion: new Date().toISOString(),
    });
  };

  const rechazarTraslado = (t: Traslado) => {
    if (!motivoRechazo) { alert('Ingrese el motivo de rechazo'); return; }
    updateTraslado(t.id, { estado: 'rechazado', motivoRechazo });
    setMotivoRechazo('');
    setSelectedTraslado(null);
  };

  const confirmarRecepcion = (t: Traslado) => {
    if (!recibidoPor) { alert('Ingrese el nombre de quien recibe'); return; }
    updateTraslado(t.id, {
      estado: 'recibido',
      recibidoPor,
      fechaRecepcion: new Date().toISOString(),
    });
    setRecibidoPor('');
    setSelectedTraslado(null);
  };

  const pendientes = traslados.filter(t => t.estado === 'pendiente');
  const aprobados = traslados.filter(t => t.estado === 'aprobado');
  const ordenesRelacionables = documentos.filter(d => d.tipo === 'orden_compra');

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Traslados entre Tiendas</h1>
            <p className="text-xs text-slate-500">{traslados.length} traslados • {pendientes.length} pendientes de aprobación</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['pendiente','aprobado','en_transito','recibido','rechazado'] as const).map(est => (
          <div key={est} className="p-3 rounded-lg text-center"
            style={{ background: 'rgba(15,22,35,0.8)', border: '1px solid rgba(30,58,95,0.3)' }}>
            <div className="text-xl font-black text-white">{traslados.filter(t => t.estado === est).length}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[est]}`}>{est.replace('_',' ')}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-blue-900/30 pb-0">
        {[
          { key: 'lista', label: 'Todos los Traslados', icon: <ArrowLeftRight size={14} /> },
          { key: 'nuevo', label: 'Nueva Solicitud', icon: <Plus size={14} /> },
          { key: 'aprobacion', label: `Aprobación (${pendientes.length})`, icon: <Check size={14} /> },
          { key: 'recepcion', label: `Recepción (${aprobados.length})`, icon: <ClipboardCheck size={14} /> },
        ].map(t => (
          <button key={t.key}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              tab === t.key
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setTab(t.key as any)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Lista */}
      {tab === 'lista' && (
        <div className="section-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full tech-table">
              <thead>
                <tr>
                  <th className="text-left">Número</th>
                  <th className="text-left">Origen → Destino</th>
                  <th className="text-left">Solicitante</th>
                  <th className="text-left">Productos</th>
                  <th className="text-center">Estado</th>
                  <th className="text-left">Fecha</th>
                  <th className="text-left">Recibido Por</th>
                </tr>
              </thead>
              <tbody>
                {traslados.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No hay traslados registrados</td></tr>
                ) : (
                  traslados.slice().reverse().map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs text-amber-400">{t.numero}</td>
                      <td className="text-xs">
                        <span className="text-blue-400">{t.origen.replace('Tienda', 'T.')}</span>
                        <span className="text-slate-600 mx-1">→</span>
                        <span className="text-emerald-400">{t.destino.replace('Tienda', 'T.')}</span>
                      </td>
                      <td className="text-xs text-slate-300">{t.solicitanteNombre}</td>
                      <td className="text-xs text-slate-400">{t.lineas.length} ítem(s)</td>
                      <td className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[t.estado]}`}>
                          {t.estado.replace('_',' ')}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('es-CR')}</td>
                      <td className="text-xs text-slate-400">{t.recibidoPor || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Nueva Solicitud */}
      {tab === 'nuevo' && (
        <div className="section-card space-y-5">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <Plus size={14} /> Formulario de Solicitud de Traslado
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Tienda Origen *</label>
              <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={origen} onChange={e => setOrigen(e.target.value as Tienda)}>
                {tiendas.map(t => <option key={t} value={t}>{tiendaLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Tienda Destino *</label>
              <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={destino} onChange={e => setDestino(e.target.value as Tienda)}>
                {tiendas.filter(t => t !== origen).map(t => <option key={t} value={t}>{tiendaLabels[t]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Orden de Compra Relacionada (opcional)</label>
            <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
              value={numeroOrden} onChange={e => setNumeroOrden(e.target.value)}>
              <option value="">— Sin orden relacionada —</option>
              {ordenesRelacionables.map(o => <option key={o.id} value={o.numero}>{o.numero} — {o.contactoNombre}</option>)}
            </select>
          </div>

          {/* Productos */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Productos a Trasladar *</label>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
              <input
                className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
                placeholder="Buscar producto por código o descripción..."
                value={codigoBusqueda}
                onChange={e => { setCodigoBusqueda(e.target.value); setShowProdDropdown(true); }}
                onFocus={() => setShowProdDropdown(true)}
              />
              {showProdDropdown && codigoBusqueda && productosFiltrados.length > 0 && (
                <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden shadow-2xl"
                  style={{ background: '#0d1b2e', border: '1px solid rgba(30,58,95,0.6)' }}>
                  {productosFiltrados.map(p => (
                    <button key={p.id}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-900/30 transition-colors flex items-center justify-between"
                      onClick={() => agregarLinea(p)}>
                      <div>
                        <div className="text-xs font-mono text-amber-400">{p.codigo}</div>
                        <div className="text-sm text-white">{p.descripcion}</div>
                      </div>
                      <div className="text-xs text-slate-400">Stock {origen.replace('Tienda','T')}: {p[origen.toLowerCase().replace('tienda', 'tienda') as 'tiendaA' | 'tiendaB' | 'tiendaC'] || p.stock}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(30,58,95,0.4)' }}>
              <table className="w-full tech-table">
                <thead>
                  <tr>
                    <th className="text-left">Código</th>
                    <th className="text-left">Descripción</th>
                    <th className="text-center">Cantidad</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-slate-500 text-sm">Busque productos para agregar</td></tr>
                  ) : lineas.map(l => (
                    <tr key={l.id}>
                      <td className="font-mono text-xs text-amber-400">{l.codigo}</td>
                      <td className="text-xs text-slate-300">{l.descripcion}</td>
                      <td className="text-center">
                        <input type="number" min="1"
                          className="tech-input w-16 text-center rounded px-1 py-1 text-sm"
                          value={l.cantidad}
                          onChange={e => setLineas(prev => prev.map(item =>
                            item.id === l.id ? { ...item, cantidad: Number(e.target.value) } : item
                          ))}
                        />
                      </td>
                      <td className="text-center">
                        <button onClick={() => setLineas(prev => prev.filter(item => item.id !== l.id))}
                          className="p-1 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors">
                          <X size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Notas</label>
            <textarea className="tech-input w-full rounded-lg px-3 py-2.5 text-sm resize-none" rows={2}
              placeholder="Motivo del traslado, instrucciones especiales..."
              value={notas} onChange={e => setNotas(e.target.value)} />
          </div>

          <div className="flex justify-end gap-3">
            <button className="btn-ghost" onClick={() => setTab('lista')}><X size={16} />Cancelar</button>
            <button className="btn-warning" onClick={handleSubmitTraslado}><ArrowLeftRight size={16} />Enviar Solicitud</button>
          </div>
        </div>
      )}

      {/* Tab: Aprobación */}
      {tab === 'aprobacion' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <Check size={14} /> Panel de Aprobación — {pendientes.length} pendiente(s)
          </h2>
          {pendientes.length === 0 ? (
            <div className="section-card text-center py-10">
              <Check size={40} className="mx-auto mb-3 text-emerald-400 opacity-50" />
              <p className="text-slate-400 text-sm">No hay traslados pendientes de aprobación</p>
            </div>
          ) : pendientes.map(t => (
            <div key={t.id} className="section-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{t.numero}</span>
                    <span className="badge-warning text-xs px-2 py-0.5 rounded-full">Pendiente</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    <span className="text-blue-400">{tiendaLabels[t.origen]}</span>
                    <span className="text-slate-500 mx-2">→</span>
                    <span className="text-emerald-400">{tiendaLabels[t.destino]}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Solicitado por: {t.solicitanteNombre} — {new Date(t.createdAt).toLocaleString('es-CR')}</div>
                  {t.numeroOrdenRelacionada && (
                    <div className="text-xs text-blue-400 mt-0.5">Orden relacionada: {t.numeroOrdenRelacionada}</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(30,58,95,0.3)' }}>
                <table className="w-full tech-table">
                  <thead><tr><th className="text-left">Código</th><th className="text-left">Descripción</th><th className="text-center">Cant.</th></tr></thead>
                  <tbody>
                    {t.lineas.map(l => (
                      <tr key={l.id}>
                        <td className="font-mono text-xs text-amber-400">{l.codigo}</td>
                        <td className="text-xs text-slate-300">{l.descripcion}</td>
                        <td className="text-center text-sm">{l.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {t.notas && <div className="text-xs text-slate-400 italic">Notas: {t.notas}</div>}

              <div className="flex items-center gap-3 flex-wrap">
                <button className="btn-primary flex items-center gap-2" onClick={() => aprobarTraslado(t)}>
                  <Check size={16} /> Aprobar Traslado
                </button>
                {selectedTraslado?.id === t.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      className="tech-input flex-1 rounded-lg px-3 py-2 text-sm"
                      placeholder="Motivo de rechazo..."
                      value={motivoRechazo}
                      onChange={e => setMotivoRechazo(e.target.value)}
                    />
                    <button className="btn-danger" onClick={() => rechazarTraslado(t)}>
                      <X size={16} /> Confirmar Rechazo
                    </button>
                  </div>
                ) : (
                  <button className="btn-danger" onClick={() => setSelectedTraslado(t)}>
                    <X size={16} /> Rechazar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Recepción */}
      {tab === 'recepcion' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <ClipboardCheck size={14} /> Panel de Confirmación de Recepción
          </h2>
          {aprobados.length === 0 ? (
            <div className="section-card text-center py-10">
              <Package size={40} className="mx-auto mb-3 text-blue-400 opacity-50" />
              <p className="text-slate-400 text-sm">No hay traslados aprobados pendientes de recepción</p>
            </div>
          ) : aprobados.map(t => (
            <div key={t.id} className="section-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{t.numero}</span>
                    <span className="badge-info text-xs px-2 py-0.5 rounded-full">Aprobado</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    <span className="text-blue-400">{tiendaLabels[t.origen]}</span>
                    <span className="text-slate-500 mx-2">→</span>
                    <span className="text-emerald-400">{tiendaLabels[t.destino]}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Aprobado por: {t.aprobadoPor}</div>
                  {t.numeroOrdenRelacionada && (
                    <div className="text-xs text-blue-400 mt-0.5">Pedido relacionado: #{t.numeroOrdenRelacionada}</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(30,58,95,0.3)' }}>
                <table className="w-full tech-table">
                  <thead><tr><th className="text-left">Código</th><th className="text-left">Descripción</th><th className="text-center">Cant.</th></tr></thead>
                  <tbody>
                    {t.lineas.map(l => (
                      <tr key={l.id}>
                        <td className="font-mono text-xs text-amber-400">{l.codigo}</td>
                        <td className="text-xs">{l.descripcion}</td>
                        <td className="text-center">{l.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Formulario de recepción */}
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardCheck size={13} /> Confirmación de Recepción
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nombre de quien recibe *</label>
                  <input
                    className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    placeholder="Nombre completo del receptor..."
                    value={selectedTraslado?.id === t.id ? recibidoPor : ''}
                    onChange={e => { setSelectedTraslado(t); setRecibidoPor(e.target.value); }}
                    onFocus={() => setSelectedTraslado(t)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-400" />
                    La fecha y hora de recepción se registrarán automáticamente al confirmar
                    <span className="text-amber-400 font-mono">{new Date().toLocaleString('es-CR')}</span>
                  </div>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => confirmarRecepcion(t)}
                  >
                    <ClipboardCheck size={16} /> Confirmar Recepción
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
