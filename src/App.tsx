import { StoreProvider } from './context/StoreContext';
import { useStoreContext } from './context/StoreContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard';
import BillingModule from './components/Billing/BillingModule';
import TrasladosModule from './components/Traslados/TrasladosModule';
import InventarioModule from './components/Inventario/InventarioModule';
import UsersModule from './components/Users/UsersModule';
import ContactosModule from './components/Contactos/ContactosModule';
import TiendaModule from './components/Tienda/TiendaModule';
import TicketsModule from './components/Tickets/TicketsModule';

function AppContent() {
  const { activeModule } = useStoreContext();

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'facturacion': return <BillingModule tipo="factura" />;
      case 'cotizaciones': return <BillingModule tipo="cotizacion" />;
      case 'ordenes_compra': return <BillingModule tipo="orden_compra" />;
      case 'traslados': return <TrasladosModule />;
      case 'inventario': return <InventarioModule />;
      case 'usuarios': return <UsersModule />;
      case 'contactos': return <ContactosModule />;
      case 'tienda': return <TiendaModule />;
      case 'tickets': return <TicketsModule />;
      case 'rma': return <TicketsModule tipo="rma" />;
      case 'reparacion': return <TicketsModule tipo="reparacion" />;
      case 'garantias': return <TicketsModule tipo="garantia" />;
      default: return <Dashboard />;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0a0f1e', color: '#e2e8f0' }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto" style={{ background: '#0a0f1e' }}>
          <div className="grid-pattern min-h-full">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
