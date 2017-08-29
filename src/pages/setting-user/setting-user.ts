import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, App } from 'ionic-angular';
import { LogoutProvider } from '../../providers/logout';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { ImageProvider } from '../../providers/image';
import { DataProvider } from '../../providers/data';
import { AngularFire } from 'angularfire2';
import { Validator } from '../../validator';
import { Login } from '../../login';
import * as firebase from 'firebase';
import { Camera } from 'ionic-native';

@Component({
  selector: 'page-setting-user',
  templateUrl: 'setting-user.html'
})
export class SettingUserPage {
  private user: any;
  private alert;
  
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, public app: App,
    public logoutProvider: LogoutProvider, public loadingProvider: LoadingProvider, public imageProvider: ImageProvider,
    public angularfire: AngularFire, public alertProvider: AlertProvider, public dataProvider: DataProvider) {
    this.logoutProvider.setApp(this.app);
  }

  ionViewDidLoad() {
    this.loadingProvider.show();
    this.dataProvider.getCurrentUser().subscribe((user) => {
      this.loadingProvider.hide();
      this.user = user;
    });
  }

  // 사용자의 프로필 사진 설정.
  setPhoto() {
    // 사용자는 갤러리나 사진을 찍어서 프로필을 설정할 수 있습니다.
    this.alert = this.alertCtrl.create({
      title: '프로필 사진 설정하기',
      message: '카메라 혹은 갤러리에서 가져오시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text:'갤러리에서 가져오기',
          handler: () => {
            // imageProvider을 호출하여 사용자의 사진을 업데이트 합니다.
            this.imageProvider.setProfilePhoto(this.user, Camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: '카메라',
          handler: () => {
            this.imageProvider.setProfilePhoto(this.user, Camera.PictureSourceType.CAMERA);
          }
        }
      ]
    }).present();
  }

  // 사용자의 학번,이름,학과 등을 변경할 수 있습니다.
  setName() {
    this.alert = this.alertCtrl.create({
      title: '학번 변경',
      message: "새로운 프로필 학번을 설정하세요.",
      inputs: [
        {
          name: 'name',
          placeholder: '학번을 입력하세요',
          value: this.user.name
        }
      ],
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '저장하기',
          handler: data => {
            let name = data["name"];
            // 현재 등록된 학번과 새로 변경하려는 학번이 다르고
            if (this.user.name != name) {
              // 최소 길이보다 길고
              if (name.length >= Validator.profileNameValidator.minLength) {
                // 학번에 숫자와 사용됐다면.
                if (Validator.profileNameValidator.pattern.test(name)) {
                  this.loadingProvider.show();
                  let profile = {
                    displayName: name,
                    photoURL: this.user.photoURL
                  };
                  // Firebase에 업데이트합니다
                  firebase.auth().currentUser.updateProfile(profile)
                    .then((success) => {
                      // 사용자 데이터를 데이터베이스에 업데이트.
                      this.angularfire.database.object('/accounts/' + this.user.userId).update({
                        name: name
                      }).then((success) => {
                        Validator.profileNameValidator.pattern.test(name); //Refresh validator
                        this.alertProvider.showProfileUpdatedMessage();
                      }).catch((error) => {
                        this.alertProvider.showErrorMessage('profile/error-update-profile');
                      });
                    })
                    .catch((error) => {
                      this.loadingProvider.hide();
                      let code = error["code"];
                      this.alertProvider.showErrorMessage(code);
                      if (code == 'auth/requires-recent-login') {
                        this.logoutProvider.logout();
                      }
                    });
                } else {
                  this.alertProvider.showErrorMessage('profile/invalid-chars-name');
                }
              } else {
                this.alertProvider.showErrorMessage('profile/name-too-short');
              }
            }
          }
        }
      ]
    }).present();
    this.loadingProvider.hide();
  }

  // 이름 설정
  setUsername() {
    this.alert = this.alertCtrl.create({
      title: '사용자 이름 변경',
      message: "이름을 입력하세요.",
      inputs: [
        {
          name: 'username',
          placeholder: '이름을 입력하세요',
          value: this.user.username
        }
      ],
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '저장하기',
          handler: data => {
            let username = data["username"];
            // 현재 사용자의 이름과 새로 변경하려는 이름이 다르면
            if (this.user.username != username) {
              this.dataProvider.getUserWithUsername(username).take(1).subscribe((userList) => {
                if (userList.length > 0) {
                  this.alertProvider.showErrorMessage('profile/error-same-username');
                } else {
                  this.angularfire.database.object('/accounts/' + this.user.userId).update({
                    username: username
                  }).then((success) => {
                    this.alertProvider.showProfileUpdatedMessage();
                  }).catch((error) => {
                    this.alertProvider.showErrorMessage('profile/error-update-profile');
                  });
                }
              });
            }
          }
        }
      ]
    }).present();
    this.loadingProvider.hide();
  }

  // 학과 설정
  setDescription() {
    this.alert = this.alertCtrl.create({
      title: '학과 변경',
      message: "학과를 입력하세요.",
      inputs: [
        {
          name: 'description',
          placeholder: '학과 입력',
          value: this.user.description
        }
      ],
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '저장하기',
          handler: data => {
            let description = data["description"];
            // 기존의 학과가 새로 변경하려는 학과와 다르다면
            if (this.user.description != description) {
              this.angularfire.database.object('/accounts/' + this.user.userId).update({
                description: description
              }).then((success) => {
                this.alertProvider.showProfileUpdatedMessage();
              }).catch((error) => {
                this.alertProvider.showErrorMessage('profile/error-update-profile');
              });
            }
          }
        }
      ]
    }).present();
    this.loadingProvider.hide();
  }

  // 이메일 설정.
  setEmail() {
    this.alert = this.alertCtrl.create({
      title: '이메일 주소 변경',
      message: "변경하실 이메일 주소를 입력하세요.",
      inputs: [
        {
          name: 'email',
          placeholder: '이메일 주소 입력',
          value: this.user.email
        }
      ],
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '저장하기',
          handler: data => {
            let email = data["email"];
            // 기존 이메일과 새로 변경하려는 메일 주소가 다르다면
            if (this.user.email != email) {
              // 이메일 형식이 맞는지 확인하고.
              if (Validator.profileEmailValidator.pattern.test(email)) {
                this.loadingProvider.show();
                // Firebase에 새로 업데이트합니다.
                firebase.auth().currentUser.updateEmail(email)
                  .then((success) => {
                    // 사용자의 정보를 데이터 베이스에 업데이트합니다.
                    this.angularfire.database.object('/accounts/' + this.user.userId).update({
                      email: email
                    }).then((success) => {
                      Validator.profileEmailValidator.pattern.test(email);
                      // 그리고 이메일 확인이 가능하다면 이메일 확인 페이지로 넘어갑니다.
                      if (Login.emailVerification) {
                        if (!firebase.auth().currentUser.emailVerified) {
                          this.navCtrl.setRoot(Login.verificationPage);
                        }
                      }
                    }).catch((error) => {
                      this.alertProvider.showErrorMessage('profile/error-change-email');
                    });
                  })
                  .catch((error) => {
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
    this.loadingProvider.hide();
  }

  //비밀번호 설정
  setPassword() {
    this.alert = this.alertCtrl.create({
      title: '비밀 번호 변경',
      message: "새 비밀번호를 입력하세요.",
      inputs: [
        {
          name: 'currentPassword',
          placeholder: '현재 비밀번호',
          type: 'password'
        },
        {
          name: 'password',
          placeholder: '새 비밀번호 ',
          type: 'password'
        },
        {
          name: 'confirmPassword',
          placeholder: '새 비밀번호 확인',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '저장하기',
          handler: data => {
            let currentPassword = data["currentPassword"];
            let credential = firebase.auth.EmailAuthProvider.credential(this.user.email, currentPassword);
            // 현재 비밀번호와 같은지 확인
            this.loadingProvider.show();
            firebase.auth().currentUser.reauthenticate(credential)
              .then((success) => {
                let password = data["password"];
                // 현재 비밀번호와 새로 변경하려는 비밀번호가 같은지 확인
                if (password != currentPassword) {
                  if (password.length >= Validator.profilePasswordValidator.minLength) {
                    if (Validator.profilePasswordValidator.pattern.test(password)) {
                      if (password == data["confirmPassword"]) {
                        // Firebase에 비밀번호 업데이트.
                        firebase.auth().currentUser.updatePassword(password)
                          .then((success) => {
                            this.loadingProvider.hide();
                            Validator.profilePasswordValidator.pattern.test(password);
                            this.alertProvider.showPasswordChangedMessage();
                          })
                          .catch((error) => {
                            this.loadingProvider.hide();
                            let code = error["code"];
                            this.alertProvider.showErrorMessage(code);
                            if (code == 'auth/requires-recent-login') {
                              this.logoutProvider.logout();
                            }
                          });
                      } else {
                        this.alertProvider.showErrorMessage('profile/passwords-do-not-match');
                      }
                    } else {
                      this.alertProvider.showErrorMessage('profile/invalid-chars-password');
                    }
                  } else {
                    this.alertProvider.showErrorMessage('profile/password-too-short');
                  }
                }
              })
              .catch((error) => {
                this.loadingProvider.hide();
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
              });
          }
        }
      ]
    }).present();
    this.loadingProvider.hide();
  }

  // 계정 삭제.
  deleteAccount() {
    this.alert = this.alertCtrl.create({
      title: '계정 삭제 확인',
      message: '계정을 정말로 삭제하시겠습니까?',
      buttons: [
        {
          text: '닫기'
        },
        {
          text: '삭제',
          handler: data => {
            this.loadingProvider.show();
            // Firebase에서 사용자를 삭제합니다
            firebase.auth().currentUser.delete()
              .then((success) => {
                // Firebase에 저장된 프로필 사진을 삭제합니다
                this.imageProvider.deleteUserImageFile(this.user);
                // 사용자의 정보를 데이터 베이스에서 삭제합니다
                this.angularfire.database.object('/accounts/' + this.user.userId).remove().then(() => {
                  this.loadingProvider.hide();
                  this.alertProvider.showAccountDeletedMessage();
                  this.logoutProvider.logout();
                });
              })
              .catch((error) => {
                this.loadingProvider.hide();
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
                if (code == 'auth/requires-recent-login') {
                  this.logoutProvider.logout();
                }
              });
          }
        }
      ]
    }).present();
    this.loadingProvider.hide();
  }

  // 로그 아웃.
  logout() {
    this.alert = this.alertCtrl.create({
      title: '로그 아웃',
      message: '로그 아웃 하시겠습니까?',
      buttons: [
        {
          text: '닫기'
        },
        {
          text: '로그 아웃',
          handler: data => { this.logoutProvider.logout(); }
        }
      ]
    }).present();
    this.loadingProvider.hide();
  }

  done(){
    this.navCtrl.pop();
    this.loadingProvider.hide();
  }
}