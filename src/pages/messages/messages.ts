import { Component } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { LoadingProvider } from '../../providers/loading';
import { DataProvider } from '../../providers/data';
import { NewMessagePage } from '../new-message/new-message';
import { MessagePage } from '../message/message';
import * as firebase from 'firebase';

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {
  private conversations: any;
  private updateDateTime: any;
  private searchFriend: any;
  // 메시지 페이지
  // 이 페이지는 사용자의 친구들과의 대화를 볼수 있는 페이지입니다.
  // 사용자는 새로운 대화를 시작할 수도 있습니다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public angularfire: AngularFire, public loadingProvider: LoadingProvider, public app: App, public dataProvider: DataProvider) { }

  ionViewDidLoad() {
    // 데이터베이스에 유저의 정보를 생성하여 저장합니다.
    this.searchFriend = '';
    this.loadingProvider.show();

    // 현재 사용자의 채팅정보를 가져옵니다.
    this.dataProvider.getConversations().subscribe((conversations) => {
      if (conversations.length > 0) {
        conversations.forEach((conversation) => {
          if (conversation.$exists()) {
            // 대화 상대의 정보를 가져옵니다.
            this.dataProvider.getUser(conversation.$key).subscribe((user) => {
              conversation.friend = user;
              // 대화의 정보를 가져옵니다
              this.dataProvider.getConversation(conversation.conversationId).subscribe((obj) => {
                // 대화의 마지막 메시지를 가져옵니다.
                let lastMessage = obj.messages[obj.messages.length - 1];
                conversation.date = lastMessage.date;
                conversation.sender = lastMessage.sender;
                // 읽지 않는 메시지 수를 설정합니다
                conversation.unreadMessagesCount = obj.messages.length - conversation.messagesRead;
                // 메시지의 타입에 따라서 마지막 메시지를 처리합니다.
                if (lastMessage.type == 'text') {
                  if (lastMessage.sender == firebase.auth().currentUser.uid) {
                    conversation.message = user.username +':'+ lastMessage.message;
                  } else {
                    conversation.message = lastMessage.message;
                  }
                } else {
                  if (lastMessage.sender == firebase.auth().currentUser.uid) {
                    conversation.message = '사진';
                  } else {
                    conversation.message = '사진';
                  }
                }
                // 대화를 업데이트합니다.
                this.addOrUpdateConversation(conversation);
              });
            });
          }
        });
        this.loadingProvider.hide();
      } else {
        this.conversations = [];
        this.loadingProvider.hide();
      }
    });

    // Moment.js에서 마지막 대화의 날짜와 시간을 업데이트 합니다.
    var that = this;
    if (!that.updateDateTime) {
      that.updateDateTime = setInterval(function() {
        if (that.conversations) {
          that.conversations.forEach((conversation) => {
            let date = conversation.date;
            conversation.date = new Date(date);
          });
        }
      }, 60000);
    }
  }

  // 실시간 동기화로 대화를 추가 또는 업데이트하고 마지막 대화 순으로 정렬합니다.
  addOrUpdateConversation(conversation) {
    if (!this.conversations) {
      this.conversations = [conversation];
    } else {
      var index = -1;
      for (var i = 0; i < this.conversations.length; i++) {
        if (this.conversations[i].$key == conversation.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.conversations[index] = conversation;
      } else {
        this.conversations.push(conversation);
      }
      // 정렬함수.
      this.conversations.sort((a: any, b: any) => {
        let date1 = new Date(a.date);
        let date2 = new Date(b.date);
        if (date1 > date2) {
          return -1;
        } else if (date1 < date2) {
          return 1;
        } else {
          return 0;
        }
      });
    }
  }

  // 새로운 대화.
  newMessage() {
    this.app.getRootNav().push(NewMessagePage);
  }

  // 친구와 대화방 열기.
  message(userId) {
    this.app.getRootNav().push(MessagePage, { userId: userId });
  }

  // 읽지않은 메시지의 여부에 따라서 클래스 반환합니다.
  hasUnreadMessages(conversation) {
    if (conversation.unreadMessagesCount > 0) {
      return 'bold';
    } else
      return '';
  }
}
