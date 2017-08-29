import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { FirebaseProvider } from '../../providers/firebase';
import { AngularFire } from 'angularfire2';
import { AlertProvider } from '../../providers/alert';
import { LoadingProvider } from '../../providers/loading';
import { UserInfoPage } from '../user-info/user-info';

@Component({
  selector: 'page-requests',
  templateUrl: 'requests.html'
})
export class RequestsPage {
  private friendRequests: any;
  private requestsSent: any;
  private alert: any;
  private account: any;
  // 요청 페이지
  // 이 페이지는 전송하였거나 받은 친구 요청을 볼수 있습니다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider, public alertCtrl: AlertController, public angularfire: AngularFire,
    public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public firebaseProvider: FirebaseProvider) { }

  ionViewDidLoad() {
    this.loadingProvider.show();
    // 유저의 정보 불러오기
    this.dataProvider.getCurrentUser().subscribe((account) => {
      this.account = account;
      // 친구요청과 발송한 요청을 불러옵니다.
      this.dataProvider.getRequests(this.account.userId).subscribe((requests) => {
        // 친구 요청.
        if (requests.friendRequests) {
          this.friendRequests = [];
          requests.friendRequests.forEach((userId) => {
            this.dataProvider.getUser(userId).subscribe((sender) => {
              this.addOrUpdateFriendRequest(sender);
            });
          });
        } else {
          this.friendRequests = [];
        }
        // 요청 전송.
        if (requests.requestsSent) {
          this.requestsSent = [];
          requests.requestsSent.forEach((userId) => {
            this.dataProvider.getUser(userId).subscribe((receiver) => {
              this.addOrUpdateRequestSent(receiver);
            });
          });
        } else {
          this.requestsSent = [];
        }
        this.loadingProvider.hide();
      });
    });
  }

  // 아직 친구가 아닌 사용자에게만 친구 요청을 할수 있습니다.
  addOrUpdateFriendRequest(sender) {
    if (!this.friendRequests) {
      this.friendRequests = [sender];
    } else {
      var index = -1;
      for (var i = 0; i < this.friendRequests.length; i++) {
        if (this.friendRequests[i].$key == sender.$key) {
          index = i;
        }
      }
      if (index > -1) {
        if (!this.isFriends(sender.$key))
          this.friendRequests[index] = sender;
      } else {
        if (!this.isFriends(sender.$key))
          this.friendRequests.push(sender);
      }
    }
  }

  // 아직 친구가 아닌 사용자에게만 친구 요청을 받을 수 있습니다.
  addOrUpdateRequestSent(receiver) {
    if (!this.requestsSent) {
      this.requestsSent = [receiver];
    } else {
      var index = -1;
      for (var i = 0; i < this.requestsSent.length; i++) {
        if (this.requestsSent[i].$key == receiver.$key) {
          index = i;
        }
      }
      if (index > -1) {
        if (!this.isFriends(receiver.$key))
          this.requestsSent[index] = receiver;
      } else {
        if (!this.isFriends(receiver.$key))
          this.requestsSent.push(receiver);
      }
    }
  }

  // 뒤로가기
  back() {
    this.navCtrl.pop();
  }

  // 친구 요청 수락.
  acceptFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 확인',
      message: '<b>' + user.name + '</b> 을 친구로 등록하시겠습니까?',
      buttons: [
        {
          text: '취소',
          handler: data => { }
        },
        {
          text: '거절',
          handler: () => {
            this.firebaseProvider.deleteFriendRequest(user.$key);
          }
        },
        {
          text: '승낙',
          handler: () => {
            this.firebaseProvider.acceptFriendRequest(user.$key);
          }
        }
      ]
    }).present();
  }

  // 친구 요청 거절.
  cancelFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 삭제',
      message: '<b>' + user.name + '</b>의 친구요청을 삭제하시겠습니까?',
      buttons: [
        {
          text: '취소',
          handler: data => { }
        },
        {
          text: '삭제',
          handler: () => {
            this.firebaseProvider.cancelFriendRequest(user.$key);
          }
        }
      ]
    }).present();
  }

  // 기존에 친구 여부를 확인.
  isFriends(userId) {
    if (this.account.friends) {
      if (this.account.friends.indexOf(userId) == -1) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  // View user.
  viewUser(userId) {
    this.navCtrl.push(UserInfoPage, { userId: userId });
  }

}
