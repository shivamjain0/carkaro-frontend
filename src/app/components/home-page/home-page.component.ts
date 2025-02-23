import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  isMenuOpen: boolean = false;
  isLoginUser: boolean = false;

  ngOnInit(): void {
    this.isLoginUser = Boolean(localStorage.getItem('isLogin'));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // This listens to the click event anywhere on the component
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.isMenuOpen = false;
  } 

  logout() {
    localStorage.removeItem('isLogin');
  }
}
