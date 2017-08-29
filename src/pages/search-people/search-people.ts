import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { FirebaseProvider } from '../../providers/firebase';
import { AngularFire } from 'angularfire2';
import { UserInfoPage } from '../user-info/user-info';

@Component({
  selector: 'page-search-people',
  templateUrl: 'search-people.html'
})
export class SearchPeoplePage {
  private accounts: any;
  private alert: any;
  private account: any;
  private excludedIds: any;
  private requestsSent: any;
  private friendRequests: any;
  private searchUser: any;
  // 사람찾기 페이지
  // 이 페이지는 다른 사용자를 찾아서 친구 요청을 보낼수 있게 만든 페이지입니다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider, public loadingProvider: LoadingProvider,
    public alertCtrl: AlertController, public angularfire: AngularFire, public alertProvider: AlertProvider, public firebaseProvider: FirebaseProvider) { }

  ionViewDidLoad() {
    // 시작
    this.loadingProvider.show();
    this.searchUser = '';
    // 모든 사용자를 불러옴.
    this.dataProvider.getUsers().subscribe((accounts) => {
      this.loadingProvider.hide();
      this.accounts = accounts;
      this.dataProvider.getCurrentUser().subscribe((account) => {
        // 자신의 id는 제외함.
        this.excludedIds = [];
        this.account = account;
        if (this.excludedIds.indexOf(account.$key) == -1) {
          this.excludedIds.push(account.$key);
        }
        // 검색을 통해 목록에서 친구를 얻을수 있습니다.
        if (account.friends) {
          account.friends.forEach(friend => {
            if (this.excludedIds.indexOf(friend) == -1) {
              this.excludedIds.push(friend);
            }
          });
        }
        // 현재의 사용자의 요청을 전달해줍니다.
        this.dataProvider.getRequests(account.$key).subscribe((requests) => {
          this.requestsSent = requests.requestsSent;
          this.friendRequests = requests.friendRequests;
        });
      });
    });
  }

  // 뒤로가기
  back() {
    this.navCtrl.pop();
  }

  // 로그인된 사용자와 관련된 사용자의 상태를 가져옵니다.
  getStatus(user) {
    // Returns:
    // 0 은 친구 요청을 보낼수 있는 상태.
    // 1 이미 친구요청을 보내놓은 상태.
    // 2 친구 요청을 보류중인 상태.
    if (this.requestsSent) {
      for (var i = 0; i < this.requestsSent.length; i++) {
        if (this.requestsSent[i] == user.$key) {
          return 1;
        }
      }
    }
    if (this.friendRequests) {
      for (var i = 0; i < this.friendRequests.length; i++) {
        if (this.friendRequests[i] == user.$key) {
          return 2;
        }
      }
    }
    return 0;
  }

  // 친구 요청 전송.
  sendFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 전송',
      message: '<b>' + user.name + '</b> 님께 친구요청을 보내시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '보내기',
          handler: () => {
            this.firebaseProvider.sendFriendRequest(user.$key);
          }
        }
      ]
    }).present();
  }

  // 친구 요청 취소.
  cancelFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: '친구 요청 대기중',
      message: '<b>' + user.name + '</b>친구요청을 삭제하시겠습니까?',
      buttons: [
        {
          text: '닫기',
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

  // 친구 요청 수락.
  acceptFriendRequest(user) {
    this.alert = this.alertCtrl.create({
      title: '요청 확인',
      message: '<b>' + user.name + '</b> 님의 친구요청을 수락하시겠습니까?',
      buttons: [
        {
          text: '닫기',
          handler: data => { }
        },
        {
          text: '거절하기',
          handler: () => {
            this.firebaseProvider.deleteFriendRequest(user.$key);
          }
        },
        {
          text: '수락하기',
          handler: () => {
            this.firebaseProvider.acceptFriendRequest(user.$key);
          }
        }
      ]
    }).present();
  }

  // View user.
viewUser(userId) {
    this.navCtrl.push(UserInfoPage, {userId: userId});
  }

}
