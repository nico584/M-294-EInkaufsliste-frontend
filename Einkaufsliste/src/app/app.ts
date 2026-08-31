import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLogin } from './components/app-login/app-login';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppLogin],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Einkaufsliste');
}
