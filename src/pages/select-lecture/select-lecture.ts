import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App} from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { FirebaseProvider } from '../../providers/firebase';
import { AngularFire } from 'angularfire2';
import { UserInfoPage } from '../user-info/user-info';
import { LectureInfoPage } from './../lecture-info/lecture-info';

@Component({
  selector: 'page-select-lecture',
  templateUrl: 'select-lecture.html'
})
export class SelectLecturePage {
  private lectures: any;
  private alert: any;
  private lecture: any;
  private excludedLectures: any;
  private requestsSent: any;
  private friendRequests: any;
  private searchLecture: any;
  private countForDelay: any;
  // SearchPeoplePage
  // This is the page where the user can search for other users and send a friend request.
  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public dataProvider: DataProvider, public loadingProvider: LoadingProvider,
    public alertCtrl: AlertController, public angularfire: AngularFire, public alertProvider: AlertProvider, public firebaseProvider: FirebaseProvider) {
    }

  ionViewDidLoad() {
    // Initialize
    this.searchLecture = '';
    this.loadingProvider.showLectureLoading();
    this.dataProvider.getLecture().take(1).subscribe((lectures) => {
      this.loadingProvider.hide();
      this.lectures = lectures;
      
      this.dataProvider.getCurrentUser().subscribe((account) => {
        // 담겨있는 강의 제외.
        this.excludedLectures = [];
        // Get friends which will be filtered out from the list using searchFilter pipe pipes/search.ts.
        if (account.lectures) {
          account.lectures.forEach(lecture => {
            if (this.excludedLectures.indexOf(lecture) == -1) {
              this.excludedLectures.push(lecture);
            }
          });
        }
      });
    });
  }

  // Back
  back() {
    this.navCtrl.pop();
  }

  acceptLectureRequest(lecture) {
    this.alert = this.alertCtrl.create({
      title: '강의 확인',
      message: '<b>' + lecture.className + '</b>  강의를 담으시겠습니까?',
      buttons: [
        {
          text: '취소',
          handler: data => {}
        },
        {
          text: '담기',
          handler: () => {
         
            this.firebaseProvider.acceptLectureRequest(lecture.$key);
          }
        }
      ]
    }).present();
  }

  lectureInfo(lectureId){
    this.app.getRootNav().push(LectureInfoPage, {
      lectureId: lectureId
    });
  }
  

  //   // View user.
  // viewUser(userId) {
  //     this.navCtrl.push(UserInfoPage, {userId: userId});
  //   }

}

