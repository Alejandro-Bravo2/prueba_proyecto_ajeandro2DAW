import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { LoadingSpinner } from './shared/components/spinner/loading-spinner/loading-spinner';
import { ToastContainer } from './shared/components/toast/toast-container/toast-container/toast-container';
import { Modal } from './shared/components/modal/modal/modal';
import { Breadcrumbs } from './shared/components/breadcrumbs/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, LoadingSpinner, ToastContainer, Modal, Breadcrumbs],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  title = 'COFIRA';
}
