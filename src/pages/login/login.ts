import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginProvider } from '../../providers/login';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validator } from '../../validator';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private mode: string;
  private emailPasswordForm: FormGroup;
  private emailForm: FormGroup;
  // 로그인 페이지
  // 이 페이지는 앱에 회원가입이나 로그인을 할수 있는 페이지입니다.
  // loginProvider와 setNavController가 앱의 경로를 지시하므로 초기화 해야한다.
  constructor(public navCtrl: NavController, public loginProvider: LoginProvider, public formBuilder: FormBuilder) {
    // navController와 loginProvider를 연결해야한다.
    this.loginProvider.setNavController(this.navCtrl);
    // validator.ts에서 설정된 유효성을 기반으로 validator을 생성한다.
    this.emailPasswordForm = formBuilder.group({
      email: Validator.emailValidator,
      password: Validator.passwordValidator
    });
    this.emailForm = formBuilder.group({
      email: Validator.emailValidator
    });
  }

  ionViewDidLoad() {
    // 메인화면에서 view를 설정합니다.
    this.mode = 'main';
  }

  // loginProvider을 호출하고 메일과 비밀번호를 통해 로그인한다.
  // You may be wondering where the login function for Facebook and Google are.
  // They are called directly from the html markup via loginProvider.facebookLogin() and loginProvider.googleLogin().
  login() {
    this.loginProvider.emailLogin(this.emailPasswordForm.value["email"], this.emailPasswordForm.value["password"]);    
  }

  // loginProvider을 호출하고 메일과 비밀번호를 통해 회원가입을 한다.
  register() {
    this.loginProvider.register(this.emailPasswordForm.value["email"], this.emailPasswordForm.value["password"]);
  }

  // loginProvider을 호출하고 비밀번호 재설정 메일을 전송한다.
  forgotPassword() {
    this.loginProvider.sendPasswordReset(this.emailForm.value["email"]);
    this.clearForms();
  }

  // 초기화 형태.
  clearForms() {
    this.emailPasswordForm.reset();
    this.emailForm.reset();
  }
}
