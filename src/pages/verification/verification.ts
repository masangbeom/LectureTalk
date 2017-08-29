import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, App } from 'ionic-angular';
import { LogoutProvider } from '../../providers/logout';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { AngularFire } from 'angularfire2';
import { Validator } from '../../validator';
import * as firebase from 'firebase';

@Component({
  selector: 'page-verification',
  templateUrl: 'verification.html'
})
export class VerificationPage {
  // 인증페이지
  // 이 페이지는 이메일 확인이 필요시 인증확인을 해주는 페이지입니다.
  // 이메일에서 확인을 한다면 인증 확인에 몇 초정도 소요될 수 있습니다.
  // 계정 인증이 완료 된다면 홈페이지에 접속이 가능합니다.
  private user: any;
  private alert;
  private checkVerified;
  private emailVerified;
  private isLoggingOut;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, public app: App,
    public logoutProvider: LogoutProvider, public loadingProvider: LoadingProvider,
    public angularfire: AngularFire, public alertProvider: AlertProvider) {
    // Hook our logout provider with the app.
    this.logoutProvider.setApp(this.app);
  }

  ionViewDidLoad() {
    // routeGuard의 상태를 false로 설정하여 그 다음 페이지로 들어가지 못하게 합니다.
    this.emailVerified = false;
    this.isLoggingOut = false;
    // 유저의 정보를 가져오고 메일인증을 보냅니다.
    this.getUserData();
    this.sendEmailVerification();
    // 메일인증 확인.
    var that = this;
    that.checkVerified = setInterval(function() {
      firebase.auth().currentUser.reload();
      if (firebase.auth().currentUser.emailVerified) {
        clearInterval(that.checkVerified);
        that.emailVerified = true;
        that.alertProvider.showEmailVerifiedMessageAndRedirect(that.navCtrl);
      }
    }, 1000);
  }

  ionViewCanLeave(): boolean {
    // 메일 확인이 되거나 사용자 로그아웃을 하기 전까지는 이 페이지에서 빠져 나갈수 없습니다.
    if (this.emailVerified || this.isLoggingOut) {
      return true;
    } else {
      return false;
    }
  }

  // 유저의 정보를 Firebase에서 가져와서 화면에 띄웁니다.
  getUserData() {
    let user = firebase.auth().currentUser;
    var userId, name, provider, img, email;
    let providerData = user.providerData[0];

    userId = user.uid;

    // Firebase에서 유저의 name을 검색합니다.
    if (user.displayName || providerData.displayName) {
      name = user.displayName;
      name = providerData.displayName;
    } else {
      name = "GetAppCode.com";
    }

    // Firebase에서 유저의 provider을 검색합니다.
    if (providerData.providerId == 'password') {
      provider = "Firebase";
    } else if (providerData.providerId == 'facebook.com') {
      provider = "Facebook";
    } else if (providerData.providerId == 'google.com') {
      provider = "Google";
    }

    // Firebase에서 유저의 photoURL을 검색합니다.
    if (user.photoURL || providerData.photoURL) {
      img = user.photoURL;
      img = providerData.photoURL;
    } else {
      img = "assets/images/profile.png";
    }

    // Firebase에서 유저의 메일을 검색합니다.
    email = user.email;

    // 마크 업 html을 사용자 변수로 설정합니다.
    this.user = {
      userId: userId,
      name: name,
      provider: provider,
      img: img,
      email: email
    };
  }

  // 가입자에게 이메일 확인 메일을 발송합니다.
  sendEmailVerification() {
    this.loadingProvider.show();
    firebase.auth().currentUser.sendEmailVerification()
      .then((success) => {
        this.alertProvider.showEmailVerificationSentMessage(firebase.auth().currentUser.email);
        this.loadingProvider.hide();
      });
  }

  // 사용자 이메일 세팅
  setEmail() {
    this.alert = this.alertCtrl.create({
      title: '이메일 변경',
      message: "변경하시려는 이메일을 입력해주세요.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email 입력',
          value: firebase.auth().currentUser.email
        }
      ],
      buttons: [
        {
          text: '취소',
          handler: data => { }
        },
        {
          text: '저장',
          handler: data => {
            let email = data["email"];
            // 현재의 메일이 기존의 메일과 같은지 확인
            if (firebase.auth().currentUser.email != email) {
              // 이메일이 유효한지 확인
              if (Validator.profileEmailValidator.pattern.test(email)) {
                this.loadingProvider.show();
                // Firebase에 이메일 업데이트
                firebase.auth().currentUser.updateEmail(email)
                  .then((success) => {
                    Validator.profileEmailValidator.pattern.test(email);
                    this.loadingProvider.hide();
                    // ionViewDidLoad를 호출 시 기존 인터벌을 전부 지우고, 호출 된 후 인터벌이 생성됨.
                    clearInterval(this.checkVerified);
                    // 사용자 마크업을 업데이트하고 자동으로 확인 메일을 보내기 위해 ionViewDidLoad를 호출.
                    this.ionViewDidLoad();
                    // 사용자의 데이터를 데이터 베이스에 업데이트.
                    firebase.database().ref('accounts/' + firebase.auth().currentUser.uid).once('value')
                      .then((account) => {
                        if (account.val()) {
                          this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid).update({
                            email: email
                          });
                        }
                      });
                  })
                  .catch((error) => {
                    //에러
                    this.loadingProvider.hide();
                    let code = error["code"];
                    this.alertProvider.showErrorMessage(code);
                    if (code == 'auth/requires-recent-login') {
                      this.logoutProvider.logout();
                    }
                  });
              } else {
                this.alertProvider.showErrorMessage('profile/invalid-email');
              }
            }
          }
        }
      ]
    }).present();
  }

  // 인터벌을 없애고, 사용자 로그아웃.
  logout() {
    this.alert = this.alertCtrl.create({
      title: '로그아웃',
      message: '로그아웃 하시겠습니까?',
      buttons: [
        {
          text: '취소'
        },
        {
          text: '로그아웃',
          handler: data => {
            // 승인을 검사하고 인터벌을 지웁니다.
            clearInterval(this.checkVerified);
            // routeGuard를 true로 변경하고, 다른 페이지로 이동 가능하게 합니다.
            this.isLoggingOut = true;
            // 유저 로그아웃.
            this.logoutProvider.logout();
          }
        }
      ]
    }).present();
  }
}
