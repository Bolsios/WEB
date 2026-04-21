import { useState } from 'react';
import { X, Plus, Trash2, Search, FileText, Save } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { Documento, LineaDocumento } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  tipo: 'factura' | 'cotizacion' | 'orden_compra';
  onClose: () => void;
  existing?: Documento;
}

const IVA_RATE = 0.13;

export default function DocumentForm({ tipo, onClose, existing }: Props) {
  const { contactos, productos, addDocumento, updateDocumento, getNextNumero, documentos } = useStoreContext();

  const [contactoId, setContactoId] = useState(existing?.contactoId || '');
  const [contactoBusqueda, setContactoBusqueda] = useState('');
  const [fecha, setFecha] = useState(existing?.fecha || new Date().toISOString().split('T')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState(existing?.fechaVencimiento || '');
  const [lineas, setLineas] = useState<LineaDocumento[]>(existing?.lineas || []);
  const [estado, setEstado] = useState<'borrador'|'enviado'|'aprobado'|'rechazado'|'pagado'|'cancelado'>(existing?.estado || 'borrador');
  const [notas, setNotas] = useState(existing?.notas || '');
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [showContactoDropdown, setShowContactoDropdown] = useState(false);
  const [showProductoDropdown, setShowProductoDropdown] = useState(false);

  const tipoLabels = { factura: 'Factura', cotizacion: 'Cotización', orden_compra: 'Orden de Compra' };
  const prefix = { factura: 'FAC', cotizacion: 'COT', orden_compra: 'OC' };

  const contactoSeleccionado = contactos.find(c => c.id === contactoId);
  const contactosFiltrados = contactos.filter(c =>
    c.nombre.toLowerCase().includes(contactoBusqueda.toLowerCase()) ||
    c.empresa.toLowerCase().includes(contactoBusqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(contactoBusqueda.toLowerCase())
  );

  const productosFiltrados = productos.filter(p =>
    p.codigo.toLowerCase().includes(codigoBusqueda.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(codigoBusqueda.toLowerCase())
  ).slice(0, 8);

  const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const agregarLinea = (producto: typeof productos[0]) => {
    const existe = lineas.find(l => l.productoId === producto.id);
    if (existe) {
      setLineas(prev => prev.map(l =>
        l.productoId === producto.id
          ? { ...l, cantidad: l.cantidad + 1, subtotal: (l.cantidad + 1) * l.precioUnitario }
          : l
      ));
    } else {
      const nueva: LineaDocumento = {
        id: uuidv4(),
        productoId: producto.id,
        codigo: producto.codigo,
        descripcion: producto.descripcion,
        cantidad: 1,
        precioUnitario: producto.precioUnitario,
        subtotal: producto.precioUnitario
      };
      setLineas(prev => [...prev, nueva]);
    }
    setCodigoBusqueda('');
    setShowProductoDropdown(false);
  };

  const actualizarLinea = (id: string, field: 'cantidad' | 'precioUnitario', value: number) => {
    setLineas(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      updated.subtotal = updated.cantidad * updated.precioUnitario;
      return updated;
    }));
  };

  const eliminarLinea = (id: string) => {
    setLineas(prev => prev.filter(l => l.id !== id));
  };

  const handleSave = () => {
    if (!contactoId) { alert('Seleccione un contacto'); return; }
    if (lineas.length === 0) { alert('Agregue al menos una línea'); return; }

    const docData: Omit<Documento, 'id' | 'createdAt'> = {
      tipo,
      numero: existing?.numero || getNextNumero(prefix[tipo], documentos),
      contactoId,
      contactoNombre: contactoSeleccionado ? `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido} - ${contactoSeleccionado.empresa}` : '',
      fecha,
      fechaVencimiento,
      lineas,
      subtotal,
      iva,
      total,
      estado: estado as any,
      notas,
    };

    if (existing) {
      updateDocumento(existing.id, docData);
    } else {
      addDocumento(docData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {existing ? 'Editar' : 'Nuevo'} {tipoLabels[tipo]}
              </h2>
              {existing && <p className="text-xs text-amber-400 font-mono">{existing.numero}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Contacto y fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contacto */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">
                Cliente / Contacto *
              </label>
              {contactoSeleccionado ? (
                <div className="tech-input rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{contactoSeleccionado.nombre} {contactoSeleccionado.apellido}</div>
                    <div className="text-xs text-slate-400">{contactoSeleccionado.empresa} • {contactoSeleccionado.email}</div>
                  </div>
                  <button onClick={() => { setContactoId(''); setContactoBusqueda(''); }} className="text-slate-500 hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
                    placeholder="Buscar por nombre, empresa, email..."
                    value={contactoBusqueda}
                    onChange={e => { setContactoBusqueda(e.target.value); setShowContactoDropdown(true); }}
                    onFocus={() => setShowContactoDropdown(true)}
                  />
                  {showContactoDropdown && contactosFiltrados.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden shadow-2xl"
                      style={{ background: '#0d1b2e', border: '1px solid rgba(30,58,95,0.6)' }}>
                      {contactosFiltrados.slice(0, 5).map(c => (
                        <button key={c.id}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-900/30 transition-colors"
                          onClick={() => { setContactoId(c.id); setContactoBusqueda(''); setShowContactoDropdown(false); }}>
                          <div className="text-sm text-white font-medium">{c.nombre} {c.apellido}</div>
                          <div className="text-xs text-slate-500">{c.empresa} • RUC: {c.ruc}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Estado</label>
              <select
                className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={estado}
                onChange={e => setEstado(e.target.value as any)}
              >
                <option value="borrador">Borrador</option>
                <option value="enviado">Enviado</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="pagado">Pagado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Fecha</label>
              <input type="date" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Fecha Vencimiento</label>
              <input type="date" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} />
            </div>
          </div>

          {/* Líneas de productos */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Líneas de Productos *
            </label>

            {/* Buscar producto */}
            <div className="relative mb-3">
              <Plus size={14} className="absolute left-3 top-3.5 text-slate-500" />
              <input
                className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
                placeholder="Buscar por código o descripción para agregar..."
                value={codigoBusqueda}
                onChange={e => { setCodigoBusqueda(e.target.value); setShowProductoDropdown(true); }}
                onFocus={() => setShowProductoDropdown(true)}
              />
              {showProductoDropdown && codigoBusqueda && productosFiltrados.length > 0 && (
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
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">₡{p.precioUnitario.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">Stock: {p.stock}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabla de líneas */}
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(30,58,95,0.4)' }}>
              <table className="w-full tech-table">
                <thead>
                  <tr>
                    <th className="text-left">Código</th>
                    <th className="text-left">Descripción</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-right">P. Unit.</th>
                    <th className="text-right">Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lineas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        Busque y agregue productos arriba
                      </td>
                    </tr>
                  ) : (
                    lineas.map(linea => (
                      <tr key={linea.id}>
                        <td className="font-mono text-xs text-amber-400">{linea.codigo}</td>
                        <td className="text-xs">{linea.descripcion}</td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="1"
                            className="tech-input w-16 text-center rounded px-1 py-1 text-sm"
                            value={linea.cantidad}
                            onChange={e => actualizarLinea(linea.id, 'cantidad', Number(e.target.value))}
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="tech-input w-24 text-right rounded px-1 py-1 text-sm"
                            value={linea.precioUnitario}
                            onChange={e => actualizarLinea(linea.id, 'precioUnitario', Number(e.target.value))}
                          />
                        </td>
                        <td className="text-right font-bold text-emerald-400">
                          ₡{linea.subtotal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-center">
                          <button onClick={() => eliminarLinea(linea.id)}
                            className="p-1 rounded hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="flex justify-end mt-4">
              <div className="space-y-2 min-w-64">
                <div className="flex justify-between items-center py-1.5 border-b border-blue-900/30">
                  <span className="text-sm text-slate-400">Subtotal (sin IVA)</span>
                  <span className="text-sm font-semibold text-white">₡{subtotal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-blue-900/30">
                  <span className="text-sm text-slate-400">IVA (13%)</span>
                  <span className="text-sm font-semibold text-amber-400">₡{iva.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-2 rounded-lg px-3"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span className="text-base font-bold text-white">TOTAL</span>
                  <span className="text-lg font-black text-emerald-400">₡{total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Notas</label>
            <textarea
              className="tech-input w-full rounded-lg px-3 py-2.5 text-sm resize-none"
              rows={2}
              placeholder="Notas adicionales, términos, condiciones..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-blue-900/30">
            <button className="btn-ghost" onClick={onClose}><X size={16} />Cancelar</button>
            <button className="btn-warning" onClick={handleSave}><Save size={16} />Guardar {tipoLabels[tipo]}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
