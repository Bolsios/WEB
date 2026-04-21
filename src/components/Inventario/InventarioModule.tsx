import { useState } from 'react';
import { Plus, X, Edit2, Package, AlertTriangle, TrendingUp, TrendingDown, Search, Save } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { Producto } from '../../types';

const categorias = ['Cámaras IP', 'Grabadores', 'Networking', 'Control de Acceso', 'Cableado', 'Accesorios', 'Alarmas', 'Drones', 'Otros'];
const marcas = ['Dahua', 'Hikvision', 'Ubiquiti', 'TP-Link', 'Panduit', 'ZKTeco', 'Axis', 'Bosch', 'Genérico', 'Otro'];

interface ProductoFormData {
  codigo: string; descripcion: string; categoria: string; marca: string;
  precioUnitario: number; stock: number; stockMinimo: number; ubicacion: string;
  tiendaA: number; tiendaB: number; tiendaC: number; activo: boolean;
}

const emptyForm: ProductoFormData = {
  codigo: '', descripcion: '', categoria: 'Cámaras IP', marca: 'Dahua',
  precioUnitario: 0, stock: 0, stockMinimo: 5, ubicacion: '',
  tiendaA: 0, tiendaB: 0, tiendaC: 0, activo: true,
};

export default function InventarioModule() {
  const { productos, addProducto, updateProducto, movimientos, addMovimiento, currentUser } = useStoreContext();
  const [tab, setTab] = useState<'productos' | 'movimientos' | 'ajuste'>('productos');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoFormData>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Movimiento form
  const [movTipo, setMovTipo] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [movProductoId, setMovProductoId] = useState('');
  const [movCantidad, setMovCantidad] = useState(0);
  const [movTienda, setMovTienda] = useState<'TiendaA' | 'TiendaB' | 'TiendaC'>('TiendaA');
  const [movReferencia, setMovReferencia] = useState('');
  const [movNotas, setMovNotas] = useState('');
  const [movSearch, setMovSearch] = useState('');

  const filtrados = productos.filter(p => {
    const matchSearch = p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      p.marca.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.categoria === filterCat : true;
    return matchSearch && matchCat;
  });

  const openNew = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({
      codigo: p.codigo, descripcion: p.descripcion, categoria: p.categoria,
      marca: p.marca, precioUnitario: p.precioUnitario, stock: p.stock,
      stockMinimo: p.stockMinimo, ubicacion: p.ubicacion,
      tiendaA: p.tiendaA, tiendaB: p.tiendaB, tiendaC: p.tiendaC, activo: p.activo,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.codigo || !form.descripcion) { alert('Código y descripción son requeridos'); return; }
    if (editing) {
      updateProducto(editing.id, form);
    } else {
      addProducto(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleMovimiento = () => {
    if (!movProductoId) { alert('Seleccione un producto'); return; }
    if (movCantidad <= 0) { alert('La cantidad debe ser mayor a 0'); return; }

    const prod = productos.find(p => p.id === movProductoId);
    if (!prod) return;

    addMovimiento({
      productoId: movProductoId,
      productoCodigo: prod.codigo,
      productoDescripcion: prod.descripcion,
      tipo: movTipo,
      cantidad: movCantidad,
      tienda: movTienda,
      referencia: movReferencia,
      usuario: `${currentUser.nombre} ${currentUser.apellido}`,
      notas: movNotas,
    });

    // Update stock
    const delta = movTipo === 'entrada' ? movCantidad : movTipo === 'salida' ? -movCantidad : (movCantidad - prod.stock);
    updateProducto(movProductoId, { stock: Math.max(0, prod.stock + delta) });

    setMovProductoId('');
    setMovCantidad(0);
    setMovReferencia('');
    setMovNotas('');
    setMovSearch('');
  };

  const totalValor = productos.reduce((s, p) => s + p.stock * p.precioUnitario, 0);
  const bajoMinimo = productos.filter(p => p.stock <= p.stockMinimo);
  const movsFiltrados = movimientos.filter(m =>
    m.productoCodigo.toLowerCase().includes(movSearch.toLowerCase()) ||
    m.productoDescripcion.toLowerCase().includes(movSearch.toLowerCase())
  );

  const movProd = productos.find(p => p.id === movProductoId);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(30,58,95,0.5)', color: '#f59e0b' }}>
            <Package size={18} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Gestión de Inventario</h1>
            <p className="text-xs text-slate-500">{productos.length} productos • Valor total: ₡{totalValor.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <button className="btn-warning" onClick={openNew}><Plus size={16} />Nuevo Producto</button>
      </div>

      {/* Alert */}
      {bajoMinimo.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={18} className="text-red-400" />
          <span className="text-sm text-red-400 font-semibold">{bajoMinimo.length} producto(s) bajo el stock mínimo:</span>
          <span className="text-xs text-slate-400">{bajoMinimo.map(p => p.codigo).join(', ')}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-blue-900/30">
        {[
          { key: 'productos', label: 'Catálogo', icon: <Package size={14} /> },
          { key: 'movimientos', label: `Movimientos (${movimientos.length})`, icon: <TrendingUp size={14} /> },
          { key: 'ajuste', label: 'Entradas / Salidas / Ajustes', icon: <TrendingDown size={14} /> },
        ].map(t => (
          <button key={t.key}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              tab === t.key ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
            onClick={() => setTab(t.key as any)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Productos Tab */}
      {tab === 'productos' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
              <input className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
                placeholder="Buscar por código, descripción o marca..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="tech-input rounded-lg px-3 py-2.5 text-sm"
              value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="section-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full tech-table">
                <thead>
                  <tr>
                    <th className="text-left">Código</th>
                    <th className="text-left">Descripción</th>
                    <th className="text-left">Cat. / Marca</th>
                    <th className="text-right">Precio Unit.</th>
                    <th className="text-center">Stock Total</th>
                    <th className="text-center">T.A</th>
                    <th className="text-center">T.B</th>
                    <th className="text-center">T.C</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-10 text-slate-500">No hay productos</td></tr>
                  ) : filtrados.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs text-amber-400 font-bold">{p.codigo}</td>
                      <td>
                        <div className="text-sm text-white">{p.descripcion}</div>
                        <div className="text-xs text-slate-500">{p.ubicacion}</div>
                      </td>
                      <td>
                        <div className="text-xs text-slate-300">{p.categoria}</div>
                        <div className="text-xs text-slate-500">{p.marca}</div>
                      </td>
                      <td className="text-right text-sm font-bold text-emerald-400">
                        ₡{p.precioUnitario.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center">
                        <span className={`text-sm font-bold ${p.stock <= p.stockMinimo ? 'text-red-400' : 'text-white'}`}>
                          {p.stock}
                        </span>
                        {p.stock <= p.stockMinimo && <AlertTriangle size={10} className="inline text-red-400 ml-1" />}
                        <div className="text-xs text-slate-600">min: {p.stockMinimo}</div>
                      </td>
                      <td className="text-center text-sm text-blue-400">{p.tiendaA}</td>
                      <td className="text-center text-sm text-purple-400">{p.tiendaB}</td>
                      <td className="text-center text-sm text-emerald-400">{p.tiendaC}</td>
                      <td className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.activo ? 'badge-active' : 'badge-neutral'}`}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button onClick={() => openEdit(p)}
                          className="p-1.5 rounded hover:bg-amber-900/30 text-slate-400 hover:text-amber-400 transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Movimientos Tab */}
      {tab === 'movimientos' && (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
            <input className="tech-input w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
              placeholder="Buscar movimientos..."
              value={movSearch} onChange={e => setMovSearch(e.target.value)} />
          </div>
          <div className="section-card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full tech-table">
                <thead>
                  <tr>
                    <th className="text-left">Fecha</th>
                    <th className="text-left">Código</th>
                    <th className="text-left">Descripción</th>
                    <th className="text-center">Tipo</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center">Tienda</th>
                    <th className="text-left">Referencia</th>
                    <th className="text-left">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movsFiltrados.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-slate-500">No hay movimientos registrados</td></tr>
                  ) : movsFiltrados.slice().reverse().map(m => (
                    <tr key={m.id}>
                      <td className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString('es-CR')}</td>
                      <td className="font-mono text-xs text-amber-400">{m.productoCodigo}</td>
                      <td className="text-xs text-slate-300 max-w-40 truncate">{m.productoDescripcion}</td>
                      <td className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          m.tipo === 'entrada' ? 'badge-active' :
                          m.tipo === 'salida' ? 'badge-danger' : 'badge-info'
                        }`}>{m.tipo}</span>
                      </td>
                      <td className="text-center">
                        <span className={`font-bold text-sm ${m.tipo === 'entrada' ? 'text-emerald-400' : m.tipo === 'salida' ? 'text-red-400' : 'text-blue-400'}`}>
                          {m.tipo === 'entrada' ? '+' : m.tipo === 'salida' ? '-' : '='}{m.cantidad}
                        </span>
                      </td>
                      <td className="text-center text-xs text-slate-400">{m.tienda.replace('Tienda','T.')}</td>
                      <td className="text-xs text-slate-400">{m.referencia || '—'}</td>
                      <td className="text-xs text-slate-400">{m.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Ajuste Tab */}
      {tab === 'ajuste' && (
        <div className="section-card space-y-5">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
            <TrendingDown size={14} /> Registrar Entrada / Salida / Ajuste
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Tipo de Movimiento</label>
              <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={movTipo} onChange={e => setMovTipo(e.target.value as any)}>
                <option value="entrada">Entrada de Mercancía</option>
                <option value="salida">Salida de Mercancía</option>
                <option value="ajuste">Ajuste de Inventario</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Tienda</label>
              <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={movTienda} onChange={e => setMovTienda(e.target.value as any)}>
                <option value="TiendaA">Tienda A — San José</option>
                <option value="TiendaB">Tienda B — Alajuela</option>
                <option value="TiendaC">Tienda C — Heredia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Cantidad</label>
              <input type="number" min="1"
                className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                value={movCantidad || ''}
                onChange={e => setMovCantidad(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Producto *</label>
            <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
              value={movProductoId} onChange={e => setMovProductoId(e.target.value)}>
              <option value="">— Seleccione un producto —</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.codigo} — {p.descripcion} (Stock: {p.stock})</option>
              ))}
            </select>
            {movProd && (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-slate-500">Stock actual: <span className="text-white font-bold">{movProd.stock}</span></span>
                <span className="text-slate-500">Precio unit.: <span className="text-emerald-400 font-bold">₡{movProd.precioUnitario.toFixed(2)}</span></span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Referencia (doc., factura, etc.)</label>
              <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                placeholder="FAC-0001, OC-0002..." value={movReferencia}
                onChange={e => setMovReferencia(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Notas</label>
              <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                placeholder="Observaciones adicionales..." value={movNotas}
                onChange={e => setMovNotas(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn-warning" onClick={handleMovimiento}>
              <Save size={16} /> Registrar Movimiento
            </button>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Código *</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm font-mono"
                    placeholder="CAM-IP-4K-001" value={form.codigo}
                    onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Precio Unitario (₡) *</label>
                  <input type="number" min="0" step="0.01"
                    className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.precioUnitario || ''}
                    onChange={e => setForm(f => ({ ...f, precioUnitario: Number(e.target.value) }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Descripción *</label>
                <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                  placeholder="Descripción completa del producto..."
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Categoría</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {categorias.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Marca</label>
                  <select className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}>
                    {marcas.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Stock Total</label>
                  <input type="number" min="0" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.stock || ''} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Stock Mínimo</label>
                  <input type="number" min="0" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    value={form.stockMinimo || ''} onChange={e => setForm(f => ({ ...f, stockMinimo: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">Ubicación</label>
                  <input className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                    placeholder="Estante A-1..." value={form.ubicacion}
                    onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[['tiendaA', 'Tienda A'], ['tiendaB', 'Tienda B'], ['tiendaC', 'Tienda C']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5">{label}</label>
                    <input type="number" min="0" className="tech-input w-full rounded-lg px-3 py-2.5 text-sm"
                      value={(form as any)[field] || ''}
                      onChange={e => setForm(f => ({ ...f, [field]: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <label htmlFor="activo" className="text-sm text-slate-300">Producto activo</label>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-blue-900/30">
                <button className="btn-ghost" onClick={() => setShowForm(false)}><X size={16} />Cancelar</button>
                <button className="btn-warning" onClick={handleSave}><Save size={16} />Guardar Producto</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
