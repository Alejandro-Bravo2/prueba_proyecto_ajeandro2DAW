import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SeoConfig {
  titulo: string;
  descripcion: string;
  palabrasClave?: string;
  imagen?: string;
  tipo?: string;
  url?: string;
  noIndex?: boolean;
}

interface DatosEstructurados {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

const SEO_DEFECTO: SeoConfig = {
  titulo: 'COFIRA - Tu entrenamiento, nutrición y progreso',
  descripcion: 'COFIRA: Sistema integral de entrenamiento, nutrición y seguimiento de progreso personalizado. Transforma tu cuerpo con planes adaptados a tus objetivos.',
  palabrasClave: 'fitness, nutrición, entrenamiento, progreso, salud, ejercicio, dieta, gimnasio',
  imagen: '/assets/og-image.jpg',
  tipo: 'website'
};

const RUTAS_SEO: Record<string, SeoConfig> = {
  '/': {
    titulo: 'COFIRA - Tu entrenamiento, nutrición y progreso personalizado',
    descripcion: 'Transforma tu cuerpo con COFIRA. Planes de entrenamiento personalizados, seguimiento nutricional inteligente y métricas de progreso en tiempo real.',
    palabrasClave: 'fitness app, entrenamiento personalizado, nutrición, progreso fitness, salud'
  },
  '/login': {
    titulo: 'Iniciar Sesión | COFIRA',
    descripcion: 'Accede a tu cuenta COFIRA para continuar con tu plan de entrenamiento y nutrición personalizado.',
    noIndex: true
  },
  '/register': {
    titulo: 'Crear Cuenta | COFIRA',
    descripcion: 'Únete a COFIRA y comienza tu transformación física. Crea tu cuenta gratuita y accede a planes personalizados.',
    palabrasClave: 'registro fitness, crear cuenta, plan entrenamiento gratis'
  },
  '/reset-password': {
    titulo: 'Recuperar Contraseña | COFIRA',
    descripcion: 'Recupera el acceso a tu cuenta COFIRA de forma segura.',
    noIndex: true
  },
  '/entrenamiento': {
    titulo: 'Entrenamiento Personalizado | COFIRA',
    descripcion: 'Descubre rutinas de entrenamiento adaptadas a tus objetivos. Ejercicios guiados, seguimiento de series y progreso visible.',
    palabrasClave: 'rutinas entrenamiento, ejercicios gimnasio, workout, fitness plan'
  },
  '/alimentacion': {
    titulo: 'Nutrición y Alimentación | COFIRA',
    descripcion: 'Controla tu alimentación diaria con planes nutricionales personalizados. Seguimiento de calorías, macros y menús semanales.',
    palabrasClave: 'plan nutricional, dieta personalizada, calorías, macros, alimentación saludable'
  },
  '/seguimiento': {
    titulo: 'Seguimiento de Progreso | COFIRA',
    descripcion: 'Visualiza tu evolución física con métricas detalladas. Gráficos de progreso, medidas corporales y logros alcanzados.',
    palabrasClave: 'progreso fitness, métricas corporales, evolución física, resultados'
  },
  '/preferencias': {
    titulo: 'Preferencias | COFIRA',
    descripcion: 'Personaliza tu experiencia COFIRA. Ajusta tus preferencias de cuenta, notificaciones y objetivos.',
    noIndex: true
  },
  '/terms': {
    titulo: 'Términos y Condiciones | COFIRA',
    descripcion: 'Consulta los términos y condiciones de uso de la plataforma COFIRA.',
    noIndex: true
  },
  '/privacy': {
    titulo: 'Política de Privacidad | COFIRA',
    descripcion: 'Conoce cómo COFIRA protege y gestiona tus datos personales.',
    noIndex: true
  },
  '/checkout': {
    titulo: 'Suscripción Premium | COFIRA',
    descripcion: 'Accede a todas las funcionalidades premium de COFIRA. Planes de entrenamiento avanzados y nutrición personalizada.',
    palabrasClave: 'cofira premium, suscripción fitness, plan premium'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  private readonly urlBase = 'https://cofira.app';

  constructor() {
    this.inicializarSeoAutomatico();
  }

  /**
   * Inicializa el seguimiento automático de rutas para actualizar meta tags
   */
  private inicializarSeoAutomatico(): void {
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => {
        const rutaBase = this.obtenerRutaBase(evento.urlAfterRedirects);
        const configuracionRuta = RUTAS_SEO[rutaBase];

        if (configuracionRuta) {
          this.actualizarMetaTags(configuracionRuta);
        } else {
          this.actualizarMetaTags(SEO_DEFECTO);
        }
      });
  }

  /**
   * Obtiene la ruta base sin parámetros ni query strings
   */
  private obtenerRutaBase(url: string): string {
    const rutaSinQuery = url.split('?')[0];
    const segmentos = rutaSinQuery.split('/').filter(Boolean);

    if (segmentos.length === 0) return '/';
    if (segmentos.length === 1) return `/${segmentos[0]}`;

    return `/${segmentos[0]}`;
  }

  /**
   * Actualiza todos los meta tags de la página
   */
  actualizarMetaTags(config: SeoConfig): void {
    const configuracionCompleta = { ...SEO_DEFECTO, ...config };
    const urlCompleta = config.url || `${this.urlBase}${this.router.url}`;

    this.title.setTitle(configuracionCompleta.titulo);

    this.actualizarMetaTag('description', configuracionCompleta.descripcion);
    this.actualizarMetaTag('keywords', configuracionCompleta.palabrasClave || '');

    this.actualizarOpenGraph(configuracionCompleta, urlCompleta);
    this.actualizarTwitterCards(configuracionCompleta);
    this.actualizarCanonical(urlCompleta);
    this.actualizarRobots(configuracionCompleta.noIndex || false);
  }

  /**
   * Actualiza los meta tags de Open Graph
   */
  private actualizarOpenGraph(config: SeoConfig, url: string): void {
    this.actualizarMetaTag('og:title', config.titulo, true);
    this.actualizarMetaTag('og:description', config.descripcion, true);
    this.actualizarMetaTag('og:type', config.tipo || 'website', true);
    this.actualizarMetaTag('og:url', url, true);
    this.actualizarMetaTag('og:image', `${this.urlBase}${config.imagen}`, true);
    this.actualizarMetaTag('og:site_name', 'COFIRA', true);
    this.actualizarMetaTag('og:locale', 'es_ES', true);
  }

  /**
   * Actualiza los meta tags de Twitter Cards
   */
  private actualizarTwitterCards(config: SeoConfig): void {
    this.actualizarMetaTag('twitter:card', 'summary_large_image');
    this.actualizarMetaTag('twitter:title', config.titulo);
    this.actualizarMetaTag('twitter:description', config.descripcion);
    this.actualizarMetaTag('twitter:image', `${this.urlBase}${config.imagen}`);
    this.actualizarMetaTag('twitter:site', '@cofira_app');
  }

  /**
   * Actualiza o crea un meta tag
   */
  private actualizarMetaTag(nombre: string, contenido: string, esPropiedad = false): void {
    const selector = esPropiedad ? `property="${nombre}"` : `name="${nombre}"`;
    const atributo = esPropiedad ? 'property' : 'name';

    this.meta.removeTag(selector);

    if (contenido) {
      this.meta.addTag({ [atributo]: nombre, content: contenido });
    }
  }

  /**
   * Actualiza el enlace canónico
   */
  private actualizarCanonical(url: string): void {
    const enlaceExistente = this.document.querySelector('link[rel="canonical"]');

    if (enlaceExistente) {
      enlaceExistente.setAttribute('href', url);
    } else {
      const enlace = this.document.createElement('link');
      enlace.setAttribute('rel', 'canonical');
      enlace.setAttribute('href', url);
      this.document.head.appendChild(enlace);
    }
  }

  /**
   * Actualiza la directiva robots
   */
  private actualizarRobots(noIndex: boolean): void {
    const valorRobots = noIndex ? 'noindex, nofollow' : 'index, follow';
    this.actualizarMetaTag('robots', valorRobots);
  }

  /**
   * Añade datos estructurados JSON-LD a la página
   */
  agregarDatosEstructurados(datos: DatosEstructurados): void {
    const scriptExistente = this.document.querySelector('script[type="application/ld+json"]');

    if (scriptExistente) {
      scriptExistente.remove();
    }

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(datos);
    this.document.head.appendChild(script);
  }

  /**
   * Genera datos estructurados para la organización
   */
  generarSchemaOrganizacion(): DatosEstructurados {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'COFIRA',
      url: this.urlBase,
      logo: `${this.urlBase}/assets/logo.png`,
      description: 'Plataforma integral de entrenamiento, nutrición y seguimiento de progreso personalizado.',
      sameAs: [
        'https://twitter.com/cofira_app',
        'https://instagram.com/cofira_app',
        'https://linkedin.com/company/cofira'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'Spanish'
      }
    };
  }

  /**
   * Genera datos estructurados para la aplicación web
   */
  generarSchemaAplicacionWeb(): DatosEstructurados {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'COFIRA',
      url: this.urlBase,
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250'
      }
    };
  }

  /**
   * Genera datos estructurados para breadcrumbs
   */
  generarSchemaBreadcrumbs(items: { nombre: string; url: string }[]): DatosEstructurados {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.nombre,
        item: `${this.urlBase}${item.url}`
      }))
    };
  }
}
