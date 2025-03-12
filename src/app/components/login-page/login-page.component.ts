import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { HomePageComponent } from '../home-page/home-page.component';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    HomePageComponent,
    RouterLink,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  isLogin = true;
  errMsg: { [key: string]: string } = {}; // or errMsg: Record<string,string> = {}
  signupData!: FormGroup;
  loginData!: FormGroup;

  val: string = '';
  task: string[] = [];
  editInd: number = -1;
  editVal: string = '';

  addTask() {
    if (this.val.trim()) {
      this.task.push(this.val.trim());
      this.val = '';
    }
  }

  deleteTask(ind: number) {
    this.task.splice(ind, 1);
  }

  editTask(ind: number) {
    this.editInd = ind;
    this.editVal = this.task[ind];
  }

  save() {
    if (this.editVal.trim() && this.editInd !== -1) {
      this.task[this.editInd] = this.editVal.trim();
      this.editInd = -1;
    }
  }

  cancel() {
    this.editInd = -1;
  }

  trackByIndex(ind: number) {
    console.log("hello");
    return ind;
  }

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) {}

  // We can also use FormBuilder here, instead of FormGroup
  initializeForms() {
    this.signupData = new FormGroup(
      {
        name: new FormControl('', Validators.required),
        age: new FormControl('', Validators.required),
        gender: new FormControl('', Validators.required),
        contact: new FormControl('', [
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/),
        ]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', Validators.required),
        confirmPass: new FormControl('', Validators.required),
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    this.loginData = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  // AbstractControl is the base class for all form controls in Angular's Reactive Forms.
  // In a validator function, Angular provides the entire form group (FormGroup) as an AbstractControl
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPass = group.get('confirmPass');

    if (!confirmPass) return null;

    if (password !== confirmPass?.value) {
      confirmPass.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPass.setErrors(null); // Clear error if they match
      return null;
    }
  }

  ngOnInit() {
    this.initializeForms();
    this.checkLoginStatus();

    // Query params are in string, so " ==='true' " is converting it into boolean
    combineLatest([
      this.activatedRoute.queryParams,
      this.activatedRoute.data,
    ]).subscribe(([queryParams, data]) => {
      this.isLogin =
        queryParams['isLogin'] !== undefined
          ? queryParams['isLogin'] === 'true'
          : data['isLogin'];
    });
  }

  checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLogin');
    console.log('isLogin :', isLoggedIn);
    if (isLoggedIn) {
      this.route.navigateByUrl('homePage/search');
    }
  }

  login() {
    const loginData = this.loginData.value;
    if (this.loginData.valid) {
      this.userService
        .login(loginData.email, loginData.password)
        .subscribe((res: boolean) => {
          console.log('is valid user :', res, typeof res);
          if (res) {
            localStorage.setItem('isLogin', String(res));
            this.route.navigateByUrl('homePage/search');
          } else {
            alert('Invalid email/password');
          }
        });
    } else {
      alert('Invalid email/password');
    }
  }

  signup() {
    if (this.signupData.valid) {
      const { confirmPass = '', ...signupData } = {
        ...this.signupData.value,
        age: Number(this.signupData.value.age),
      };
      console.log('sign up data :', signupData);

      this.userService.createUser(signupData).subscribe({
        next: (res) => {
          console.log('create user res :', res);
        },
        error: (err) => {
          console.log('create user error res :', err.error);
        },
        complete: () => {
          this.route.navigate(['login'], { queryParams: { isLogin: true } });
          alert('User created successfully');
        },
      });
    }
  }

  getErrMsg(field: string) {
    const control = this.isLogin
      ? this.loginData.controls[field]
      : this.signupData.controls[field];
    if (control.errors) {
      if (control.errors['required']) return `Required field`;
      if (control.errors[field] || control.errors['pattern'])
        return 'Invalid field format';
      if (control.errors['passwordMismatch']) return 'Password mismatch';
    }
    return '';
  }

  updateErrMsg(field: string) {
    this.errMsg[field] = this.getErrMsg(field);
  }
}
