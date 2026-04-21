import React, { useState } from 'react';
import {
  LayoutDashboard, FileText, ShoppingCart, ClipboardList,
  ArrowLeftRight, Package, Users, BookUser, Store,
  Ticket, ChevronDown, ChevronRight, Shield, Wrench,
  BadgeCheck, Tag, Menu, X, Zap
} from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import type { ActiveModule } from '../../types';

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items?: { label: string; module: ActiveModule; icon: React.ReactNode }[];
  module?: ActiveModule;
}

const navGroups: NavGroup[] = [
  {
    label: 'Dashboard', module: 'dashboard',
    icon: <LayoutDashboard size={16} />
  },
  {
    label: 'Facturación', icon: <FileText size={16} />,
    items: [
      { label: 'Facturas', module: 'facturacion', icon: <FileText size={14} /> },
      { label: 'Cotizaciones', module: 'cotizaciones', icon: <ClipboardList size={14} /> },
      { label: 'Órdenes de Compra', module: 'ordenes_compra', icon: <ShoppingCart size={14} /> },
    ]
  },
  {
    label: 'Traslados', module: 'traslados',
    icon: <ArrowLeftRight size={16} />
  },
  {
    label: 'Inventario', module: 'inventario',
    icon: <Package size={16} />
  },
  {
    label: 'Soporte / Tickets', icon: <Ticket size={16} />,
    items: [
      { label: 'Tickets', module: 'tickets', icon: <Ticket size={14} /> },
      { label: 'Gestión RMA', module: 'rma', icon: <Shield size={14} /> },
      { label: 'Reparaciones', module: 'reparacion', icon: <Wrench size={14} /> },
      { label: 'Garantías', module: 'garantias', icon: <BadgeCheck size={14} /> },
    ]
  },
  {
    label: 'Tienda Cliente', module: 'tienda',
    icon: <Store size={16} />
  },
  {
    label: 'Contactos', module: 'contactos',
    icon: <BookUser size={16} />
  },
  {
    label: 'Usuarios', module: 'usuarios',
    icon: <Users size={16} />
  },
];

export default function Sidebar() {
  const { activeModule, setActiveModule } = useStoreContext();
  const [expanded, setExpanded] = useState<string[]>(['Facturación', 'Soporte / Tickets']);
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (module?: ActiveModule) => module === activeModule;

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setCollapsed(true)} />
      )}

      <aside
        className={`fixed lg:relative z-50 h-full flex flex-col transition-all duration-300 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'
        }`}
        style={{
          background: 'linear-gradient(180deg, #060d1a 0%, #0a1528 50%, #060d1a 100%)',
          borderRight: '1px solid rgba(30,58,95,0.5)',
          minHeight: '100vh'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-900/30">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #f59e0b)' }}>
            <Zap size={18} color="white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <div className="font-bold text-white text-sm leading-tight">TechSecure</div>
              <div className="text-xs font-semibold" style={{ color: '#f59e0b' }}>PRO SYSTEM</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-blue-900/30 text-slate-400 hover:text-white transition-colors"
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navGroups.map((group) => {
            if (group.module) {
              return (
                <div
                  key={group.label}
                  className={`nav-item ${isActive(group.module) ? 'active' : ''}`}
                  onClick={() => setActiveModule(group.module!)}
                  title={collapsed ? group.label : ''}
                >
                  <span className="flex-shrink-0">{group.icon}</span>
                  {!collapsed && <span>{group.label}</span>}
                </div>
              );
            }

            const isOpen = expanded.includes(group.label);
            return (
              <div key={group.label}>
                <div
                  className="nav-item"
                  onClick={() => toggle(group.label)}
                  title={collapsed ? group.label : ''}
                >
                  <span className="flex-shrink-0">{group.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{group.label}</span>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </>
                  )}
                </div>
                {!collapsed && isOpen && group.items && (
                  <div className="ml-3 pl-3 border-l border-blue-900/40 space-y-0.5 mt-1">
                    {group.items.map(item => (
                      <div
                        key={item.module}
                        className={`nav-item text-sm ${isActive(item.module) ? 'active' : ''}`}
                        onClick={() => setActiveModule(item.module)}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom info */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-blue-900/30">
            <div className="text-xs text-slate-500 text-center">
              <Tag size={10} className="inline mr-1" />
              v2.5.0 — 2025
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
