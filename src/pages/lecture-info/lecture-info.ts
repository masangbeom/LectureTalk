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
  selector: 'page-lecture-info',
  templateUrl: 'lecture-info.html'
})
export class LectureInfoPage {
  private lecture: any;
  private members: any;
  private lectureId: any;
  private isEnglish: any;
  // 친구 페이지
  // 이 페이지는 친구를 검색,대화를 시작할 수 있는 페이지입니다.
  constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public dataProvider: DataProvider,
    public loadingProvider: LoadingProvider) { }

  ionViewDidLoad() {
    this.lectureId = this.navParams.get('lectureId');
    this.loadingProvider.show();

    //lecture 정보 및 멤버 들고옵니다.
    this.dataProvider.getLectureFromId(this.lectureId).subscribe((lecture) => {
      this.lecture = lecture;
      if(lecture.isEnglish == "E"){
        this.isEnglish = "O";
      }else{
        this.isEnglish = "X";
      }
      if(lecture.members){
        for(var i=0; i<lecture.members.length; i++){
          this.dataProvider.getUser(lecture.members[i]).subscribe((member)=>{
            this.addOrUpdateMember(member);
          });
        }
      }
      this.loadingProvider.hide();
    });
  }

  // 실시간으로 친구의 목록을 동기화합니다.
  addOrUpdateMember(member) {
    if (!this.members) {
      this.members = [member];
    } else {
      var index = -1;
      for (var i = 0; i < this.members.length; i++) {
        if (this.members[i].$key == member.$key) {
          index = i;
        }
      }
      if (index > -1) {
        this.members[index] = member;
      } else {
        this.members.push(member);
      }
    }
  }

  // userInfo 페이지의 처리.
  viewUser(userId) {
    this.app.getRootNav().push(UserInfoPage, { userId: userId });
  }

  // Back
  back() {
    this.navCtrl.pop();
  }
}
