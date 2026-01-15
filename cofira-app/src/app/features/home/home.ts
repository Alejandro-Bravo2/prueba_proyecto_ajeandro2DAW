import { Component } from '@angular/core';
import { HeroSection } from './components/hero-section/hero-section';
import { PricingPlans } from './components/pricing-plans/pricing-plans';
import { NewsletterForm } from './components/newsletter-form/newsletter-form';
import { Accordion, AccordionItem } from '../../shared/components/ui/accordion/accordion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSection, PricingPlans, NewsletterForm, Accordion, AccordionItem],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  faqs = [
    {
      question: '¿Qué es COFIRA?',
      answer: 'COFIRA es una aplicación integral de fitness que te ayuda a gestionar tu entrenamiento, nutrición y progreso de manera eficiente. Diseñada para adaptarse a tus necesidades personales y objetivos de salud.'
    },
    {
      question: '¿Cómo funciona el seguimiento de entrenamiento?',
      answer: 'Puedes crear rutinas personalizadas, registrar tus ejercicios diarios, monitorear tu progreso con gráficos interactivos y ajustar tus planes según tus objetivos. Todo sincronizado en tiempo real.'
    },
    {
      question: '¿Puedo personalizar mi plan de alimentación?',
      answer: 'Sí, COFIRA te permite registrar tus comidas, establecer objetivos nutricionales, marcar alergias e intolerancias, y llevar un seguimiento detallado de tus macronutrientes (proteínas, carbohidratos y grasas).'
    },
    {
      question: '¿Es necesario pagar para usar COFIRA?',
      answer: 'COFIRA ofrece un plan gratuito con funcionalidades básicas. Los planes premium desbloquean características avanzadas como análisis detallados, planes personalizados ilimitados y soporte prioritario.'
    },
    {
      question: '¿Mis datos están seguros?',
      answer: 'Absolutamente. Utilizamos encriptación de grado bancario para proteger tu información personal. Todos los datos se almacenan de forma segura y nunca compartimos tu información con terceros sin tu consentimiento.'
    },
    {
      question: '¿Puedo usar COFIRA en mi móvil?',
      answer: 'Sí, COFIRA es completamente responsive y funciona perfectamente en dispositivos móviles, tablets y ordenadores. Accede desde cualquier lugar y mantén tu progreso sincronizado.'
    }
  ];
}
