import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { createUserDTO } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiurl: string = 'http://localhost:3000/users';
  private http = inject(HttpClient);

  constructor() { }

  login(email: string, password: string) {
    return this.http.post<boolean>(`${this.apiurl}/login`, {email, password});
  }

  createUser(user: createUserDTO) {
    
  }
}
