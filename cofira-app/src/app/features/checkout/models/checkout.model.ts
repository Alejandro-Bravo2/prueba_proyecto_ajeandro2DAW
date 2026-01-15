export type TipoPlan = 'INDIVIDUAL' | 'MENSUAL' | 'ANUAL';
export type MetodoPago = 'TARJETA' | 'PAYPAL' | 'BIZUM';

export interface PlanInfo {
  tipo: TipoPlan;
  nombre: string;
  subtitulo: string;
  precio: number;
  periodo: string;
  features: string[];
  destacado?: boolean;
}

export interface CheckoutRequest {
  tipoPlan: TipoPlan;
  metodoPago: MetodoPago;
  // Datos de tarjeta
  nombreTitular?: string;
  numeroTarjeta?: string;
  fechaExpiracion?: string;
  cvv?: string;
  // Datos de PayPal
  emailPaypal?: string;
  // Datos de Bizum
  telefonoBizum?: string;
}

export interface CheckoutResponse {
  planId: number;
  tipoPlan: string;
  precio: number;
  metodoPago: string;
  fechaInicio: string;
  fechaFin: string;
  exitoso: boolean;
  mensaje: string;
  transaccionId: string;
}

export interface SubscripcionEstado {
  activa: boolean;
  tipoPlan?: TipoPlan;
  nombrePlan?: string;
  precio?: number;
  fechaInicio?: string;
  fechaFin?: string;
  diasRestantes?: number;
  metodoPago?: MetodoPago;
  ultimosDigitosTarjeta?: string;
}

export const PLANES_INFO: Record<TipoPlan, PlanInfo> = {
  INDIVIDUAL: {
    tipo: 'INDIVIDUAL',
    nombre: 'Individual',
    subtitulo: 'Para empezar',
    precio: 9,
    periodo: 'mes',
    features: [
      'Acceso basico a rutinas',
      'Seguimiento de nutricion',
      'Soporte por email',
      'App movil'
    ]
  },
  MENSUAL: {
    tipo: 'MENSUAL',
    nombre: 'Mensual',
    subtitulo: 'Mas popular',
    precio: 19,
    periodo: 'mes',
    features: [
      'Todas las rutinas premium',
      'Plan nutricional avanzado',
      'Soporte prioritario',
      'Acceso a comunidad',
      'Analisis de progreso'
    ],
    destacado: true
  },
  ANUAL: {
    tipo: 'ANUAL',
    nombre: 'Anual',
    subtitulo: 'Mejor valor',
    precio: 199,
    periodo: 'ano',
    features: [
      'Todo lo del plan mensual',
      'Sesiones 1 a 1 con coach',
      'Acceso anticipado',
      'Descuentos exclusivos',
      '2 meses gratis'
    ]
  }
};

export interface PaymentMethodInfo {
  id: MetodoPago;
  nombre: string;
  icono: string;
  descripcion: string;
}

export const METODOS_PAGO: PaymentMethodInfo[] = [
  {
    id: 'TARJETA',
    nombre: 'Tarjeta',
    icono: 'credit-card',
    descripcion: 'Debito o credito'
  },
  {
    id: 'PAYPAL',
    nombre: 'PayPal',
    icono: 'paypal',
    descripcion: 'Paga con tu cuenta'
  },
  {
    id: 'BIZUM',
    nombre: 'Bizum',
    icono: 'smartphone',
    descripcion: 'Pago instantaneo'
  }
];
