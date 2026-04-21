export type UserRole = 'admin' | 'vendedor' | 'almacen' | 'soporte' | 'cliente';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: UserRole;
  telefono: string;
  activo: boolean;
  createdAt: string;
}

export interface Contacto {
  id: string;
  nombre: string;
  apellido: string;
  empresa: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  ruc: string;
  tipo: 'cliente' | 'proveedor';
  notas: string;
  createdAt: string;
}

export interface Producto {
  id: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  marca: string;
  precioUnitario: number;
  stock: number;
  stockMinimo: number;
  ubicacion: string;
  tiendaA: number;
  tiendaB: number;
  tiendaC: number;
  activo: boolean;
  createdAt: string;
}

export interface LineaDocumento {
  id: string;
  productoId: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export type EstadoDocumento = 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'pagado' | 'cancelado';

export interface Documento {
  id: string;
  tipo: 'factura' | 'cotizacion' | 'orden_compra';
  numero: string;
  contactoId: string;
  contactoNombre: string;
  fecha: string;
  fechaVencimiento: string;
  lineas: LineaDocumento[];
  subtotal: number;
  iva: number;
  total: number;
  estado: EstadoDocumento;
  notas: string;
  createdAt: string;
}

export type Tienda = 'TiendaA' | 'TiendaB' | 'TiendaC';
export type EstadoTraslado = 'pendiente' | 'aprobado' | 'rechazado' | 'en_transito' | 'recibido';

export interface Traslado {
  id: string;
  numero: string;
  origen: Tienda;
  destino: Tienda;
  solicitanteId: string;
  solicitanteNombre: string;
  lineas: LineaDocumento[];
  estado: EstadoTraslado;
  motivoRechazo: string;
  aprobadoPor: string;
  fechaAprobacion: string;
  recibidoPor: string;
  fechaRecepcion: string;
  numeroOrdenRelacionada: string;
  notas: string;
  createdAt: string;
}

export interface MovimientoInventario {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoDescripcion: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'traslado';
  cantidad: number;
  tienda: Tienda;
  referencia: string;
  usuario: string;
  notas: string;
  createdAt: string;
}

export type EstadoTicket = 'abierto' | 'en_proceso' | 'esperando_cliente' | 'resuelto' | 'cerrado';
export type TipoTicket = 'rma' | 'reparacion' | 'garantia' | 'soporte';
export type PrioridadTicket = 'baja' | 'media' | 'alta' | 'critica';

export interface Ticket {
  id: string;
  numero: string;
  tipo: TipoTicket;
  contactoId: string;
  contactoNombre: string;
  titulo: string;
  descripcion: string;
  marca: string;
  modelo: string;
  serie: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  asignadoA: string;
  rmaRelacionadoId: string;
  etiqueta: string;
  notas: string;
  historial: TicketHistorial[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketHistorial {
  id: string;
  fecha: string;
  usuario: string;
  accion: string;
  notas: string;
}

export type ActiveModule =
  | 'dashboard'
  | 'facturacion'
  | 'cotizaciones'
  | 'ordenes_compra'
  | 'traslados'
  | 'inventario'
  | 'usuarios'
  | 'contactos'
  | 'tienda'
  | 'tickets'
  | 'rma'
  | 'reparacion'
  | 'garantias';
