import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, AlertController, ModalController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { ImageProvider } from '../../providers/image';
import { AngularFire } from 'angularfire2';
import * as firebase from 'firebase';
import { UserInfoPage } from '../user-info/user-info';
import { ImageModalPage } from '../image-modal/image-modal';
import { Camera, Keyboard } from 'ionic-native';

@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessagePage {
  @ViewChild(Content) content: Content;
  private userId: any;
  private title: any;
  private message: any;
  private conversationId: any;
  private messages: any;
  private alert: any;
  private updateDateTime: any;
  private messagesToShow: any;
  private startIndex: any = -1;
  private scrollDirection: any = 'bottom';
  // 보여줄 최대의 메시지 설정.
  private numberOfMessages = 10;

  // 메시지페이지
  // 이 페이지는 친구와 대화를 할수 있는 페이지입니다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider, public angularfire: AngularFire,
    public loadingProvider: LoadingProvider, public alertCtrl: AlertController, public imageProvider: ImageProvider, public modalCtrl: ModalController) { }

  ionViewDidLoad() {
    this.userId = this.navParams.get('userId');

    // 친구의 정보를 가져옵니다.
    this.dataProvider.getUser(this.userId).subscribe((user) => {
      this.title = user.name;
    });

    // 친구와의 대화 정보를 불러옵니다.
    this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).subscribe((conversation) => {
      if (conversation.$exists()) {
        // 친구와의 대화가 이미 있다면 대화를 불러옵니다.
        this.conversationId = conversation.conversationId;

        // 대화를 불러옵니다.
        this.dataProvider.getConversationMessages(this.conversationId).subscribe((messages) => {
          if (this.messages) {
            // 새로 추가된 메시지는 가장 화면의 하단에 더하여 줍니다.
            if (messages.length > this.messages.length) {
              let message = messages[messages.length - 1];
              this.dataProvider.getUser(message.sender).subscribe((user) => {
                message.avatar = user.img;
              });
              this.messages.push(message);
              // messagesToShow에도 추가합니다.
              this.messagesToShow.push(message);
              // scrollDirection 을 바닥으로 재설정합니다.
              this.scrollDirection = 'bottom';
            }
          } else {
            // 모든 메시지를 불러오고 이 메시지들은 messagesToShow에 reference로 사용됩니다.
            this.messages = [];
            messages.forEach((message) => {
              this.dataProvider.getUser(message.sender).subscribe((user) => {
                message.avatar = user.img;
              });
              this.messages.push(message);
            });
            // numOfMessages에 관련된 메시지를 불러옵니다.
            if (this.startIndex == -1) {
              //  numberOfMessages 의 인덱스를 가져옵니다.
              if ((this.messages.length - this.numberOfMessages) > 0) {
                this.startIndex = this.messages.length - this.numberOfMessages;
              } else {
                this.startIndex = 0;
              }
            }
            if (!this.messagesToShow) {
              this.messagesToShow = [];
            }
            // messagesToShow를 설정합니다.
            for (var i = this.startIndex; i < this.messages.length; i++) {
              this.messagesToShow.push(this.messages[i]);
            }
            this.loadingProvider.hide();
          }
        });
      }
    });

    // Moment.js에서 마지막 대화의 날짜와 시간을 업데이트 합니다.
    var that = this;
    if (!that.updateDateTime) {
      that.updateDateTime = setInterval(function() {
        if (that.messages) {
          that.messages.forEach((message) => {
            let date = message.date;
            message.date = new Date(date);
          });
        }
      }, 60000);
    }
  }

  // numberOfMessages에 관련된 이전 메시지를 불러옵니다.
  loadPreviousMessages() {
    var that = this;
    // 로딩을 보여줍니다.
    this.loadingProvider.show();
    setTimeout(function() {
      // 더 많은 메시지를 불러오기 위해 startIndex 설정합니다.
      if ((that.startIndex - that.numberOfMessages) > -1) {
        that.startIndex -= that.numberOfMessages;
      } else {
        that.startIndex = 0;
      }
      // 메시지 목록 재설정.
      that.messages = null;
      that.messagesToShow = null;
      // scrollDirection을 맨위로 설정합니다.
      that.scrollDirection = 'top';
      // 목록을 다시 채웁니다.
      that.ionViewDidLoad();
    }, 1000);
  }

  // 사용자가 이 페이지를 나갈때 messagesRead를 업데이트합니다.
  ionViewWillLeave() {
    if (this.messages)
      this.setMessagesRead(this.messages);
  }

  // currentPage 를 확인하고, 사용자의 messagesRead를 업데이트 합니다.
  setMessagesRead(messages) {
    if (this.navCtrl.getActive().instance instanceof MessagePage) {
      // 사용자의 messagesRead를 데이터 베이스에 업데이트 합니다.
      var totalMessagesCount;
      this.dataProvider.getConversationMessages(this.conversationId).subscribe((messages) => {
        totalMessagesCount = messages.length;
      });
      this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
        messagesRead: totalMessagesCount
      });
    }
  }

  // 엔터를 눌러서 메시지를 전송합니다.
  onType(keyCode) {
    if (keyCode == 13) {
      Keyboard.close();
      this.send();
    }
  }

  // 스크롤을 맨밑으로 내림.
  scrollBottom() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToBottom();
    }, 300);
  }

  // 스크롤을 맨위로 올림.
  scrollTop() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToTop();
    }, 300);
  }

  // 스크롤을 방향에 따라 둠.
  doScroll() {
    if (this.scrollDirection == 'bottom') {
      this.scrollBottom();
    } else if (this.scrollDirection == 'top') {
      this.scrollTop();
    }
  }

  // 사용자가 메시지 전송자인지 확인합니다.
  isSender(message) {
    if (message.sender == firebase.auth().currentUser.uid) {
      return true;
    } else {
      return false;
    }
  }

  // 뒤로가기
  back() {
    this.navCtrl.pop();
  }

  // 메시지를 전송합니다 만약 이전 대화가 없다면 대화방을 새로 만듭니다.
  send() {
    if (this.message) {
      // 사용자가 messagebox에 텍스트를 입력을 했습니다.
      if (this.conversationId) {
        // 기존에 존재하는 대화에 메시지를 추가합니다
        // 직접 업데이트를 하지 않고 메시지 객체의 인스턴스를 복제합니다.
        // 메시지 객체는 ionViewDidLoad에 선언된 옵저버에 의해 업데이트 됩니다.
        let messages = JSON.parse(JSON.stringify(this.messages));
        messages.push({
          date: new Date().toString(),
          sender: firebase.auth().currentUser.uid,
          type: 'text',
          message: this.message
        });
        // 데이터베이스에 대화를 업데이트합니다.
        this.dataProvider.getConversation(this.conversationId).update({
          messages: messages
        });
        // messagebox를 초기화.
        this.message = '';
      } else {
        // 친구에게 새로운 대화.
        var messages = [];
        messages.push({
          date: new Date().toString(),
          sender: firebase.auth().currentUser.uid,
          type: 'text',
          message: this.message
        });
        var users = [];
        users.push(firebase.auth().currentUser.uid);
        users.push(this.userId);
        // 대화 추가.
        this.angularfire.database.list('conversations').push({
          dateCreated: new Date().toString(),
          messages: messages,
          users: users
        }).then((success) => {
          let conversationId = success.key;
          this.message = '';
          // 사용자에게 대화 참조를 추가합니다.
          this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
            conversationId: conversationId,
            messagesRead: 1
          });
          this.angularfire.database.object('/accounts/' + this.userId + '/conversations/' + firebase.auth().currentUser.uid).update({
            conversationId: conversationId,
            messagesRead: 0
          });
        });
      }
    }
  }

  // 사용자 정보에 대한 view
  viewUser(userId) {
    this.navCtrl.push(UserInfoPage, { userId: userId });
  }

  // photoMessage 전송.
  sendPhoto() {
    this.alert = this.alertCtrl.create({
      buttons: [
        {
          text: '취소',
          handler: data => { }
        },
        {
          text: '갤러리에서 가져오기',
          handler: () => {
            // 이미지를 올리고 url을 반환.
            this.imageProvider.uploadPhotoMessage(this.conversationId, Camera.PictureSourceType.PHOTOLIBRARY).then((url) => {
              // 이미지 메시지 처리.
              this.sendPhotoMessage(url);
            });
          }
        },
        {
          text: '촬영',
          handler: () => {
            // 이미지를 올리고 url을 반환.
            this.imageProvider.uploadPhotoMessage(this.conversationId, Camera.PictureSourceType.CAMERA).then((url) => {
              // 이미지 메시지 처리.
              this.sendPhotoMessage(url);
            });
          }
        }
      ]
    }).present();
  }

  // 데이터 베이스에 photomessage 처리.
  sendPhotoMessage(url) {
    if (this.conversationId) {
      // 현재의 대화에 이미지 메시지를 추가합니다.
      let messages = JSON.parse(JSON.stringify(this.messages));
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'image',
        url: url
      });
      // 데이터 베이스에 대화 업로드.
      this.dataProvider.getConversation(this.conversationId).update({
        messages: messages
      });
    } else {
      // 새로운 대화 생성.
      var messages = [];
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'image',
        url: url
      });
      var users = [];
      users.push(firebase.auth().currentUser.uid);
      users.push(this.userId);
      // 대화 추가.
      this.angularfire.database.list('conversations').push({
        dateCreated: new Date().toString(),
        messages: messages,
        users: users
      }).then((success) => {
        let conversationId = success.key;
        // 사용자에 대화 참조를 추가.
        this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/conversations/' + this.userId).update({
          conversationId: conversationId,
          messagesRead: 1
        });
        this.angularfire.database.object('/accounts/' + this.userId + '/conversations/' + firebase.auth().currentUser.uid).update({
          conversationId: conversationId,
          messagesRead: 0
        });
      });
    }
  }

  // 이미지 메시지 사이즈 변경.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }
}
