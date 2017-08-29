import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { SearchPeoplePage } from '../search-people/search-people';
import { UserInfoPage } from '../user-info/user-info';
import { MessagePage } from '../message/message';
import { RequestsPage } from '../requests/requests';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import * as firebase from 'firebase';

@Component({
  selector: 'page-friends',
  templateUrl: 'friends.html'
})
export class FriendsPage {
  private friends: any;
  private friendRequests: any;
  private searchFriend: any;
  // 친구 페이지
  // 이 페이지는 친구를 검색,대화를 시작할 수 있는 페이지입니다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider) { }

  ionViewDidLoad() {
    // 초기화
    this.searchFriend = '';
    this.loadingProvider.show();

    // 친구 요청의 수를 보여줍니다.
    this.dataProvider.getRequests(firebase.auth().currentUser.uid).subscribe((requests) => {
      this.friendRequests = requests.friendRequests;
    });

    // 데이터 베이스에서 사용자의 정보를 가져와서 친구의 목록을 가져옵니다.
    this.dataProvider.getCurrentUser().subscribe((account) => {
      if (account.friends) {
        for (var i = 0; i < account.friends.length; i++) {
          this.dataProvider.getUser(account.friends[i]).subscribe((friend) => {
            this.addOrUpdateFriend(friend);
          });
        }
      } else {
        this.friends = [];
      }
      this.loadingProvider.hide();
    });
  }

  // 실시간으로 친구의 목록을 동기화합니다.
  addOrUpdateFriend(friend) {
    if (!this.friends) {
      this.friends = [friend];
    } else {
      var index = -1;
      for (var i = 0; i < this.friends.length; i++) {
        if (this.friends[i].$key == friend.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.friends[index] = friend;
      } else {
        this.friends.push(friend);
      }
    }
  }

  // searchPeople 페이지의 처리.
  searchPeople() {
    this.app.getRootNav().push(SearchPeoplePage);
  }

  // requests 페이지의 처리.
  manageRequests() {
    this.app.getRootNav().push(RequestsPage);
  }

  // userInfo 페이지의 처리.
  viewUser(userId) {
    this.app.getRootNav().push(UserInfoPage, { userId: userId });
  }

  // chat 페이지의 처리.
  message(userId) {
    this.app.getRootNav().push(MessagePage, { userId: userId });
  }
}
