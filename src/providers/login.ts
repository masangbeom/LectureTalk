import { Injectable, NgZone } from '@angular/core';
import { Facebook } from 'ng2-cordova-oauth/core';
import { OauthCordova } from 'ng2-cordova-oauth/platform/cordova';
import * as firebase from 'firebase';
import { Login } from '../login';
import { NavController } from 'ionic-angular';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';
import { GooglePlus } from 'ionic-native';

@Injectable()
export class LoginProvider {
  // 로그인 Provider
  // 이 Provider 클래스는 로그인에 대한 기능을 담고 있는 페이지입니다.
  private oauth: OauthCordova;
  private navCtrl: NavController;
  private facebookProvider = new Facebook({
    clientId: Login.facebookAppId,
    appScope: ["email"]
  });

  constructor(public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public zone: NgZone) {
    console.log("Initializing Login Provider");
    this.oauth = new OauthCordova();
    // Firebase 사용자의 변경 사항을 찾고 사용자에 따라 화면을 재설정합니다.
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        if (user["isAnonymous"]) {
        } else {
          if (Login.emailVerification) {
            if (user["emailVerified"]) {
              //console.log("auth 들어왓져엽");
              //Goto Home Page.
              this.zone.run(() => {
                //console.log("g0 to homepage~");
                this.navCtrl.setRoot(Login.homePage, { animate: false });
              });
            } else {
              //Goto Verification Page.
              //console.log("g0 to verif page~");
              this.navCtrl.setRoot(Login.verificationPage, { animate: false });
            }
          } else {
            //Goto Home Page.
            this.zone.run(() => {
              this.navCtrl.setRoot(Login.homePage, { animate: false });
            });
            //Since we're using a TabsPage an NgZone is required.
          }
        }
      }
    });
  }

  setNavController(navCtrl) {
    this.navCtrl = navCtrl;
  }

  
  // 6차시도 실패
  // facebookLogin() {
  //   this.oauth.logInVia(this.facebookProvider).then(success => {
  //     let credential = firebase.auth.FacebookAuthProvider.credential(success['access_token']);
  //     this.loadingProvider.show();
  //     firebase.auth().signInWithCredential(credential)
  //       .then((success) => {
  //         this.loadingProvider.hide();
  //       })
  //       .catch((error) => {
  //         this.loadingProvider.hide();
  //         let code = error["code"];
  //         this.alertProvider.showErrorMessage(code);
  //       });
  //   }, error => { });
  // }

  // 6차시도 실패
  // googleLogin() {
  //   this.loadingProvider.show();
  //   GooglePlus.login({
  //     'webClientId': Login.googleClientId
  //   }).then((success) => {
  //     let credential = firebase.auth.GoogleAuthProvider.credential(success['idToken'], null);
  //     firebase.auth().signInWithCredential(credential)
  //       .then((success) => {
  //         this.loadingProvider.hide();
  //       })
  //       .catch((error) => {
  //         this.loadingProvider.hide();
  //         let code = error["code"];
  //         this.alertProvider.showErrorMessage(code);
  //       });
  //   }, error => { this.loadingProvider.hide(); });
  // }


  // Firebase에 저장되어 있는 메일과 비밀번호로 로그인을 합니다.
  emailLogin(email, password) {
    //console.log("emaillogin()들어왓져엽");
    this.loadingProvider.show();
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((success) => {
      //  console.log("성공");
        this.loadingProvider.hide();
      })
      .catch((error) => {
        //console.log("실패");
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

  // Firebase에 메일과 비밀번호로 회원가입을 합니다.
  register(email, password) {
    this.loadingProvider.show();
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((success) => {
        this.loadingProvider.hide();
      })
      .catch((error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

  // 비밀번호 재설정 메일을 보냅니다.
  sendPasswordReset(email) {
    this.loadingProvider.show();
    firebase.auth().sendPasswordResetEmail(email)
      .then((success) => {
        this.loadingProvider.hide();
        this.alertProvider.showPasswordResetMessage(email);
      })
      .catch((error) => {
        this.loadingProvider.hide();
        let code = error["code"];
        this.alertProvider.showErrorMessage(code);
      });
  }

}
