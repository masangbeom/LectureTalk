import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, App, AlertController} from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { LoadingProvider } from '../../providers/loading';
import { DataProvider } from '../../providers/data';
import { FirebaseProvider } from './../../providers/firebase';
import { SelectLecturePage } from '../select-lecture/select-lecture'
import { LectureMessagePage } from '../lecture-message/lecture-message';
import { LectureInfoPage } from './../lecture-info/lecture-info';
import { SettingUserPage } from './../setting-user/setting-user';
import * as firebase from 'firebase';

@Component({
  selector: 'page-mylecture',
  templateUrl: 'mylecture.html'
})
export class MyLecturePage {
  private lectures: any;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public firebaseProvider: FirebaseProvider, public navParams: NavParams, public app: App, public dataProvider: DataProvider,
    public angularfire: AngularFire, public loadingProvider: LoadingProvider) {}

  ionViewDidLoad() {
    // this.angularfire.database.list('lectureTalk').remove();
    // // Initiallize Lecture
    // this.angularfire.database.list('lectures').take(1).subscribe((lectures)=>{
    //   lectures.forEach(lecture => {
    //     this.angularfire.database.list('lectureTalk').push({
    //       classCode: lecture.classCode,
    //       className: lecture.className,
    //       depart: lecture.depart,
    //       isEnglish: lecture.isEnglish,
    //       lectureCode: lecture.lectureCode,
    //       lectureDistribute: lecture.lectureDistribute,
    //       professorName: lecture.professorName,
    //       score: lecture.score,
    //       time: lecture.time
    //     }).then((success)=>{
    //       this.angularfire.database.object('/lectureTalk/' + success.key).update({
    //         lectureId: success.key
    //       });
    //     });
    //   });
    // })

    // Initialize Lecture Conversations
    // this.angularfire.database.list('/lectureTalk/').take(1).subscribe((lectures)=>{
    //   lectures.forEach(lecture => {
    //     this.angularfire.database.list('/lectureTalk/' + lecture.$key + '/conversations/').push({
    //     }).then((success) => {
    //       let conversationId = success.key;
    //       this.angularfire.database.object('/lectureTalk/' + lecture.$key).update({
    //         conversationId: conversationId
    //       });
    //     });
    //   });
    // });

    // // Delete Lecture Conversations
    // this.angularfire.database.list('/lectureTalk/').take(1).subscribe((lectures)=>{
    //   lectures.forEach(lecture=>{
    //     this.angularfire.database.object('/lectureTalk/' + lecture.$key + '/conversations/' + lecture.conversationId).remove();
    //     if(lecture.members){
    //       this.angularfire.database.list('/lectureTalk/' + lecture.$key + '/members/').remove();
    //     }
    //   })
    // })

    this.createUserData(); //사용자 정보 초기화
    this.loadingProvider.show();

    this.dataProvider.getCurrentUser().subscribe((account) => {
      if (account.lectures) {
        for (var i = 0; i < account.lectures.length; i++) {
          this.dataProvider.getLectureFromId(account.lectures[i]).subscribe((lecture) => {
            this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/lectureConversations/' + lecture.$key).subscribe((user) => {
              this.dataProvider.getLectureConversation(lecture.$key, lecture.conversationId).subscribe((obj) => {
                // 읽지 않은 메시지 수를 설정합니다
                if (obj.messages) {
                  lecture.unreadMessagesCount = obj.messages.length - user.messagesRead;
                }
                this.addOrUpdateLecture(lecture);
              });
            });
          });
        }

      } else {
        this.lectures = [];
      }
      this.loadingProvider.hide();
    });

  }

  addOrUpdateLecture(lecture) {
    if (!this.lectures) {
      this.lectures = [lecture];
    } else {
      var index = -1;
      for (var i = 0; i < this.lectures.length; i++) {
        if (this.lectures[i].$key == lecture.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.lectures[index] = lecture;
      } else {
        this.lectures.push(lecture);
      }
    }
  }

  setLecture() {
    this.app.getRootNav().push(SelectLecturePage);
  }


  message(lectureId) {
    this.app.getRootNav().push(LectureMessagePage, {
      lectureId: lectureId
    });
  }


  //강의 삭제
  deleteLecture(lectureId) {
    this.alertCtrl.create({
      title: '강의 취소',
      message: '강의를 취소하시겠습니까?',
      buttons: [{
          text: '취소',
          handler: data => {}
        },
        {
          text: '확인',
          handler: () => {
            this.firebaseProvider.deleteLectureRequest(lectureId);
            this.navCtrl.setRoot(this.navCtrl.getActive().component);
          }
        },

      ]
    }).present();
  }

  // 유저의 정보가 데이터베이스에 없으면 생성합니다.
  createUserData() {
    firebase.database().ref('accounts/' + firebase.auth().currentUser.uid).once('value')
    .then((account) => {
      // No database data yet, create user data on database
      if (!account.val()) {
        this.alertCtrl.create({
          title: 'Profile을 설정해주세요.',
          message: '상단 4번째 탭의 Profile 메뉴에서 설정해주세요.',
          buttons: [
          {
            text: '확인',
            handler: () => {
            }
          },
    
        ]
        }).present();
        this.loadingProvider.show();
        let user = firebase.auth().currentUser;
        var userId, name, provider, img, email;
        let providerData = user.providerData[0];

        userId = user.uid;

        // Get name from Firebase user.
        if (user.displayName || providerData.displayName) {
          name = user.displayName;
          name = providerData.displayName;
        } else {
          name = "학번을 입력하세요.";
        }

        // Set default username based on name and userId.
        let username = '이름을 입력하세요';

        // Get provider from Firebase user.
        if (providerData.providerId == 'password') {
          provider = "Firebase";
        } else if (providerData.providerId == 'facebook.com') {
          provider = "Facebook";
        } else if (providerData.providerId == 'google.com') {
          provider = "Google";
        }

        // Get photoURL from Firebase user.
        if (user.photoURL || providerData.photoURL) {
          img = user.photoURL;
          img = providerData.photoURL;
        } else {
          img = "assets/images/profile.png";
        }

        // Get email from Firebase user.
        email = user.email;

        // Set default description.
        let description = "전공을 입력하세요.";

        // Insert data on our database using AngularFire.
        this.angularfire.database.object('/accounts/' + userId).set({
          userId: userId,
          name: name,
          username: username,
          provider: provider,
          img: img,
          email: email,
          description: description,
          dateCreated: new Date().toString()
        }).then(() => {
          this.loadingProvider.hide();
        });
      }
    });
  }

  lectureInfo(lectureId){
    this.app.getRootNav().push(LectureInfoPage, {
      lectureId: lectureId
    });
  }

}

