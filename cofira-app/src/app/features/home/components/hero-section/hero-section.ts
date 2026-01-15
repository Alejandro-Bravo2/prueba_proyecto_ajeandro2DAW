import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeSceneComponent } from '../../../../shared/components/three-scene/three-scene.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, ThreeSceneComponent],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {}
