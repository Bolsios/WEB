import { useState } from 'react';
import { Plus, Edit2, Eye, FileText, ClipboardList, ShoppingCart, Filter, Search } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import DocumentForm from './DocumentForm';
import type { Documento } from '../../types';

interface Props {
  tipo: 'factura' | 'cotizacion' | 'orden_compra';
}

const estadoColor: Record<string, string> = {
  borrador: 'badge-neutral', enviado: 'badge-info', aprobado: 'badge-active',
  rechazado: 'badge-danger', pagado: 'badge-active', cancelado: 'badge-danger',
};

const tipoConfig = {
  factura: { label: 'Facturas', icon: <FileText size={18} />, prefix: 'FAC' },
  cotizacion: { label: 'Cotizaciones', icon: <ClipboardList size={18} />, prefix: 'COT' },
  orden_compra: { label: 'Órdenes de Compra', icon: <ShoppingCart size={18} />, prefix: 'OC' },
};

export default function BillingModule({ tipo }: Props) {
  const { documentos } = useStoreContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Documento | undefined>();
  const [viewing, setViewing] = useState<Documento | undefined>();
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const config = tipoConfig[tipo];
  const docs = documentos.filter(d => d.tipo === tipo);

  const filtered = docs.filter(d => {
    const matchSearch = d.numero.toLowerCase().includes(search.toLowerCase()) ||
      d.contactoNombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado ? d.estado === filterEstado : true;
    return matchSearch && matchEstado;
  });

  const totalDocs = docs.reduce((s, d) => s + d.total, 0);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{config.label}</h1>
            <p className="text-xs text-slate-500">{docs.length} documentos • Total: ₡{totalDocs.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <button className="btn-warning" onClick={() => { setEditing(undefined); setShowForm(true); }}>
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
          <input
            className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            className="tech-input rounded-lg px-3 py-2.5 text-sm"
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="borrador">Borrador</option>
            <option value="enviado">Enviado</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
            <option value="pagado">Pagado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="section-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full tech-table">
            <thead>
              <tr>
                <th className="text-left">Número</th>
                <th className="text-left">Cliente</th>
                <th className="text-left">Fecha</th>
                <th className="text-right">Subtotal</th>
                <th className="text-right">IVA 13%</th>
                <th className="text-right">Total</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <FileText size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#94a3b8' }} />
                    <p className="text-slate-500 text-sm">No hay {config.label.toLowerCase()} registradas</p>
                    <button className="btn-warning mt-3 text-xs" onClick={() => setShowForm(true)}>
                      <Plus size={14} /> Crear el primero
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map(doc => (
                  <tr key={doc.id}>
                    <td className="font-mono font-bold text-amber-400 text-xs">{doc.numero}</td>
                    <td>
                      <div className="text-sm text-white font-medium truncate max-w-48">{doc.contactoNombre}</div>
                    </td>
                    <td className="text-xs text-slate-400">{new Date(doc.fecha).toLocaleDateString('es-CR')}</td>
                    <td className="text-right text-sm text-slate-300">
                      ₡{doc.subtotal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-sm text-amber-400">
                      ₡{doc.iva.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right text-sm font-bold text-emerald-400">
                      ₡{doc.total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[doc.estado]}`}>
                        {doc.estado}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewing(doc)}
                          className="p-1.5 rounded hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => { setEditing(doc); setShowForm(true); }}
                          className="p-1.5 rounded hover:bg-amber-900/30 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewing(undefined)}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">{viewing.numero}</h2>
                <p className="text-xs text-slate-500">{tipoConfig[viewing.tipo]?.label} • {new Date(viewing.fecha).toLocaleDateString('es-CR')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-3 py-1 rounded-full ${estadoColor[viewing.estado]}`}>{viewing.estado}</span>
                <button onClick={() => setViewing(undefined)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                  <Eye size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'rgba(15,22,35,0.8)', border: '1px solid rgba(30,58,95,0.3)' }}>
                  <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Cliente</div>
                  <div className="text-sm text-white font-medium">{viewing.contactoNombre}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(15,22,35,0.8)', border: '1px solid rgba(30,58,95,0.3)' }}>
                  <div className="text-xs text-amber-400 uppercase tracking-wider mb-1">Vencimiento</div>
                  <div className="text-sm text-white">{viewing.fechaVencimiento ? new Date(viewing.fechaVencimiento).toLocaleDateString('es-CR') : 'N/A'}</div>
                </div>
              </div>

              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(30,58,95,0.4)' }}>
                <table className="w-full tech-table">
                  <thead>
                    <tr>
                      <th className="text-left">Código</th>
                      <th className="text-left">Descripción</th>
                      <th className="text-center">Cant.</th>
                      <th className="text-right">P.Unit.</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewing.lineas.map(l => (
                      <tr key={l.id}>
                        <td className="font-mono text-xs text-amber-400">{l.codigo}</td>
                        <td className="text-xs">{l.descripcion}</td>
                        <td className="text-center text-sm">{l.cantidad}</td>
                        <td className="text-right text-sm">₡{l.precioUnitario.toFixed(2)}</td>
                        <td className="text-right text-sm font-bold text-emerald-400">₡{l.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="space-y-2 min-w-56">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal (sin IVA)</span>
                    <span className="text-white font-semibold">₡{viewing.subtotal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">IVA 13%</span>
                    <span className="text-amber-400 font-semibold">₡{viewing.iva.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold p-2 rounded"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-white">TOTAL</span>
                    <span className="text-emerald-400">₡{viewing.total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {viewing.notas && (
                <div className="p-3 rounded-lg text-sm text-slate-400"
                  style={{ background: 'rgba(15,22,35,0.8)', border: '1px solid rgba(30,58,95,0.3)' }}>
                  <span className="text-amber-400 font-semibold">Notas: </span>{viewing.notas}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <DocumentForm
          tipo={tipo}
          existing={editing}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
