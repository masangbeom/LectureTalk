import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Validator } from '../validator';
import { Login } from '../login';
import { LogoutProvider } from './logout';

const errorMessages = {
  // 알람 Provider
  // 이 Provider 클래스는 성공과 실패 메시지에 대한 클래스입니다.

  // 파이어베이스 실패 메시지
  accountExistsWithDifferentCredential: { title: '이미 존재하는 계정!', subTitle: '이미 똑같은 계정이 존재합니다.' },
  invalidCredential: { title: '유효하지 않은 권한!', subTitle: '로그인 도중 권한에 관한 에러가 발생하였습니다.' },
  operationNotAllowed: { title: '로그인 실패!', subTitle: '개발자에게 문의하세요.' },
  userDisabled: { title: '사용할 수 없는 계정!', subTitle: '죄송합니다! 이 계정은 정지되었습니다! 관리자에게 문의 하시기 바랍니다.' },
  userNotFound: { title: '잘못된 계정!', subTitle: '등록되지 않은 계정입니다.' },
  wrongPassword: { title: '잘못된 비밀번호!', subTitle: '입력한 비밀번호가 틀립니다.' },
  invalidEmail: { title: '잘못된 이메일 형식!', subTitle: '잘못된 이메일 형식을 입력하였습니다.' },
  emailAlreadyInUse: { title: '이메일 중복!', subTitle: '이미 사용되어지고 있는 이메일입니다.' },
  weakPassword: { title: '취약한 비밀번호!', subTitle: '죄송합니다, 너무 짧은 비밀번호는 사용할 수 없습니다.' },
  requiresRecentLogin: { title: '권한 만료!', subTitle: '죄송합니다, 이 계정의 권한은 만기가 되었습니다! 다시 로그인 해주시기 바랍니다.' },
  userMismatch: { title: '사용자 불일치!', subTitle: '죄송합니다, 이 사용 권한은 다른 사용자가 가지고 있습니다!' },
  providerAlreadyLinked: { title: '이미 연결된 계정!', subTitle: '이미 로그인된 계정입니다.' },
  credentialAlreadyInUse: { title: '권한을 사용할 수 없음!', subTitle: '죄송합니다, 이미 다른 사용자가 이 권한을 사용중 입니다.' },
  // 프로필 실패 메시지
  changeName: { title: '이름 변경 실패!', subTitle: '에러가 발생하여 이름 변경에 실패하였습니다.' },
  invalidCharsName: Validator.profileNameValidator.patternError,
  nameTooShort: Validator.profileNameValidator.lengthError,
  changeEmail: { title: '이메일 변경 실패!', subTitle: '에러가 발생하여 이메일 변경에 실패하였습니다.' },
  invalidProfileEmail: Validator.profileEmailValidator.patternError,
  changePhoto: { title: '사진 변경 실패!', subTitle: '에러가 발생하여 사진 변경에 실패하였습니다.' },
  passwordTooShort: Validator.profilePasswordValidator.lengthError,
  invalidCharsPassword: Validator.profilePasswordValidator.patternError,
  passwordsDoNotMatch: { title: '비밀번호 변경 실패!', subTitle: '새 비밀번호가 일치하지 않습니다.' },
  updateProfile: { title: '프로필 업데이트 실패!', subTitle: '에러가 발생하여 프로필 업데이트에 실패하였습니다.' },
  usernameExists: { title: '존재하는 이름입니다!', subTitle: '이미 존재하는 이름입니다.' },
  // 이미지 실패 메시지
  imageUpload: { title: '이미지 업로드 실패!', subTitle: '에러가 발생하여 이미지 업로드에 실패하였습니다' },
  // 그룹 실패 메시지
  groupUpdate: { title: '그룹 업데이트 실패!', subTitle: '그룹 업데이트에 에러가 발생하였습니다.' },
  groupLeave: { title: '그룹 탈퇴 실패!', subTitle: '그룹 탈퇴에 에러가 발생하였습니다.' },
  groupDelete: { title: '그룹 제거 실패!', subTitle: '그룹 제거에 에러가 발생하였습니다.' }
};

const successMessages = {
  passwordResetSent: { title: '비밀번호 재설정 전송!', subTitle: '비밀번호 재설정을 전송하였습니다: ' },
  profileUpdated: { title: '프로필 업데이트!', subTitle: '프로필이 성공적으로 업데이트 되었습니다!' },
  emailVerified: { title: '이메일 확인!', subTitle: '축하합니다! 당신의 이메일이 확인되었습니다!' },
  emailVerificationSent: { title: '이메일 확인 전송!', subTitle: '이메일 확인을 전송하였습니다: ' },
  accountDeleted: { title: '계정 삭제!', subTitle: '계정이 성공적으로 제거되었습니다.' },
  passwordChanged: { title: '비밀번호 변경!', subTitle: '비밀번호가 성공적으로 변경되었습니다.' },
  friendRequestSent: { title: '친구 요청 전송!', subTitle: '친구 요청이 성공적으로 전송되었습니다!' },
  friendRequestRemoved: { title: '친구 요청 삭제!', subTitle: '친구 요청이 성공적으로 삭제되었습니다.' },
  groupUpdated: { title: '그룹 업데이트!', subTitle: '이 그룹은 성공적으로 업데이트 되었습니다!' },
  groupLeft: { title: '그룹 탈퇴', subTitle: '성공적으로 그룹을 탈퇴하였습니다.' }
};

@Injectable()
export class AlertProvider {
  private alert;

  constructor(public alertCtrl: AlertController, public logoutProvider: LogoutProvider) {
    console.log("Initializing Alert Provider");
  }

  // 업데이트된 프로필을 보여줍니다
  showProfileUpdatedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.profileUpdated["title"],
      subTitle: successMessages.profileUpdated["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // 비밀번호 재설정 메일을 보여줍니다
  showPasswordResetMessage(email) {
    this.alert = this.alertCtrl.create({
      title: successMessages.passwordResetSent["title"],
      subTitle: successMessages.passwordResetSent["subTitle"] + email,
      buttons: ['OK']
    }).present();
  }

  // 확인 된 이메일을 표시하고 앱의 홈페이지로 이동합니다
  showEmailVerifiedMessageAndRedirect(navCtrl) {
    this.alert = this.alertCtrl.create({
      title: successMessages.emailVerified["title"],
      subTitle: successMessages.emailVerified["subTitle"],
      buttons: [{
        text: 'OK',
        handler: () => {
          navCtrl.setRoot(Login.homePage);
        }
      }]
    }).present();
  }

  // 메일 확인 메시지를 보여줍니다
  showEmailVerificationSentMessage(email) {
    this.alert = this.alertCtrl.create({
      title: successMessages.emailVerificationSent["title"],
      subTitle: successMessages.emailVerificationSent["subTitle"] + email,
      buttons: ['OK']
    }).present();
  }

  // 계정 삭제 메시지를 보여줍니다
  showAccountDeletedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.accountDeleted["title"],
      subTitle: successMessages.accountDeleted["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // 비밀번호 변경을 보여줍니다
  showPasswordChangedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.passwordChanged["title"],
      subTitle: successMessages.passwordChanged["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // 친구 요청 전송을 보여줍니다
  showFriendRequestSent() {
    this.alert = this.alertCtrl.create({
      title: successMessages.friendRequestSent["title"],
      subTitle: successMessages.friendRequestSent["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // 친구 요청 삭제를 보여줍니다
  showFriendRequestRemoved() {
    this.alert = this.alertCtrl.create({
      title: successMessages.friendRequestRemoved["title"],
      subTitle: successMessages.friendRequestRemoved["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // 업데이트된 그룹을 보여줍니다.
  showGroupUpdatedMessage() {
    this.alert = this.alertCtrl.create({
      title: successMessages.groupUpdated["title"],
      subTitle: successMessages.groupUpdated["subTitle"],
      buttons: ['OK']
    }).present();
  }

  // 코드에 대한 에러 메시지를 보여줍니다
  showErrorMessage(code) {
    switch (code) {
      // 파이어 베이스 에러 메시지
      case 'auth/account-exists-with-different-credential':
        this.alert = this.alertCtrl.create({
          title: errorMessages.accountExistsWithDifferentCredential["title"],
          subTitle: errorMessages.accountExistsWithDifferentCredential["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/invalid-credential':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidCredential["title"],
          subTitle: errorMessages.invalidCredential["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/operation-not-allowed':
        this.alert = this.alertCtrl.create({
          title: errorMessages.operationNotAllowed["title"],
          subTitle: errorMessages.operationNotAllowed["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/user-disabled':
        this.alert = this.alertCtrl.create({
          title: errorMessages.userDisabled["title"],
          subTitle: errorMessages.userDisabled["subTitle"],
          buttons: ['OK']
        });
        this.alert.present();
        break;
      case 'auth/user-not-found':
        this.alert = this.alertCtrl.create({
          title: errorMessages.userNotFound["title"],
          subTitle: errorMessages.userNotFound["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/wrong-password':
        this.alert = this.alertCtrl.create({
          title: errorMessages.wrongPassword["title"],
          subTitle: errorMessages.wrongPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/invalid-email':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidEmail["title"],
          subTitle: errorMessages.invalidEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/email-already-in-use':
        this.alert = this.alertCtrl.create({
          title: errorMessages.emailAlreadyInUse["title"],
          subTitle: errorMessages.emailAlreadyInUse["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/weak-password':
        this.alert = this.alertCtrl.create({
          title: errorMessages.weakPassword["title"],
          subTitle: errorMessages.weakPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/requires-recent-login':
        this.alert = this.alertCtrl.create({
          title: errorMessages.requiresRecentLogin["title"],
          subTitle: errorMessages.requiresRecentLogin["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/user-mismatch':
        this.alert = this.alertCtrl.create({
          title: errorMessages.userMismatch["title"],
          subTitle: errorMessages.userMismatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/provider-already-linked':
        this.alert = this.alertCtrl.create({
          title: errorMessages.providerAlreadyLinked["title"],
          subTitle: errorMessages.providerAlreadyLinked["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'auth/credential-already-in-use':
        this.alert = this.alertCtrl.create({
          title: errorMessages.credentialAlreadyInUse["title"],
          subTitle: errorMessages.credentialAlreadyInUse["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      // 프로필 에러 메시지
      case 'profile/error-change-name':
        this.alert = this.alertCtrl.create({
          title: errorMessages.changeName["title"],
          subTitle: errorMessages.changeName["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-chars-name':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidCharsName["title"],
          subTitle: errorMessages.invalidCharsName["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/name-too-short':
        this.alert = this.alertCtrl.create({
          title: errorMessages.nameTooShort["title"],
          subTitle: errorMessages.nameTooShort["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-change-email':
        this.alert = this.alertCtrl.create({
          title: errorMessages.changeEmail["title"],
          subTitle: errorMessages.changeEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-email':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidProfileEmail["title"],
          subTitle: errorMessages.invalidProfileEmail["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-change-photo':
        this.alert = this.alertCtrl.create({
          title: errorMessages.changePhoto["title"],
          subTitle: errorMessages.changePhoto["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/password-too-short':
        this.alert = this.alertCtrl.create({
          title: errorMessages.passwordTooShort["title"],
          subTitle: errorMessages.passwordTooShort["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/invalid-chars-password':
        this.alert = this.alertCtrl.create({
          title: errorMessages.invalidCharsPassword["title"],
          subTitle: errorMessages.invalidCharsPassword["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/passwords-do-not-match':
        this.alert = this.alertCtrl.create({
          title: errorMessages.passwordsDoNotMatch["title"],
          subTitle: errorMessages.passwordsDoNotMatch["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-update-profile':
        this.alert = this.alertCtrl.create({
          title: errorMessages.updateProfile["title"],
          subTitle: errorMessages.updateProfile["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'profile/error-same-username':
        this.alert = this.alertCtrl.create({
          title: errorMessages.usernameExists["title"],
          subTitle: errorMessages.usernameExists["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      // 이미지 에러 메시지
      case 'image/error-image-upload':
        this.alert = this.alertCtrl.create({
          title: errorMessages.imageUpload["title"],
          subTitle: errorMessages.imageUpload["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      // 그룹 에러 메시지
      case 'group/error-update-group':
        this.alert = this.alertCtrl.create({
          title: errorMessages.groupUpdate["title"],
          subTitle: errorMessages.groupUpdate["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'group/error-leave-group':
        this.alert = this.alertCtrl.create({
          title: errorMessages.groupLeave["title"],
          subTitle: errorMessages.groupLeave["subTitle"],
          buttons: ['OK']
        }).present();
        break;
      case 'group/error-delete-group':
        this.alert = this.alertCtrl.create({
          title: errorMessages.groupDelete["title"],
          subTitle: errorMessages.groupDelete["subTitle"],
          buttons: ['OK']
        }).present();
        break;
    }
  }
}