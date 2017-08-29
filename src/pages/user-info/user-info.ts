import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { FirebaseProvider } from '../../providers/firebase';
import { MessagePage } from '../message/message';
import { ImageModalPage } from '../image-modal/image-modal';
import * as firebase from 'firebase';

@Component({
  selector: 'page-user-info',
  templateUrl: 'user-info.html'
})
export class UserInfoPage {
  private user: any;
  private userId: any;
  private friendRequests: any;
  private requestsSent: any;
  private friends: any;
  private alert: any;
  // 유저정보메뉴
  // 이 페이지는 유저의 정보를 볼 수 있는 페이지다, 로그인 되어있는 사용자의 정보를 수정할 수도 있다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider, public alertCtrl: AlertController, public firebaseProvider: FirebaseProvider) { }

  ionViewDidLoad() {
    this.userId = this.navParams.get('userId');
    this.loadingProvider.show();
    // 유저 정보 가져오기.
    this.dataProvider.getUser(this.userId).subscribe((user) => {
      this.user = user;
      this.loadingProvider.hide();
    });
    // 현재 로그인된 사용자의 친구 불러오기.
    this.dataProvider.getUser(firebase.auth().currentUser.uid).subscribe((user) => {
      this.friends = user.friends;
    });
    // 현재 로그인된 사용자의 친구 요청 불러오기.
    this.dataProvider.getRequests(firebase.auth().currentUser.uid).subscribe((requests) => {
      this.friendRequests = requests.friendRequests;
      this.requestsSent = requests.requestsSent;
    });
  }

  // 뒤로가기
  back() {
    this.navCtrl.pop();
  }

  // 프로필 사진 이미지 변경.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }

  // 친구 요청 수락.
  acceptFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: '요청 확인',
      message: '<b>' + this.user.name + '</b> 님의 친구요청을 수락하시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '수락하기',
          handler: () => {
            this.firebaseProvider.acceptFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // 친구 요청 거절.
  rejectFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 거절',
      message: '<b>' + this.user.name + '</b> 님의 친구요청을 거절하시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '거절하기',
          handler: () => {
            this.firebaseProvider.deleteFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // 친구 요청 취소.
  cancelFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 전송중',
      message: '<b>' + this.user.name + '</b> 에게 보낸 요청을 삭제하시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '삭제하기',
          handler: () => {
            this.firebaseProvider.cancelFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // 친구 요청 전송.
  sendFriendRequest() {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 전송',
      message: '<b>' + this.user.name + '</b> 님께 친구요청을 보내시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '보내기',
          handler: () => {
            this.firebaseProvider.sendFriendRequest(this.userId);
          }
        }
      ]
    }).present();
  }

  // 채팅창 열기.
  sendMessage() {
    this.navCtrl.push(MessagePage, { userId: this.userId });
  }

  // 사용자가 추가 될수 있는 지를 확인하고, 불가능 하다면 아직 친구가 아닙니다.
  canAdd() {
    if (this.friendRequests) {
      if (this.friendRequests.indexOf(this.userId) > -1) {
        return false;
      }
    }
    if (this.requestsSent) {
      if (this.requestsSent.indexOf(this.userId) > -1) {
        return false;
      }
    }
    if (this.friends) {
      if (this.friends.indexOf(this.userId) > -1) {
        return false;
      }
    }
    return true;
  }
}
