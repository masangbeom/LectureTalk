import { LectureInfoPage } from './../lecture-info/lecture-info';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, AlertController, ModalController, App } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { ImageProvider } from '../../providers/image';
import { AngularFire } from 'angularfire2';
import * as firebase from 'firebase';
import { UserInfoPage } from '../user-info/user-info';
import { ImageModalPage } from '../image-modal/image-modal';
import { Camera, Keyboard } from 'ionic-native';

@Component({
  selector: 'page-lecture-message',
  templateUrl: 'lecture-message.html'
})
export class LectureMessagePage {
  @ViewChild(Content) content: Content;
  private lectureId: any;
  private title: any;
  private message: any;
  private conversationId: any;
  private messages: any;
  private alert: any;
  private updateDateTime: any;
  private messagesToShow: any;
  private startIndex: any = -1;
  private scrollDirection: any = 'bottom';
  private numberOfMessages = 10;


  //LectureTalk에 대한 메세지 부분.
  constructor(public navCtrl: NavController, public app: App, public navParams: NavParams, public dataProvider: DataProvider, public angularfire: AngularFire,
    public loadingProvider: LoadingProvider, public alertCtrl: AlertController, public imageProvider: ImageProvider, public modalCtrl: ModalController) { }

  ionViewDidLoad() {
    this.lectureId = this.navParams.get('lectureId');

    //lecture에 대한 값얻기
    this.dataProvider.getLectureFromId(this.lectureId).subscribe((lecture) => {
      this.title = lecture.className;
    });

    this.angularfire.database.object('/lectureTalk/' + this.lectureId).subscribe((lecture) => {

        this.conversationId = lecture.conversationId;
        
        //대화 불러오기
        if(lecture.conversations){
        this.dataProvider.getLectureConversationMessages(this.lectureId, this.conversationId).subscribe((messages) => {
          if (this.messages) {
            // 새로 추가된 메시지는 가장 화면의 하단에 더하여 줍니다.
            if (messages.length > this.messages.length) {
              let message = messages[messages.length - 1];
              this.dataProvider.getUser(message.sender).subscribe((user) => {
                message.avatar = user.img;
              });
              this.messages.push(message);

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
              
              if ((this.messages.length - this.numberOfMessages) > 0) {
                this.startIndex = this.messages.length - this.numberOfMessages;
              } else {
                this.startIndex = 0;
              }
            }
            if (!this.messagesToShow) {
              this.messagesToShow = [];
            }
            // Set messagesToShow
            for (var i = this.startIndex; i < this.messages.length; i++) {
              this.messagesToShow.push(this.messages[i]);
            }
            this.loadingProvider.hide();
          }
        });
        }
    });

    // Update messages' date time elapsed every minute based on Moment.js.
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

  // Load previous messages in relation to numberOfMessages.
  loadPreviousMessages() {
    var that = this;

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
    if (this.navCtrl.getActive().instance instanceof LectureMessagePage) {
      // 사용자의 messagesRead를 데이터 베이스에 업데이트 합니다.
      var totalMessagesCount;
      this.dataProvider.getLectureConversationMessages(this.lectureId, this.conversationId).subscribe((messages) => {
        totalMessagesCount = messages.length;
      });
      this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/lectureConversations/' + this.lectureId).update({
        messagesRead: totalMessagesCount
      });
    }
  }

  // 엔터키코드 : 13
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

  // 사용자가 메시지 발신인지 확인합니다.
  isSender(message) {
    if (message.sender == firebase.auth().currentUser.uid) {
      return true;
    } else {
      return false;
    }
  }

  // Back
  back() {
    this.navCtrl.pop();
  }

  // 메시지를 전송합니다 만약 이전 대화가 없다면 대화방을 새로 만듭니다.
  send() {
    if (this.message) {
      // User entered a text on messagebox
      this.angularfire.database.object('/lectureTalk/' + this.lectureId).take(1).subscribe((lecture) => {
      if (lecture.conversations) {
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
        // Update conversation on database.
        this.dataProvider.getLectureConversation(this.lectureId, this.conversationId).update({
          messages: messages
        });
        // Clear messagebox.
        this.message = '';
      } else {
        // New Conversation with friend.
        var messages = [];
        messages.push({
          date: new Date().toString(),
          sender: firebase.auth().currentUser.uid,
          type: 'text',
          message: this.message
        });
        // var users = [];
        // users.push(firebase.auth().currentUser.uid);
        // users.push(this.userId);
        // Add conversation.
        this.angularfire.database.object('/lectureTalk/' + this.lectureId + '/conversations/' + this.conversationId).update({
          dateCreated: new Date().toString(),
          messages: messages,
          // users: users
        }).then((success) => {
          this.message = '';
        });
      }
      });
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
    this.angularfire.database.object('/lectureTalk/' + this.lectureId).take(1).subscribe((lecture) => {
    if (lecture.coversations) {
      // 현재의 대화에 이미지 메시지를 추가합니다.
      let messages = JSON.parse(JSON.stringify(this.messages));
      messages.push({
        date: new Date().toString(),
        sender: firebase.auth().currentUser.uid,
        type: 'image',
        url: url
      });
     // 데이터 베이스에 대화 업로드.
      this.dataProvider.getLectureConversation(this.lectureId, this.conversationId).update({
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
      // var users = [];
      // users.push(firebase.auth().currentUser.uid);
      // users.push(this.userId);
      // Add conversation.
      this.angularfire.database.object('/lectureTalk/' + this.lectureId + '/conversations/' + this.conversationId).update({
          dateCreated: new Date().toString(),
          messages: messages,
          // users: users
        }).then((success) => {
          this.message = '';
        });
    }
    });
  }

  // 이미지 메시지 사이즈 변경.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }

  viewLectureInfo(){
    this.app.getRootNav().push(LectureInfoPage, {
      lectureId: this.lectureId
    });
  }
}
