import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { MyLecturePage } from '../mylecture/mylecture';
import { MessagesPage } from './../messages/messages';
import { FriendsPage } from '../friends/friends';
import { DataProvider } from '../../providers/data';
import * as firebase from 'firebase';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  mylecture: any = MyLecturePage;
  messages: any = MessagesPage;
  friends: any = FriendsPage;
  profile: any = HomePage;
  private unreadMessagesCount: any;
  private friendRequestCount: any;
  private unreadLectureMessageCount: any;
  private lectureConversationList: any;
  private lectureConversationsInfo: any;
  private conversationList: any;
  private conversationsInfo: any;
  
  // 탭 페이지
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider) {
  }

  ionViewDidLoad() {
    // 친구 요청 수를 불러옴.
    this.dataProvider.getRequests(firebase.auth().currentUser.uid).subscribe((requests) => {
      if (requests.friendRequests) {
        this.friendRequestCount = requests.friendRequests.length;
      } else {
        this.friendRequestCount = null;
      }
    });

    // 대화가 존재하면 업데이트 하고 아닌 경우엔 목록에서 제거합니다.
    this.dataProvider.getConversations().subscribe((conversationsInfo) => {
      this.unreadMessagesCount = null;
      this.conversationsInfo = null;
      this.conversationList = null;43
      if(conversationsInfo){
      if (conversationsInfo.length > 0) {
        this.conversationsInfo = conversationsInfo;
        conversationsInfo.forEach((conversationInfo) => {
          this.dataProvider.getConversation(conversationInfo.conversationId).subscribe((conversation) => {
            if (conversation.$exists()) {
              this.addOrUpdateConversation(conversation);
            }
          });
        });
      }
      }
    });

    //강의 대화 불러옵니다.
    this.dataProvider.getLectureConversations().take(1).subscribe((lectureConversationsInfo) => {
      this.unreadLectureMessageCount = null;
      this.lectureConversationsInfo = null;
      this.lectureConversationList = null;
      if(lectureConversationsInfo){
      if (lectureConversationsInfo.length > 0) {
        this.lectureConversationsInfo = lectureConversationsInfo;
        lectureConversationsInfo.forEach((lectureConversationInfo) => {
          this.dataProvider.getLectureConversation(lectureConversationInfo.$key, lectureConversationInfo.conversationId).subscribe((conversation) => {
            if (conversation.$exists()) {
              this.addOrUpdateLectureConversation(conversation);
            }
          });
        });
      }
      }
    });

  }

  // 읽지않은 메시지 카운터를 통해 실시간으로 대화가 추가되거나 업데이트를 합니다.
  addOrUpdateConversation(conversation) {
    if (!this.conversationList) {
      this.conversationList = [conversation];
    } else {
      var index = -1;
      for (var i = 0; i < this.conversationList.length; i++) {
        if (this.conversationList[i].$key == conversation.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversationList[index] = conversation;
      } else {
        this.conversationList.push(conversation);
      }
    }
    this.computeUnreadMessagesCount();
  }

    // 읽지않은 강의 메시지 카운터를 통해 실시간으로 대화가 추가되거나 업데이트를 합니다.
  addOrUpdateLectureConversation(conversation) {
    if (!this.lectureConversationList) {
      this.lectureConversationList = [conversation];
    } else {
      var index = -1;
      for (var i = 0; i < this.lectureConversationList.length; i++) {
        if (this.lectureConversationList[i].$key == conversation.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.lectureConversationList[index] = conversation;
      } else {
        this.lectureConversationList.push(conversation);
      }
    }
  }


  // 모든 대화에서 읽지 않은 메시지를 계산합니다.
  computeUnreadMessagesCount() {
    this.unreadMessagesCount = 0;
    if (this.conversationList) {
      for (var i = 0; i < this.conversationList.length; i++) {
        this.unreadMessagesCount += this.conversationList[i].messages.length - this.conversationsInfo[i].messagesRead;
        if (this.unreadMessagesCount == 0) {
          this.unreadMessagesCount = null;
        }
      }
    }
  }

  // computeUnreadLectureMessagesCount() {
  //   this.unreadLectureMessageCount = 0;
  //   if (this.lectureConversationList != null){
  //     for (var i = 0; i < this.lectureConversationList.length; i++) {
  //       if(this.lectureConversationList[i] != null){
  //       this.unreadLectureMessageCount += this.lectureConversationList[i].messages.length - this.lectureConversationsInfo[i].messagesRead;
  //       if (this.unreadLectureMessageCount == 0) {
  //         this.unreadLectureMessageCount = null;
  //       }
  //       }
  //     }
  //   }
  // }

  getUnreadMessagesCount() {
    if (this.unreadMessagesCount) {
      if (this.unreadMessagesCount > 0) {
        return this.unreadMessagesCount;
      }
    }
    return null;
  }

  getUnreadLectureMessagesCount() {
    if (this.unreadLectureMessageCount) {
      if (this.unreadLectureMessageCount > 0) {
        return this.unreadLectureMessageCount;
      }
    }
    return null;
  }
}
