import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

/**
 * Componente de inicio de sesion
 *
 * Lee el queryParam returnUrl para redirigir al usuario
 * a la pagina original despues de iniciar sesion.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** URL de retorno despues del login (desde queryParams) */
  private returnUrl: string = '/';

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    // Leer el returnUrl de los queryParams
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

    // Si ya esta logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      if (username && password) {
        this.authService.login(username, password).subscribe({
          next: (response) => {
            console.log('Login successful', response);
            // Verificar si el usuario necesita completar el onboarding
            if (this.authService.needsOnboarding()) {
              this.router.navigateByUrl('/onboarding');
            } else {
              // Navegar a la URL de retorno despues del login exitoso
              this.router.navigateByUrl(this.returnUrl);
            }
          },
          error: (err) => {
            console.error('Login failed', err);
          }
        });
      }
    } else {
      console.log('Form is invalid');
      this.loginForm.markAllAsTouched();
    }
  }
}
