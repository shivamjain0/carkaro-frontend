import { CommonModule } from '@angular/common';
import { Component, inject, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  isLogin = true;
  errMsg: string = '';
  signupData: FormGroup = new FormGroup({
    name: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
    age: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
    gender: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
    contactNo: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)],
      updateOn: 'blur'
    }),
    password: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
    confirmPass: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
  });

  signup() {
    const signupData = this.signupData.value;
    console.log("sign up data :", signupData);
  }

  route = inject(Router);
  userService = inject(UserService);

  loginData: FormGroup = new FormGroup({
    email: new FormControl('', {
        validators: [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)],
        updateOn: 'blur'
      }
    ),
    password: new FormControl('', { 
      validators: Validators.required, 
      updateOn: 'blur' 
    }),
  });
  
  ngOnInit() {
  }

  validateEmail(email: string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  login() {
    const loginData = this.loginData.value;
    if(this.loginData.valid) {
      this.userService.login(loginData.email, loginData.password)
      .subscribe((res) => {
        console.log("is valid user :", res);
        if(res) {
          this.route.navigateByUrl('homePage/search')
        } else {
          alert('Invalid email/password');
        }
      })
    } else {
      alert('Invalid email/password');
    }
  }

  getErrMsg(field: string) {
    const control = 
      this.isLogin ? this.loginData.controls[field] : this.signupData.controls['email'];
    if(control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  updateErrMsg(field: string) {
    this.errMsg = this.getErrMsg(field);
  }
}
