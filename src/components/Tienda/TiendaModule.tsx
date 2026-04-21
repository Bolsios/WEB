import { useState } from 'react';
import { Store, Search, ShoppingCart, Plus, Minus, X, Shield, Wifi, Camera, Package } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { Producto } from '../../types';

const categoryIcons: Record<string, React.ReactNode> = {
  'Cámaras IP': <Camera size={16} />,
  'Networking': <Wifi size={16} />,
  'Control de Acceso': <Shield size={16} />,
  'Grabadores': <Package size={16} />,
  'Cableado': <Package size={16} />,
  'Accesorios': <Package size={16} />,
};

export default function TiendaModule() {
  const { productos } = useStoreContext();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [cart, setCart] = useState<{ producto: Producto; cantidad: number }[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  const categorias = [...new Set(productos.map(p => p.categoria))];

  const filtered = productos.filter(p => {
    const matchSearch = p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      p.marca.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.categoria === filterCat : true;
    return matchSearch && matchCat && p.activo && p.stock > 0;
  });

  const addToCart = (p: Producto) => {
    setCart(prev => {
      const existe = prev.find(c => c.producto.id === p.id);
      if (existe) return prev.map(c => c.producto.id === p.id ? { ...c, cantidad: c.cantidad + 1 } : c);
      return [...prev, { producto: p, cantidad: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.producto.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(c => c.producto.id === id ? { ...c, cantidad: qty } : c));
  };

  const subtotal = cart.reduce((s, c) => s + c.producto.precioUnitario * c.cantidad, 0);
  const iva = subtotal * 0.13;
  const total = subtotal + iva;
  const totalItems = cart.reduce((s, c) => s + c.cantidad, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Store Header */}
      <div className="relative overflow-hidden rounded-2xl px-8 py-10"
        style={{
          background: 'linear-gradient(135deg, #060d1a, #0d1b35 50%, #1a2f50)',
          border: '1px solid rgba(30,58,95,0.6)'
        }}>
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-72 h-72 opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Store size={28} style={{ color: '#f59e0b' }} />
            <h1 className="text-3xl font-black text-white">TechSecure <span style={{ color: '#f59e0b' }}>STORE</span></h1>
          </div>
          <p className="text-slate-400 mb-2">Proveedor Mayorista de Seguridad Electrónica y Redes</p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Shield size={11} className="text-amber-400" />CCTV & Videovigilancia</span>
            <span className="flex items-center gap-1"><Wifi size={11} className="text-blue-400" />Redes & Telecomunicaciones</span>
            <span className="flex items-center gap-1"><Package size={11} className="text-emerald-400" />Control de Acceso</span>
          </div>
        </div>
      </div>

      {/* Search & Cart */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
          <input
            className="tech-input w-full rounded-xl pl-10 pr-4 py-3 text-sm"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {categorias.map(c => (
            <button key={c}
              onClick={() => setFilterCat(filterCat === c ? '' : c)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                filterCat === c
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-500 hover:text-slate-300 border border-blue-900/30 hover:border-blue-700/40'
              }`}
            >
              {categoryIcons[c] || <Package size={12} />}
              {c}
            </button>
          ))}
        </div>
        <button
          className="relative btn-warning"
          onClick={() => setShowCart(!showCart)}
        >
          <ShoppingCart size={18} />
          Carrito
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ background: '#ef4444', color: 'white' }}>
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div key={p.id}
                className="section-card card-glow hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="flex items-center justify-center h-24 rounded-xl mb-3"
                  style={{ background: 'linear-gradient(135deg, rgba(30,58,95,0.4), rgba(15,22,35,0.8))' }}>
                  <div style={{ color: '#f59e0b' }}>
                    {categoryIcons[p.categoria] || <Package size={36} />}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono text-amber-400">{p.codigo}</div>
                  <div className="text-sm font-semibold text-white leading-tight line-clamp-2">{p.descripcion}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{p.marca}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.stock > 5 ? 'badge-active' : 'badge-warning'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-blue-900/20">
                    <div>
                      <div className="text-lg font-black text-emerald-400">₡{p.precioUnitario.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-slate-500">+ IVA 13%</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart(p); }}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{ background: 'linear-gradient(135deg, #1e3a5f, #f59e0b)' }}
                    >
                      <Plus size={16} color="white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-4 text-center py-12 text-slate-500">
                <Store size={40} className="mx-auto mb-3 opacity-20" />
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="w-80 flex-shrink-0">
            <div className="section-card sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ShoppingCart size={16} style={{ color: '#f59e0b' }} /> Carrito ({totalItems})
                </h3>
                <button onClick={() => setShowCart(false)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">Carrito vacío</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.producto.id} className="p-2.5 rounded-lg"
                      style={{ background: 'rgba(15,22,35,0.6)', border: '1px solid rgba(30,58,95,0.3)' }}>
                      <div className="text-xs font-semibold text-white truncate mb-1.5">{item.producto.descripcion}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(item.producto.id, item.cantidad - 1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors">
                            <Minus size={10} />
                          </button>
                          <span className="text-sm font-bold text-white w-6 text-center">{item.cantidad}</span>
                          <button onClick={() => updateQty(item.producto.id, item.cantidad + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-400 transition-colors">
                            <Plus size={10} />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          ₡{(item.producto.precioUnitario * item.cantidad).toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                        </span>
                        <button onClick={() => removeFromCart(item.producto.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-blue-900/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white">₡{subtotal.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">IVA 13%</span>
                    <span className="text-amber-400">₡{iva.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base p-2 rounded"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-white">TOTAL</span>
                    <span className="text-emerald-400">₡{total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <button className="btn-warning w-full justify-center">
                    <ShoppingCart size={16} /> Solicitar Cotización
                  </button>
                  <button className="btn-ghost w-full justify-center text-xs"
                    onClick={() => setCart([])}>
                    Limpiar carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-amber-400">{selectedProduct.codigo}</span>
              <button onClick={() => setSelectedProduct(null)} className="p-2 rounded hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center justify-center h-32 rounded-xl mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(30,58,95,0.3), rgba(15,22,35,0.8))' }}>
              <div style={{ color: '#f59e0b', transform: 'scale(2)' }}>
                {categoryIcons[selectedProduct.categoria] || <Package size={36} />}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-1">{selectedProduct.descripcion}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="badge-info text-xs px-2 py-0.5 rounded-full">{selectedProduct.categoria}</span>
              <span className="badge-neutral text-xs px-2 py-0.5 rounded-full">{selectedProduct.marca}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${selectedProduct.stock > 5 ? 'badge-active' : 'badge-warning'}`}>
                {selectedProduct.stock} unidades disponibles
              </span>
            </div>

            <div className="p-4 rounded-xl mb-4"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="text-3xl font-black text-emerald-400">₡{selectedProduct.precioUnitario.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</div>
              <div className="text-xs text-slate-500 mt-1">Precio sin IVA • +13% = ₡{(selectedProduct.precioUnitario * 1.13).toLocaleString('es-CR', { minimumFractionDigits: 2 })}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              {[
                { label: 'Tienda A', value: selectedProduct.tiendaA },
                { label: 'Tienda B', value: selectedProduct.tiendaB },
                { label: 'Tienda C', value: selectedProduct.tiendaC },
              ].map(t => (
                <div key={t.label} className="p-2 rounded-lg" style={{ background: 'rgba(15,22,35,0.8)' }}>
                  <div className="text-xs text-slate-500">{t.label}</div>
                  <div className="text-lg font-bold text-white">{t.value}</div>
                </div>
              ))}
            </div>

            <button
              className="btn-warning w-full justify-center"
              onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
            >
              <ShoppingCart size={16} /> Agregar al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
