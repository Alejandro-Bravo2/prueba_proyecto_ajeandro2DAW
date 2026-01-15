import {
  Component,
  ElementRef,
  OnDestroy,
  NgZone,
  ViewChild,
  AfterViewInit,
  effect,
  input
} from '@angular/core';
import * as THREE from 'three';
import gsap from 'gsap';
import { ThemeService } from '../../../core/services/theme.service';

/**
 * Componente de escena 3D para la sección de nutrición.
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
 * <app-nutrition-scene></app-nutrition-scene>
 * <app-nutrition-scene [compact]="true"></app-nutrition-scene>
 * ```
 */
@Component({
  selector: 'app-nutrition-scene',
  standalone: true,
  imports: [],
  template: `<canvas #canvas class="nutrition-scene__canvas"></canvas>`,
  styleUrls: ['./nutrition-scene.component.scss']
})
export class NutritionSceneComponent implements AfterViewInit, OnDestroy {
  /**
   * Referencia al elemento canvas para renderizado Three.js WebGL.
   * @description Usa static: true para acceso inmediato antes de ngAfterViewInit.
   * El canvas se usa para inicializar WebGLRenderer y manejar eventos de resize.
   */
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly compact = input(false);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private mainGroup!: THREE.Group;
  private appleGroup!: THREE.Group;
  private bowlGroup!: THREE.Group;
  private floatingFruits: THREE.Group[] = [];
  private particles!: THREE.Points;
  private frameId: number = 0;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private clock = new THREE.Clock();
  private isInitialized = false;

  private boundOnWindowResize = this.onWindowResize.bind(this);
  private boundOnMouseMove = this.onMouseMove.bind(this);

  private colors = {
    light: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      particles: '#000000',
      fruit: '#1a1a1a'
    },
    dark: {
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#999999',
      particles: '#ffffff',
      fruit: '#e5e5e5'
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
      console.error('NutritionSceneComponent: Canvas element not found');
      return;
    }

    this.initThree();
    this.createApple();
    this.createBowl();
    this.createFloatingFruits();
    this.createParticleField();
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
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();

    const fov = this.compact() ? 60 : 50;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    this.camera.position.z = this.compact() ? 6 : 8;
    this.camera.position.y = 0.5;

    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);
  }

  private getColors() {
    const isDark = this.themeService.currentTheme() === 'dark';
    return isDark ? this.colors.dark : this.colors.light;
  }

  private createApple(): void {
    const colors = this.getColors();
    this.appleGroup = new THREE.Group();

    // Apple body using lathe geometry for organic shape
    const applePoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI;
      // Apple profile with indent at top
      let radius = Math.sin(angle) * 0.8;
      if (t < 0.15) {
        radius *= 0.7 + t * 2; // Indent at top
      }
      if (t > 0.85) {
        radius *= 1 - (t - 0.85) * 3; // Taper at bottom
      }
      applePoints.push(new THREE.Vector2(radius, (t - 0.5) * 1.2));
    }

    const appleGeometry = new THREE.LatheGeometry(applePoints, 16);
    const appleEdges = new THREE.EdgesGeometry(appleGeometry, 15);
    const appleMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.primary),
      transparent: true,
      opacity: 1
    });
    const apple = new THREE.LineSegments(appleEdges, appleMaterial);
    this.appleGroup.add(apple);

    // Apple stem
    const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.25, 6);
    const stemEdges = new THREE.EdgesGeometry(stemGeometry);
    const stemMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.secondary),
      transparent: true,
      opacity: 0.8
    });
    const stem = new THREE.LineSegments(stemEdges, stemMaterial);
    stem.position.y = 0.65;
    stem.rotation.z = 0.1;
    this.appleGroup.add(stem);

    // Apple leaf
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.15, 0.1, 0.3, 0);
    leafShape.quadraticCurveTo(0.15, -0.05, 0, 0);

    const leafGeometry = new THREE.ShapeGeometry(leafShape);
    const leafEdges = new THREE.EdgesGeometry(leafGeometry);
    const leafMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.accent),
      transparent: true,
      opacity: 0.7
    });
    const leaf = new THREE.LineSegments(leafEdges, leafMaterial);
    leaf.position.set(0.05, 0.7, 0);
    leaf.rotation.z = -0.3;
    leaf.rotation.y = 0.5;
    this.appleGroup.add(leaf);

    this.appleGroup.position.set(-1.5, 0, 0);
    this.appleGroup.scale.set(1.2, 1.2, 1.2);
    this.mainGroup.add(this.appleGroup);
  }

  private createBowl(): void {
    const colors = this.getColors();
    this.bowlGroup = new THREE.Group();

    // Bowl using lathe geometry
    const bowlPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 15; i++) {
      const t = i / 15;
      const radius = 0.3 + t * 0.8;
      const y = t * t * 0.6;
      bowlPoints.push(new THREE.Vector2(radius, y));
    }

    const bowlGeometry = new THREE.LatheGeometry(bowlPoints, 24);
    const bowlEdges = new THREE.EdgesGeometry(bowlGeometry, 15);
    const bowlMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.primary),
      transparent: true,
      opacity: 0.9
    });
    const bowl = new THREE.LineSegments(bowlEdges, bowlMaterial);
    bowl.position.y = -0.3;
    this.bowlGroup.add(bowl);

    // Bowl rim ring
    const rimGeometry = new THREE.TorusGeometry(1.1, 0.03, 8, 32);
    const rimEdges = new THREE.EdgesGeometry(rimGeometry);
    const rimMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.secondary),
      transparent: true,
      opacity: 0.7
    });
    const rim = new THREE.LineSegments(rimEdges, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.3;
    this.bowlGroup.add(rim);

    // Small fruits inside bowl
    this.createSmallFruit(this.bowlGroup, 0.2, { x: 0.3, y: 0.1, z: 0.2 }, colors);
    this.createSmallFruit(this.bowlGroup, 0.18, { x: -0.2, y: 0.05, z: 0.3 }, colors);
    this.createSmallFruit(this.bowlGroup, 0.22, { x: 0, y: 0.15, z: -0.2 }, colors);

    this.bowlGroup.position.set(1.5, -0.5, 0);
    this.mainGroup.add(this.bowlGroup);
  }

  private createSmallFruit(parent: THREE.Group, size: number, pos: { x: number; y: number; z: number }, colors: any): void {
    const fruitGeometry = new THREE.SphereGeometry(size, 8, 6);
    const fruitEdges = new THREE.EdgesGeometry(fruitGeometry);
    const fruitMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(colors.fruit),
      transparent: true,
      opacity: 0.6
    });
    const fruit = new THREE.LineSegments(fruitEdges, fruitMaterial);
    fruit.position.set(pos.x, pos.y, pos.z);
    parent.add(fruit);
  }

  private createFloatingFruits(): void {
    const colors = this.getColors();

    // Create various floating fruits
    const fruitConfigs = [
      { type: 'orange', pos: { x: 2.5, y: 1, z: -1 }, size: 0.4 },
      { type: 'lemon', pos: { x: -2.5, y: 0.8, z: -0.5 }, size: 0.35 },
      { type: 'grape', pos: { x: 0, y: 1.5, z: -1.5 }, size: 0.15 },
      { type: 'banana', pos: { x: -0.5, y: -1.2, z: 1 }, size: 0.5 },
      { type: 'orange', pos: { x: 2, y: -0.8, z: 0.5 }, size: 0.3 },
    ];

    fruitConfigs.forEach((config, index) => {
      const fruitGroup = new THREE.Group();

      if (config.type === 'orange' || config.type === 'lemon') {
        // Citrus fruit - sphere with segments
        const segments = config.type === 'lemon' ? 6 : 8;
        const geometry = new THREE.SphereGeometry(config.size, segments, segments);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(colors.primary),
          transparent: true,
          opacity: 0.7
        });
        const fruit = new THREE.LineSegments(edges, material);

        // If lemon, scale to make it elliptical
        if (config.type === 'lemon') {
          fruit.scale.set(1, 0.7, 0.7);
        }
        fruitGroup.add(fruit);
      } else if (config.type === 'grape') {
        // Grape cluster - multiple small spheres
        for (let i = 0; i < 5; i++) {
          const grapeGeometry = new THREE.SphereGeometry(config.size, 6, 4);
          const grapeEdges = new THREE.EdgesGeometry(grapeGeometry);
          const grapeMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(colors.secondary),
            transparent: true,
            opacity: 0.6
          });
          const grape = new THREE.LineSegments(grapeEdges, grapeMaterial);
          grape.position.set(
            (Math.random() - 0.5) * 0.2,
            i * 0.12 - 0.2,
            (Math.random() - 0.5) * 0.2
          );
          fruitGroup.add(grape);
        }
      } else if (config.type === 'banana') {
        // Banana - curved cylinder
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(-0.3, 0, 0),
          new THREE.Vector3(0, 0.15, 0),
          new THREE.Vector3(0.3, 0, 0)
        );
        const bananaGeometry = new THREE.TubeGeometry(curve, 12, 0.08, 6, false);
        const bananaEdges = new THREE.EdgesGeometry(bananaGeometry);
        const bananaMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(colors.primary),
          transparent: true,
          opacity: 0.7
        });
        const banana = new THREE.LineSegments(bananaEdges, bananaMaterial);
        fruitGroup.add(banana);
      }

      fruitGroup.position.set(config.pos.x, config.pos.y, config.pos.z);
      fruitGroup.userData = {
        originalY: config.pos.y,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      this.floatingFruits.push(fruitGroup);
      this.scene.add(fruitGroup);
    });
  }

  private createParticleField(): void {
    const colors = this.getColors();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2 + Math.random() * 4;
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
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private playIntroAnimation(): void {
    // Apple entrance
    gsap.fromTo(this.appleGroup.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1.2, y: 1.2, z: 1.2,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.2
      }
    );

    gsap.fromTo(this.appleGroup.rotation,
      { y: -Math.PI },
      {
        y: 0,
        duration: 2,
        ease: 'power3.out',
        delay: 0.2
      }
    );

    // Bowl entrance
    gsap.fromTo(this.bowlGroup.scale,
      { x: 0, y: 0, z: 0 },
      {
        x: 1, y: 1, z: 1,
        duration: 1.5,
        ease: 'elastic.out(1, 0.6)',
        delay: 0.4
      }
    );

    gsap.fromTo(this.bowlGroup.position,
      { y: -2 },
      {
        y: -0.5,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.4
      }
    );

    // Floating fruits entrance
    this.floatingFruits.forEach((fruit, index) => {
      gsap.fromTo(fruit.scale,
        { x: 0, y: 0, z: 0 },
        {
          x: 1, y: 1, z: 1,
          duration: 1,
          ease: 'back.out(2)',
          delay: 0.6 + index * 0.1
        }
      );
    });

    // Particles fade in
    if (this.particles.material instanceof THREE.PointsMaterial) {
      gsap.fromTo(this.particles.material,
        { opacity: 0 },
        {
          opacity: 0.4,
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

    // Update apple
    this.appleGroup?.traverse((child) => {
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

    // Update bowl
    this.bowlGroup?.traverse((child) => {
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

    // Update floating fruits
    this.floatingFruits.forEach(fruit => {
      fruit.traverse((child) => {
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

    // Update particles
    if (this.particles?.material instanceof THREE.PointsMaterial) {
      gsap.to(this.particles.material.color, {
        r: new THREE.Color(colors.particles).r,
        g: new THREE.Color(colors.particles).g,
        b: new THREE.Color(colors.particles).b,
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

    // Mouse-based rotation
    if (this.mainGroup) {
      const targetRotationY = this.mouseX * 0.2;
      const targetRotationX = this.mouseY * 0.1;

      this.mainGroup.rotation.y += (targetRotationY - this.mainGroup.rotation.y) * 0.03;
      this.mainGroup.rotation.x += (targetRotationX - this.mainGroup.rotation.x) * 0.03;
    }

    // Apple gentle rotation
    if (this.appleGroup) {
      this.appleGroup.rotation.y += 0.003;
      this.appleGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.1;
    }

    // Bowl subtle movement
    if (this.bowlGroup) {
      this.bowlGroup.rotation.y -= 0.002;
    }

    // Floating fruits animation
    this.floatingFruits.forEach((fruit) => {
      const data = fruit.userData;
      fruit.position.y = data['originalY'] + Math.sin(elapsedTime * data['floatSpeed'] + data['floatOffset']) * 0.15;
      fruit.rotation.x += data['rotationSpeed'];
      fruit.rotation.y += data['rotationSpeed'] * 0.5;
    });

    // Particles rotation
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
