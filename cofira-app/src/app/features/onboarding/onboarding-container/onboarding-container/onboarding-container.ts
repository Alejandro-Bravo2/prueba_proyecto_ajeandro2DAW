import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { StepsIndicator } from '../../components/steps-indicator/steps-indicator/steps-indicator';
import { OnboardingService } from '../../services/onboarding.service'; // Import OnboardingService

interface OnboardingStep {
  path: string;
  label: string;
}

@Component({
  selector: 'app-onboarding-container',
  standalone: true,
  imports: [CommonModule, StepsIndicator, RouterOutlet],
  templateUrl: './onboarding-container.html',
  styleUrl: './onboarding-container.scss',
})
export class OnboardingContainer implements OnInit {
  onboardingSteps: OnboardingStep[] = [
    { path: 'about', label: 'Sobre ti' },
    { path: 'nutrition', label: 'Preferencias nutricionales' },
    { path: 'goal', label: 'Objetivo' },
    { path: 'pricing', label: 'Rango de precios' },
    { path: 'muscles', label: 'Grupos musculares' },
  ];
  currentStepIndex: number = 0; // 0-indexed

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public onboardingService: OnboardingService // Inject OnboardingService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCurrentStep(event.urlAfterRedirects);
    });

    // Initial check
    this.updateCurrentStep(this.router.url);
  }

  private updateCurrentStep(url: string): void {
    const currentPath = url.split('/').pop();
    const index = this.onboardingSteps.findIndex(step => step.path === currentPath);
    if (index !== -1) {
      this.currentStepIndex = index;
    }
  }

  nextStep(): void {
    // Logic to validate current form before proceeding
    if (this.currentStepIndex < this.onboardingSteps.length - 1) {
      this.currentStepIndex++;
      this.router.navigate([this.onboardingSteps[this.currentStepIndex].path], { relativeTo: this.activatedRoute });
    } else {
      console.log('Onboarding complete!');
      // Final step logic, e.g., save data and redirect to dashboard
      // this.router.navigate(['/dashboard']);
    }
  }

  prevStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.router.navigate([this.onboardingSteps[this.currentStepIndex].path], { relativeTo: this.activatedRoute });
    }
  }

  // Helper to get step numbers for the indicator (1-indexed)
  get stepsForIndicator(): { index: number, label: string }[] {
    return this.onboardingSteps.map((step, index) => ({ index: index + 1, label: step.label }));
  }
}
