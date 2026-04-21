import { 
  FileText, ShoppingCart, ClipboardList, ArrowLeftRight,
  Package, Users, Ticket, TrendingUp, AlertTriangle,
  CheckCircle, Clock, DollarSign, BarChart2, Shield
} from 'lucide-react';
import { useStoreContext } from '../context/StoreContext';
import type { ActiveModule } from '../types';

export default function Dashboard() {
  const { setActiveModule, documentos, traslados, tickets, productos, contactos, users } = useStoreContext();

  const totalFacturado = documentos
    .filter(d => d.tipo === 'factura' && d.estado === 'pagado')
    .reduce((s, d) => s + d.total, 0);

  const facturasPendientes = documentos.filter(d => d.tipo === 'factura' && d.estado !== 'pagado' && d.estado !== 'cancelado').length;
  const trasladosPendientes = traslados.filter(t => t.estado === 'pendiente').length;
  const ticketsAbiertos = tickets.filter(t => t.estado === 'abierto' || t.estado === 'en_proceso').length;
  const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;

  const stats = [
    {
      label: 'Total Facturado', value: `₡${totalFacturado.toLocaleString('es-CR', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign size={20} />, color: '#10b981', module: 'facturacion' as ActiveModule,
      sub: 'Facturas pagadas'
    },
    {
      label: 'Facturas Pendientes', value: facturasPendientes,
      icon: <FileText size={20} />, color: '#f59e0b', module: 'facturacion' as ActiveModule,
      sub: 'Requieren atención'
    },
    {
      label: 'Traslados Pendientes', value: trasladosPendientes,
      icon: <ArrowLeftRight size={20} />, color: '#3b82f6', module: 'traslados' as ActiveModule,
      sub: 'Esperando aprobación'
    },
    {
      label: 'Tickets Activos', value: ticketsAbiertos,
      icon: <Ticket size={20} />, color: '#f97316', module: 'tickets' as ActiveModule,
      sub: 'Abiertos + En proceso'
    },
    {
      label: 'Stock Bajo', value: productosStockBajo,
      icon: <AlertTriangle size={20} />, color: '#ef4444', module: 'inventario' as ActiveModule,
      sub: 'Productos bajo mínimo'
    },
    {
      label: 'Clientes', value: contactos.filter(c => c.tipo === 'cliente').length,
      icon: <Users size={20} />, color: '#8b5cf6', module: 'contactos' as ActiveModule,
      sub: 'Registrados en sistema'
    },
  ];

  const quickActions = [
    { label: 'Nueva Factura', icon: <FileText size={18} />, module: 'facturacion' as ActiveModule, color: '#1e3a5f' },
    { label: 'Nueva Cotización', icon: <ClipboardList size={18} />, module: 'cotizaciones' as ActiveModule, color: '#1e3a5f' },
    { label: 'Orden de Compra', icon: <ShoppingCart size={18} />, module: 'ordenes_compra' as ActiveModule, color: '#1e3a5f' },
    { label: 'Nuevo Traslado', icon: <ArrowLeftRight size={18} />, module: 'traslados' as ActiveModule, color: '#1e3a5f' },
    { label: 'Nuevo Ticket', icon: <Ticket size={18} />, module: 'tickets' as ActiveModule, color: '#d97706' },
    { label: 'Gestión RMA', icon: <Shield size={18} />, module: 'rma' as ActiveModule, color: '#d97706' },
    { label: 'Inventario', icon: <Package size={18} />, module: 'inventario' as ActiveModule, color: '#1e3a5f' },
    { label: 'Nuevo Contacto', icon: <Users size={18} />, module: 'contactos' as ActiveModule, color: '#1e3a5f' },
  ];

  const recentDocs = documentos.slice(-5).reverse();
  const recentTickets = tickets.slice(-5).reverse();

  const estadoColor: Record<string, string> = {
    borrador: 'badge-neutral', enviado: 'badge-info', aprobado: 'badge-active',
    rechazado: 'badge-danger', pagado: 'badge-active', cancelado: 'badge-danger',
    abierto: 'badge-warning', en_proceso: 'badge-info', esperando_cliente: 'badge-orange',
    resuelto: 'badge-active', cerrado: 'badge-neutral', pendiente: 'badge-warning',
    en_transito: 'badge-info', recibido: 'badge-active',
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl px-8 py-8"
        style={{
          background: 'linear-gradient(135deg, #060d1a 0%, #0d1b35 40%, #1e3a5f 100%)',
          border: '1px solid rgba(30,58,95,0.6)'
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(20%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', transform: 'translate(-20%, 30%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={14} className="text-amber-400" />
            <span className="text-xs font-mono text-amber-400 tracking-widest uppercase">Panel de Control Principal</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">
            TechSecure <span style={{ color: '#f59e0b' }}>Pro</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Sistema integral de gestión para proveedor mayorista de seguridad electrónica y redes de telecomunicaciones.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-xs text-emerald-400">{productos.length} productos activos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-blue-400" />
              <span className="text-xs text-blue-400">{users.length} usuarios registrados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-amber-400" />
              <span className="text-xs text-amber-400">{new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card card-glow cursor-pointer"
            onClick={() => setActiveModule(stat.module)}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <TrendingUp size={12} style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-300">{stat.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-card">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart2 size={14} /> Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setActiveModule(action.module)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 text-center"
              style={{
                background: `${action.color}20`,
                border: `1px solid ${action.color}40`,
                color: action.color === '#d97706' ? '#f59e0b' : '#60a5fa'
              }}
            >
              <div className="p-2 rounded-lg" style={{ background: `${action.color}30` }}>
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-slate-300 leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="section-card">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={14} /> Documentos Recientes
          </h2>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              No hay documentos aún
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(15,22,35,0.6)', border: '1px solid rgba(30,58,95,0.3)' }}>
                  <div>
                    <div className="text-sm font-semibold text-white">{doc.numero}</div>
                    <div className="text-xs text-slate-500">{doc.contactoNombre}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[doc.estado]}`}>
                      {doc.estado}
                    </span>
                    <div className="text-xs text-amber-400 font-bold mt-1">
                      ₡{doc.total.toLocaleString('es-CR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="section-card">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Ticket size={14} /> Tickets Recientes
          </h2>
          {recentTickets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Ticket size={32} className="mx-auto mb-2 opacity-30" />
              No hay tickets aún
            </div>
          ) : (
            <div className="space-y-2">
              {recentTickets.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(15,22,35,0.6)', border: '1px solid rgba(30,58,95,0.3)' }}>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.numero}</div>
                    <div className="text-xs text-slate-500 truncate max-w-40">{t.titulo}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${estadoColor[t.estado]}`}>
                    {t.estado.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Alert */}
      {productosStockBajo > 0 && (
        <div className="rounded-xl p-4 flex items-center gap-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-bold text-red-400">Alerta de Inventario Bajo</div>
            <div className="text-xs text-slate-400">{productosStockBajo} producto(s) están en o por debajo del stock mínimo</div>
          </div>
          <button className="btn-danger text-xs" onClick={() => setActiveModule('inventario')}>
            Ver Inventario
          </button>
        </div>
      )}
    </div>
  );
}
