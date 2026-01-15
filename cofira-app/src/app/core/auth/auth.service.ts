import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isOnboarded: boolean;
  onboarding?: UserOnboarding;
}

export interface UserOnboarding {
  primaryGoal: string;
  targetWeight?: number;
  currentWeight?: number;
  fitnessLevel: string;
  trainingDays: number;
  sessionDuration: number;
  preferredTime: string;
  dietType: string;
  mealsPerDay: number;
  allergies: string[];
  injuries: string[];
  equipment: string[];
}

export interface NutritionTargets {
  calculatedBMR: number;
  calculatedTDEE: number;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface OnboardingRequest {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number;
  activityLevel:
    | 'SEDENTARY'
    | 'LIGHTLY_ACTIVE'
    | 'MODERATELY_ACTIVE'
    | 'VERY_ACTIVE'
    | 'EXTRA_ACTIVE';
  workType: 'OFFICE_DESK' | 'STANDING' | 'PHYSICAL_LABOR';
  sleepHoursAverage?: number;
  primaryGoal: 'LOSE_WEIGHT' | 'GAIN_MUSCLE' | 'MAINTAIN' | 'IMPROVE_HEALTH';
  fitnessLevel: string;
  trainingDaysPerWeek: number;
  sessionDurationMinutes?: number;
  preferredTrainingTime?: string;
  dietType: string;
  mealsPerDay?: number;
  allergies?: string[];
  injuries?: string[];
  equipment?: string[];
  medicalConditions?: string[];
  medications?: string;
  previousSurgeries?: string[];
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
}

export interface OnboardingResponse {
  userId: number;
  message: string;
  isOnboarded: boolean;
  onboardingCompletedAt: string;
  nutritionTargets: NutritionTargets;
}

// Respuesta real del backend
interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  rol: string;
  isOnboarded: boolean;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  nombre: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterWithOnboardingRequest {
  // Registration data
  nombre: string;
  username: string;
  email: string;
  password: string;
  // Onboarding data
  gender: string;
  birthDate: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number;
  activityLevel: string;
  workType: string;
  sleepHoursAverage?: number;
  primaryGoal: string;
  fitnessLevel: string;
  trainingDaysPerWeek: number;
  sessionDurationMinutes?: number;
  preferredTrainingTime?: string;
  dietType: string;
  mealsPerDay?: number;
  allergies?: string[];
  injuries?: string[];
  equipment?: string[];
  medicalConditions?: string[];
  medications?: string | null;
  previousSurgeries?: string[];
  isPregnant?: boolean;
  isBreastfeeding?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // Reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Initialize from localStorage
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { username, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginRequest).pipe(
      tap((response) => {
        this.saveToken(response.token);
        const user = this.mapResponseToUser(response);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(
    nombre: string,
    username: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    const registerRequest: RegisterRequest = { nombre, username, email, password };
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerRequest).pipe(
      tap((response) => {
        this.saveToken(response.token);
        const user = this.mapResponseToUser(response);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  private mapResponseToUser(response: AuthResponse): User {
    return {
      id: response.id.toString(),
      email: response.email,
      name: response.username,
      isOnboarded: response.isOnboarded ?? false,
    };
  }

  async completeOnboarding(data: OnboardingRequest): Promise<OnboardingResponse> {
    const response = await firstValueFrom(
      this.http.post<OnboardingResponse>(`${environment.apiUrl}/onboarding/complete`, data)
    );

    // Actualizar el usuario local
    const currentUser = this.currentUser();
    if (currentUser && response.isOnboarded) {
      const updatedUser: User = {
        ...currentUser,
        isOnboarded: true,
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      this.currentUser.set(updatedUser);
    }

    return response;
  }

  async registerWithOnboarding(data: RegisterWithOnboardingRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.API_URL}/register-with-onboarding`, data)
    );

    // Save token and user
    this.saveToken(response.token);
    const user: User = {
      id: response.id.toString(),
      email: response.email,
      name: response.username,
      isOnboarded: true, // Already completed
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);

    return response;
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  needsOnboarding(): boolean {
    const user = this.currentUser();
    return user !== null && !user.isOnboarded;
  }

  logout(): Observable<unknown> {
    this.clearStorage();
    return of(null);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.API_URL}/profile`).pipe(
      tap((response) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
    );
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.API_URL}/refresh`, {}).pipe(
      tap((response) => {
        this.saveToken(response.token);
      })
    );
  }

  requestPasswordResetCode(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password`, {
      email,
      code,
      newPassword,
    });
  }
}
