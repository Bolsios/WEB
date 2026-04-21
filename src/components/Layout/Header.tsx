import { Bell, User, Wifi } from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';

const moduleLabels: Record<string, string> = {
  dashboard: 'Dashboard Principal',
  facturacion: 'Facturación',
  cotizaciones: 'Cotizaciones',
  ordenes_compra: 'Órdenes de Compra',
  traslados: 'Traslados entre Tiendas',
  inventario: 'Gestión de Inventario',
  usuarios: 'Registro de Usuarios',
  contactos: 'Contactos / Clientes',
  tienda: 'Tienda en Línea',
  tickets: 'Panel de Tickets',
  rma: 'Gestión RMA',
  reparacion: 'Gestión de Reparaciones',
  garantias: 'Gestión de Garantías',
};

export default function Header() {
  const { activeModule, currentUser, tickets } = useStoreContext();
  const openTickets = tickets.filter(t => t.estado === 'abierto').length;

  return (
    <header
      style={{
        background: 'linear-gradient(90deg, #060d1a, #0a1528)',
        borderBottom: '1px solid rgba(30,58,95,0.5)',
      }}
      className="flex items-center justify-between px-6 py-3 sticky top-0 z-30"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-500 font-mono">SISTEMA</span>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
            {moduleLabels[activeModule] || activeModule}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Wifi size={12} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">EN LÍNEA</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-blue-900/30 transition-colors">
          <Bell size={18} className="text-slate-400" />
          {openTickets > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ background: '#ef4444', color: 'white' }}>
              {openTickets > 9 ? '9+' : openTickets}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-900/30 transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #f59e0b)' }}>
            <User size={14} color="white" />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-slate-200">{currentUser.nombre}</div>
            <div className="text-xs capitalize" style={{ color: '#f59e0b' }}>{currentUser.rol}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
