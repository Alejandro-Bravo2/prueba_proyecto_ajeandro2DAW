import {
  Component,
  ElementRef,
  OnDestroy,
  NgZone,
  ViewChild,
  AfterViewInit,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import gsap from 'gsap';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Componente de escena 3D para la sección de entrenamiento.
 *
 * @description
 * Este componente demuestra el uso correcto de ViewChild con ElementRef:
 * - ViewChild con static: true para acceso antes de ngAfterViewInit
 * - Null checks antes de acceder a nativeElement
 * - Proper cleanup en ngOnDestroy
 * - NgZone.runOutsideAngular para rendimiento de animaciones
 *
 * @example
 * ```html
 * <app-three-scene></app-three-scene>
 * ```
 */
@Component({
  selector: 'app-three-scene',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas class="three-scene__canvas"></canvas>`,
  styleUrls: ['./three-scene.component.scss']
})
export class ThreeSceneComponent implements AfterViewInit, OnDestroy {
  /**
   * Referencia al elemento canvas para renderizado Three.js WebGL.
   * @description Usa static: true para acceso inmediato antes de ngAfterViewInit.
   * El canvas se usa para inicializar WebGLRenderer y manejar eventos de resize.
   */
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private mainGroup!: THREE.Group;
  private centralSphere!: THREE.Group;
  private orbitingObjects: THREE.Group[] = [];
  private particles!: THREE.Points;
  private connectionLines!: THREE.LineSegments;
  private frameId: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private clock = new THREE.Clock();
  private isInitialized = false;

  private boundOnWindowResize = this.onWindowResize.bind(this);
  private boundOnMouseMove = this.onMouseMove.bind(this);

  // Colores para modo claro y oscuro - MÁS CONTRASTE
  private colors = {
    light: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#444444',
      particles: '#000000',
      lines: '#333333'
    },
    dark: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      accent: '#aaaaaa',
      particles: '#ffffff',
      lines: '#cccccc'
    }
  };

  constructor(
    private ngZone: NgZone,
    private themeService: ThemeService
  ) {
    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      if (this.isInitialized) {
        this.updateColors(isDark);
      }
    });
  }

  /**
   * Hook AfterViewInit - Inicializa la escena Three.js cuando el canvas está disponible.
   * @description Verifica que el ViewChild esté inicializado antes de proceder.
   */
  ngAfterViewInit(): void {
    // Null check: Verificar que el canvas esté disponible antes de inicializar
    if (!this.canvasRef?.nativeElement) {
      console.error('ThreeSceneComponent: Canvas element not found');
      return;
    }

    this.initThree();
    this.createCentralStructure();
    this.createOrbitingElements();
    this.createParticleField();
    this.createConnectionLines();
    this.addEventListeners();
    this.playIntroAnimation();
    this.isInitialized = true;

    // Ejecutar animación fuera de Angular para mejor rendimiento
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    window.removeEventListener('resize', this.boundOnWindowResize);
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    gsap.killTweensOf(this.mainGroup?.position);
    gsap.killTweensOf(this.mainGroup?.rotation);
    gsap.killTweensOf(this.mainGroup?.scale);
    this.disposeScene();
  }

  private disposeScene(): void {
    this.scene?.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Points || child instanceof THREE.LineSegments) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else if (child.material) {
          (child.material as THREE.Material).dispose();
        }
      }
    });
    this.renderer?.dispose();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.z = 8;
    this.camera.position.y = 1;

    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);
  }

  private getColors() {
    const isDark = this.themeService.currentTheme() === 'dark';
    return isDark ? this.colors.dark : this.colors.light;
  }

  private createCentralStructure(): void {
    const colors = this.getColors();
    this.centralSphere = new THREE.Group();

    // === MANCUERNA / PESA 3D ===

    // Parámetros de la mancuerna
    const barLength = 3.5;
    const barRadius = 0.08;
    const weightRadius = 0.6;
    const weightThickness = 0.35;
    const innerWeightRadius = 0.45;

    // BARRA CENTRAL - Cilindro horizontal
    const barGeometry = new THREE.CylinderGeometry(barRadius, barRadius, barLength, 12);
    const barEdges = new THREE.EdgesGeometry(barGeometry);
    const barMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.primary),
      transparent: true,
      opacity: 1
    });
    const barLines = new THREE.LineSegments(barEdges, barMaterial);
    barLines.rotation.z = Math.PI / 2; // Horizontal
    this.centralSphere.add(barLines);

    // DISCO IZQUIERDO - Exterior
    const leftWeightGeometry = new THREE.CylinderGeometry(weightRadius, weightRadius, weightThickness, 16);
    const leftWeightEdges = new THREE.EdgesGeometry(leftWeightGeometry);
    const leftWeightMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.primary),
      transparent: true,
      opacity: 1
    });
    const leftWeight = new THREE.LineSegments(leftWeightEdges, leftWeightMaterial);
    leftWeight.rotation.z = Math.PI / 2;
    leftWeight.position.x = -barLength / 2 + weightThickness / 2;
    this.centralSphere.add(leftWeight);

    // DISCO IZQUIERDO - Interior (más pequeño)
    const leftInnerGeometry = new THREE.CylinderGeometry(innerWeightRadius, innerWeightRadius, weightThickness + 0.1, 16);
    const leftInnerEdges = new THREE.EdgesGeometry(leftInnerGeometry);
    const leftInnerMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.secondary),
      transparent: true,
      opacity: 0.7
    });
    const leftInner = new THREE.LineSegments(leftInnerEdges, leftInnerMaterial);
    leftInner.rotation.z = Math.PI / 2;
    leftInner.position.x = -barLength / 2 + weightThickness / 2 - 0.2;
    this.centralSphere.add(leftInner);

    // DISCO DERECHO - Exterior
    const rightWeightGeometry = new THREE.CylinderGeometry(weightRadius, weightRadius, weightThickness, 16);
    const rightWeightEdges = new THREE.EdgesGeometry(rightWeightGeometry);
    const rightWeightMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.primary),
      transparent: true,
      opacity: 1
    });
    const rightWeight = new THREE.LineSegments(rightWeightEdges, rightWeightMaterial);
    rightWeight.rotation.z = Math.PI / 2;
    rightWeight.position.x = barLength / 2 - weightThickness / 2;
    this.centralSphere.add(rightWeight);

    // DISCO DERECHO - Interior (más pequeño)
    const rightInnerGeometry = new THREE.CylinderGeometry(innerWeightRadius, innerWeightRadius, weightThickness + 0.1, 16);
    const rightInnerEdges = new THREE.EdgesGeometry(rightInnerGeometry);
    const rightInnerMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.secondary),
      transparent: true,
      opacity: 0.7
    });
    const rightInner = new THREE.LineSegments(rightInnerEdges, rightInnerMaterial);
    rightInner.rotation.z = Math.PI / 2;
    rightInner.position.x = barLength / 2 - weightThickness / 2 + 0.2;
    this.centralSphere.add(rightInner);

    // AGARRES / GRIPS en la barra (detalles)
    const gripGeometry = new THREE.TorusGeometry(barRadius + 0.02, 0.015, 8, 16);
    const gripMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.accent),
      transparent: true,
      opacity: 0.6
    });

    // Múltiples anillos de agarre en el centro
    for (let i = -3; i <= 3; i++) {
      const gripEdges = new THREE.EdgesGeometry(gripGeometry);
      const grip = new THREE.LineSegments(gripEdges, gripMaterial.clone());
      grip.rotation.y = Math.PI / 2;
      grip.position.x = i * 0.15;
      this.centralSphere.add(grip);
    }

    // Escala inicial visible - la animación la hará crecer
    this.centralSphere.scale.set(1, 1, 1);
    this.mainGroup.add(this.centralSphere);
  }

  private createOrbitingElements(): void {
    const colors = this.getColors();

    // Configuración de órbitas - con discos de pesas
    const orbits = [
      { radius: 3.2, count: 4, size: 0.25, speed: 0.4, yOffset: 0 },
      { radius: 4.2, count: 6, size: 0.18, speed: -0.25, yOffset: 0.3 },
      { radius: 5.0, count: 3, size: 0.3, speed: 0.15, yOffset: -0.2 },
    ];

    orbits.forEach((orbit, orbitIndex) => {
      // Crear anillo de órbita visible (más sutil)
      const ringPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(
          Math.cos(angle) * orbit.radius,
          orbit.yOffset,
          Math.sin(angle) * orbit.radius
        ));
      }
      const ringGeometry = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ringMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(colors.accent),
        transparent: true,
        opacity: 0.2
      });
      const ring = new THREE.Line(ringGeometry, ringMaterial);
      ring.rotation.x = orbitIndex * 0.15;
      this.scene.add(ring);

      // Crear elementos orbitantes - DISCOS DE PESAS
      for (let i = 0; i < orbit.count; i++) {
        const angle = (i / orbit.count) * Math.PI * 2;
        const group = new THREE.Group();

        // Disco de pesa (cilindro plano) - exterior
        const discGeometry = new THREE.CylinderGeometry(orbit.size, orbit.size, orbit.size * 0.3, 12);
        const discEdges = new THREE.EdgesGeometry(discGeometry);
        const discMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(colors.primary),
          transparent: true,
          opacity: 0.8
        });
        const disc = new THREE.LineSegments(discEdges, discMaterial);
        group.add(disc);

        // Agujero central del disco (torus pequeño)
        const holeGeometry = new THREE.TorusGeometry(orbit.size * 0.3, orbit.size * 0.05, 6, 12);
        const holeEdges = new THREE.EdgesGeometry(holeGeometry);
        const holeMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(colors.secondary),
          transparent: true,
          opacity: 0.6
        });
        const hole = new THREE.LineSegments(holeEdges, holeMaterial);
        hole.rotation.x = Math.PI / 2;
        group.add(hole);

        group.position.x = Math.cos(angle) * orbit.radius;
        group.position.y = orbit.yOffset;
        group.position.z = Math.sin(angle) * orbit.radius;

        group.userData = {
          orbitRadius: orbit.radius,
          orbitSpeed: orbit.speed,
          orbitAngle: angle,
          yOffset: orbit.yOffset,
          orbitTilt: orbitIndex * 0.15
        };

        this.orbitingObjects.push(group);
        this.scene.add(group);
      }
    });
  }

  private createParticleField(): void {
    const colors = this.getColors();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Distribución más amplia
      const radius = 3 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(colors.particles),
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private createConnectionLines(): void {
    const colors = this.getColors();

    // Crear líneas que conectan elementos
    const linePositions: number[] = [];

    // Líneas desde el centro hacia afuera
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const length = 2.5 + Math.random() * 2;

      linePositions.push(0, 0, 0);
      linePositions.push(
        Math.cos(angle) * length,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * length
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.lines),
      transparent: true,
      opacity: 0.25
    });

    this.connectionLines = new THREE.LineSegments(geometry, material);
    this.mainGroup.add(this.connectionLines);
  }

  private playIntroAnimation(): void {
    // Animación épica de entrada de la estructura central
    gsap.fromTo(this.centralSphere.scale,
      { x: 0.5, y: 0.5, z: 0.5 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 2,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.2
      }
    );

    gsap.to(this.centralSphere.rotation, {
      y: Math.PI * 2,
      duration: 4,
      ease: 'power2.out',
      delay: 0.2
    });

    // Animación de elementos orbitantes
    this.orbitingObjects.forEach((obj, index) => {
      gsap.fromTo(obj.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: 'back.out(2)',
          delay: 0.5 + index * 0.05
        }
      );
    });

    // Fade in de partículas
    if (this.particles.material instanceof THREE.PointsMaterial) {
      gsap.fromTo(this.particles.material,
        { opacity: 0 },
        {
          opacity: 0.6,
          duration: 2.5,
          ease: 'power2.out',
          delay: 0.8
        }
      );
    }

    // Fade in de líneas de conexión
    if (this.connectionLines.material instanceof THREE.LineBasicMaterial) {
      gsap.fromTo(this.connectionLines.material,
        { opacity: 0 },
        {
          opacity: 0.25,
          duration: 2,
          ease: 'power2.out',
          delay: 1
        }
      );
    }
  }

  private updateColors(isDark: boolean): void {
    const colors = isDark ? this.colors.dark : this.colors.light;
    const duration = 0.5;

    // Actualizar estructura central (mancuerna)
    this.centralSphere?.children.forEach((child) => {
      if (child instanceof THREE.LineSegments) {
        const material = child.material as THREE.LineBasicMaterial;
        // Determinar el color basado en la opacidad actual
        let targetColor = colors.primary;
        if (material.opacity < 0.8 && material.opacity >= 0.6) {
          targetColor = colors.secondary;
        } else if (material.opacity < 0.6) {
          targetColor = colors.accent;
        }
        gsap.to(material.color, {
          r: new THREE.Color(targetColor).r,
          g: new THREE.Color(targetColor).g,
          b: new THREE.Color(targetColor).b,
          duration
        });
      }
    });

    // Actualizar elementos orbitantes
    this.orbitingObjects.forEach(obj => {
      obj.children.forEach(child => {
        if (child instanceof THREE.LineSegments) {
          const material = child.material as THREE.LineBasicMaterial;
          gsap.to(material.color, {
            r: new THREE.Color(colors.primary).r,
            g: new THREE.Color(colors.primary).g,
            b: new THREE.Color(colors.primary).b,
            duration
          });
        }
      });
    });

    // Actualizar partículas
    if (this.particles?.material instanceof THREE.PointsMaterial) {
      gsap.to(this.particles.material.color, {
        r: new THREE.Color(colors.particles).r,
        g: new THREE.Color(colors.particles).g,
        b: new THREE.Color(colors.particles).b,
        duration
      });
    }

    // Actualizar líneas de conexión
    if (this.connectionLines?.material instanceof THREE.LineBasicMaterial) {
      gsap.to(this.connectionLines.material.color, {
        r: new THREE.Color(colors.lines).r,
        g: new THREE.Color(colors.lines).g,
        b: new THREE.Color(colors.lines).b,
        duration
      });
    }
  }

  private addEventListeners(): void {
    window.addEventListener('resize', this.boundOnWindowResize);
    window.addEventListener('mousemove', this.boundOnMouseMove);
  }

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
    const elapsedTime = this.clock.getElapsedTime();

    // Rotación principal del grupo basada en mouse
    if (this.mainGroup) {
      const targetRotationY = this.mouseX * 0.3;
      const targetRotationX = this.mouseY * 0.15;

      this.mainGroup.rotation.y += (targetRotationY - this.mainGroup.rotation.y) * 0.02;
      this.mainGroup.rotation.x += (targetRotationX - this.mainGroup.rotation.x) * 0.02;
    }

    // Rotación continua de la mancuerna - movimiento elegante
    if (this.centralSphere) {
      // Rotación suave del grupo completo
      this.centralSphere.rotation.y += 0.005;
      this.centralSphere.rotation.z = Math.sin(elapsedTime * 0.5) * 0.15;
      this.centralSphere.rotation.x = Math.cos(elapsedTime * 0.3) * 0.1;
    }

    // Animación de elementos orbitantes
    this.orbitingObjects.forEach((obj) => {
      const data = obj.userData;
      data['orbitAngle'] += data['orbitSpeed'] * 0.01;

      obj.position.x = Math.cos(data['orbitAngle']) * data['orbitRadius'];
      obj.position.z = Math.sin(data['orbitAngle']) * data['orbitRadius'];

      // Aplicar inclinación de órbita
      const tiltedY = obj.position.y * Math.cos(data['orbitTilt']) - obj.position.z * Math.sin(data['orbitTilt']);
      const tiltedZ = obj.position.y * Math.sin(data['orbitTilt']) + obj.position.z * Math.cos(data['orbitTilt']);
      obj.position.y = data['yOffset'] + Math.sin(elapsedTime + data['orbitAngle']) * 0.2;

      // Rotación propia
      obj.rotation.x += 0.02;
      obj.rotation.y += 0.02;
    });

    // Rotación lenta de partículas
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.03;
      this.particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
    }

    // Rotación de líneas de conexión
    if (this.connectionLines) {
      this.connectionLines.rotation.y = elapsedTime * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
