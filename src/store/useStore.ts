import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  User, Contacto, Producto, Documento, Traslado,
  MovimientoInventario, Ticket, ActiveModule
} from '../types';

const initialUsers: User[] = [
  {
    id: uuidv4(), nombre: 'Admin', apellido: 'Sistema', email: 'admin@techsecure.com',
    password: 'admin123', rol: 'admin', telefono: '8888-0000', activo: true,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos@techsecure.com',
    password: '123456', rol: 'vendedor', telefono: '8888-1111', activo: true,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), nombre: 'María', apellido: 'González', email: 'maria@techsecure.com',
    password: '123456', rol: 'almacen', telefono: '8888-2222', activo: true,
    createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), nombre: 'Pedro', apellido: 'Jiménez', email: 'pedro@techsecure.com',
    password: '123456', rol: 'soporte', telefono: '8888-3333', activo: true,
    createdAt: new Date().toISOString()
  },
];

const initialContactos: Contacto[] = [
  {
    id: uuidv4(), nombre: 'Juan', apellido: 'Pérez', empresa: 'Seguridad Total S.A.',
    email: 'juan@seguridadtotal.com', telefono: '7777-0001', direccion: 'Av. Central 100',
    ciudad: 'San José', pais: 'Costa Rica', ruc: '3-101-123456', tipo: 'cliente',
    notas: 'Cliente preferencial', createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), nombre: 'Ana', apellido: 'Vargas', empresa: 'NetWork Pro Ltda.',
    email: 'ana@networkpro.com', telefono: '7777-0002', direccion: 'Calle 5 #20',
    ciudad: 'Alajuela', pais: 'Costa Rica', ruc: '3-102-654321', tipo: 'cliente',
    notas: '', createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), nombre: 'Luis', apellido: 'Mora', empresa: 'TechVision CR',
    email: 'luis@techvision.cr', telefono: '7777-0003', direccion: 'Blvd. Norte 45',
    ciudad: 'Heredia', pais: 'Costa Rica', ruc: '3-103-789012', tipo: 'cliente',
    notas: '', createdAt: new Date().toISOString()
  },
];

const initialProductos: Producto[] = [
  {
    id: uuidv4(), codigo: 'CAM-IP-4K-001', descripcion: 'Cámara IP 4K PoE Exterior Dahua',
    categoria: 'Cámaras IP', marca: 'Dahua', precioUnitario: 185.00,
    stock: 45, stockMinimo: 5, ubicacion: 'Estante A-1',
    tiendaA: 20, tiendaB: 15, tiendaC: 10, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'NVR-16CH-002', descripcion: 'NVR 16 Canales 4K Hikvision',
    categoria: 'Grabadores', marca: 'Hikvision', precioUnitario: 420.00,
    stock: 12, stockMinimo: 3, ubicacion: 'Estante B-2',
    tiendaA: 5, tiendaB: 4, tiendaC: 3, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'SW-POE-24-003', descripcion: 'Switch PoE 24 Puertos Gigabit Ubiquiti',
    categoria: 'Networking', marca: 'Ubiquiti', precioUnitario: 350.00,
    stock: 8, stockMinimo: 2, ubicacion: 'Estante C-1',
    tiendaA: 3, tiendaB: 3, tiendaC: 2, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'AP-WIFI6-004', descripcion: 'Access Point WiFi 6 Dual Band TP-Link',
    categoria: 'Networking', marca: 'TP-Link', precioUnitario: 95.00,
    stock: 30, stockMinimo: 5, ubicacion: 'Estante C-2',
    tiendaA: 12, tiendaB: 10, tiendaC: 8, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'CAB-UTP6-100-005', descripcion: 'Cable UTP Cat6 Caja 305m Panduit',
    categoria: 'Cableado', marca: 'Panduit', precioUnitario: 75.00,
    stock: 50, stockMinimo: 10, ubicacion: 'Estante D-1',
    tiendaA: 20, tiendaB: 15, tiendaC: 15, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'DVR-8CH-006', descripcion: 'DVR 8 Canales HD-TVI 1080p Hikvision',
    categoria: 'Grabadores', marca: 'Hikvision', precioUnitario: 195.00,
    stock: 18, stockMinimo: 4, ubicacion: 'Estante B-1',
    tiendaA: 7, tiendaB: 6, tiendaC: 5, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'CTRL-ACC-007', descripcion: 'Controlador de Acceso 2 Puertas ZKTeco',
    categoria: 'Control de Acceso', marca: 'ZKTeco', precioUnitario: 245.00,
    stock: 15, stockMinimo: 3, ubicacion: 'Estante E-1',
    tiendaA: 6, tiendaB: 5, tiendaC: 4, activo: true, createdAt: new Date().toISOString()
  },
  {
    id: uuidv4(), codigo: 'PSU-48V-008', descripcion: 'Fuente Switching 48V 5A para PoE',
    categoria: 'Accesorios', marca: 'Genérico', precioUnitario: 35.00,
    stock: 60, stockMinimo: 10, ubicacion: 'Estante F-1',
    tiendaA: 25, tiendaB: 20, tiendaC: 15, activo: true, createdAt: new Date().toISOString()
  },
];

export function useStore() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [contactos, setContactos] = useState<Contacto[]>(initialContactos);
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [traslados, setTraslados] = useState<Traslado[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentUser] = useState<User>(initialUsers[0]);

  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = { ...user, id: uuidv4(), createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const addContacto = useCallback((c: Omit<Contacto, 'id' | 'createdAt'>) => {
    const newC: Contacto = { ...c, id: uuidv4(), createdAt: new Date().toISOString() };
    setContactos(prev => [...prev, newC]);
    return newC;
  }, []);

  const updateContacto = useCallback((id: string, updates: Partial<Contacto>) => {
    setContactos(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteContacto = useCallback((id: string) => {
    setContactos(prev => prev.filter(c => c.id !== id));
  }, []);

  const addProducto = useCallback((p: Omit<Producto, 'id' | 'createdAt'>) => {
    const newP: Producto = { ...p, id: uuidv4(), createdAt: new Date().toISOString() };
    setProductos(prev => [...prev, newP]);
    return newP;
  }, []);

  const updateProducto = useCallback((id: string, updates: Partial<Producto>) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addDocumento = useCallback((d: Omit<Documento, 'id' | 'createdAt'>) => {
    const newD: Documento = { ...d, id: uuidv4(), createdAt: new Date().toISOString() };
    setDocumentos(prev => [...prev, newD]);
    return newD;
  }, []);

  const updateDocumento = useCallback((id: string, updates: Partial<Documento>) => {
    setDocumentos(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const addTraslado = useCallback((t: Omit<Traslado, 'id' | 'createdAt'>) => {
    const newT: Traslado = { ...t, id: uuidv4(), createdAt: new Date().toISOString() };
    setTraslados(prev => [...prev, newT]);
    return newT;
  }, []);

  const updateTraslado = useCallback((id: string, updates: Partial<Traslado>) => {
    setTraslados(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const addMovimiento = useCallback((m: Omit<MovimientoInventario, 'id' | 'createdAt'>) => {
    const newM: MovimientoInventario = { ...m, id: uuidv4(), createdAt: new Date().toISOString() };
    setMovimientos(prev => [...prev, newM]);
    return newM;
  }, []);

  const addTicket = useCallback((t: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newT: Ticket = {
      ...t, id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTickets(prev => [...prev, newT]);
    return newT;
  }, []);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
  }, []);

  const getNextNumero = useCallback((prefix: string, list: Array<{ numero: string }>) => {
    const nums = list
      .filter(d => d.numero.startsWith(prefix))
      .map(d => parseInt(d.numero.replace(prefix + '-', '')) || 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${prefix}-${String(next).padStart(5, '0')}`;
  }, []);

  return {
    activeModule, setActiveModule,
    users, addUser, updateUser, deleteUser,
    contactos, addContacto, updateContacto, deleteContacto,
    productos, addProducto, updateProducto,
    documentos, addDocumento, updateDocumento,
    traslados, addTraslado, updateTraslado,
    movimientos, addMovimiento,
    tickets, addTicket, updateTicket,
    currentUser,
    getNextNumero,
  };
}

export type StoreType = ReturnType<typeof useStore>;
