import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';
import { DataProvider } from './data';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/take';

@Injectable()
export class FirebaseProvider {
  // 파이어베이스 Provider
  // 이 Provider 클래스는 파이어베이스의 업데이트에 관한 클래스입니다.

  constructor(public angularfire: AngularFire, public alertCtrl: AlertController, public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public dataProvider: DataProvider) {
    console.log("Initializing Firebase Provider");
  }

  // userId에 친구요청을 보냅니다.
  sendFriendRequest(userId) {
    let loggedInUserId = firebase.auth().currentUser.uid;
    this.loadingProvider.show();

    var requestsSent;
    this.dataProvider.getRequests(loggedInUserId).take(1).subscribe((requests) => {
      requestsSent = requests.requestsSent;
      if (!requestsSent) {
        requestsSent = [userId];
      } else {
        if (requestsSent.indexOf(userId) == -1)
          requestsSent.push(userId);
      }
      // 요청 전송에 대한 정보를 추가합니다.
      this.angularfire.database.object('/requests/' + loggedInUserId).update({
        requestsSent: requestsSent
      }).then((success) => {
        var friendRequests;
        this.dataProvider.getRequests(userId).take(1).subscribe((requests) => {
          friendRequests = requests.friendRequests;
          if (!friendRequests) {
            friendRequests = [loggedInUserId];
          } else {
            if (friendRequests.indexOf(userId) == -1)
              friendRequests.push(loggedInUserId);
          }
          // 친구 요청 전송에 대한 정보를 추가합니다.
          this.angularfire.database.object('/requests/' + userId).update({
            friendRequests: friendRequests
          }).then((success) => {
            this.loadingProvider.hide();
            this.alertProvider.showFriendRequestSent();
          }).catch((error) => {
            this.loadingProvider.hide();
          });
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  // userId에 보낸 친구 요청 취소.
  cancelFriendRequest(userId) {
    let loggedInUserId = firebase.auth().currentUser.uid;
    this.loadingProvider.show();

    var requestsSent;
    this.dataProvider.getRequests(loggedInUserId).take(1).subscribe((requests) => {
      requestsSent = requests.requestsSent;
      requestsSent.splice(requestsSent.indexOf(userId), 1);
      // 요청 전송에 대한 정보 업데이트.
      this.angularfire.database.object('/requests/' + loggedInUserId).update({
        requestsSent: requestsSent
      }).then((success) => {
        var friendRequests;
        this.dataProvider.getRequests(userId).take(1).subscribe((requests) => {
          friendRequests = requests.friendRequests;
          friendRequests.splice(friendRequests.indexOf(loggedInUserId), 1);
          // 친구 요청 전송에 대한 정보 업데이트.
          this.angularfire.database.object('/requests/' + userId).update({
            friendRequests: friendRequests
          }).then((success) => {
            this.loadingProvider.hide();
            this.alertProvider.showFriendRequestRemoved();
          }).catch((error) => {
            this.loadingProvider.hide();
          });
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  // 친구 요청 삭제.
  deleteFriendRequest(userId) {
    let loggedInUserId = firebase.auth().currentUser.uid;
    this.loadingProvider.show();

    var friendRequests;
    this.dataProvider.getRequests(loggedInUserId).take(1).subscribe((requests) => {
      friendRequests = requests.friendRequests;
      friendRequests.splice(friendRequests.indexOf(userId), 1);
      // 친구 요청 전송 정보 업데이트.
      this.angularfire.database.object('/requests/' + loggedInUserId).update({
        friendRequests: friendRequests
      }).then((success) => {
        var requestsSent;
        this.dataProvider.getRequests(userId).take(1).subscribe((requests) => {
          requestsSent = requests.requestsSent;
          requestsSent.splice(requestsSent.indexOf(loggedInUserId), 1);
          // 요청 전송 정보 업데이트.
          this.angularfire.database.object('/requests/' + userId).update({
            requestsSent: requestsSent
          }).then((success) => {
            this.loadingProvider.hide();

          }).catch((error) => {
            this.loadingProvider.hide();
          });
        });
      }).catch((error) => {
        this.loadingProvider.hide();
        //TODO ERROR
      });
    });
  }

  // 친구 요청 수락.
  acceptFriendRequest(userId) {
    let loggedInUserId = firebase.auth().currentUser.uid;
    // 친구 요청 삭제.
    this.deleteFriendRequest(userId);

    this.loadingProvider.show();
    this.dataProvider.getUser(loggedInUserId).take(1).subscribe((account) => {
      var friends = account.friends;
      if (!friends) {
        friends = [userId];
      } else {
        friends.push(userId);
      }
      // 서로를 친구로 추가합니다.
      this.dataProvider.getUser(loggedInUserId).update({
        friends: friends
      }).then((success) => {
        this.dataProvider.getUser(userId).take(1).subscribe((account) => {
          var friends = account.friends;
          if (!friends) {
            friends = [loggedInUserId];
          } else {
            friends.push(loggedInUserId);
          }
          this.dataProvider.getUser(userId).update({
            friends: friends
          }).then((success) => {
            this.loadingProvider.hide();
          }).catch((error) => {
            this.loadingProvider.hide();
          });
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  //강의 요청 수락
  acceptLectureRequest(lectureId) {
    let loggedInUserId = firebase.auth().currentUser.uid;
    this.dataProvider.getUser(loggedInUserId).take(1).subscribe((account) => {
      var lectures = account.lectures;
      if (!lectures) {
        lectures = [lectureId];
      } else {
        lectures.push(lectureId);
      }
      // LectureTalk 폴더에 멤버로 저장
      this.dataProvider.getUser(loggedInUserId).update({
        lectures: lectures
      }).then((success) => {
        this.dataProvider.getLectureFromId(lectureId).take(1).subscribe((lecture) => {
          var members = lecture.members;
          if (!members) {
            members = [loggedInUserId];
          } else {
            members.push(loggedInUserId);
          }
          this.dataProvider.getLectureFromId(lectureId).update({
            members: members
          }).then((success) => {}).catch((error) => {});
        });
      }).catch((error) => {});
    });

    this.dataProvider.getLectureFromId(lectureId).take(1).subscribe((lecture) => {
      this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/lectureConversations/' + lectureId).update({
        conversationId: lecture.conversationId,
        messagesRead: 0
      });
    });
  }


  //선택된 강의에 대한 삭제
  deleteLectureRequest(lectureId) {
    let loggedInUserId = firebase.auth().currentUser.uid;
    this.dataProvider.deleteUserLectureConversation(lectureId);
    this.dataProvider.getCurrentUser().take(1).subscribe((account) => {
      var lectures = account.lectures

      for (var i = 0; i < lectures.length; i++) {
        if (lectures[i] == lectureId) {
          lectures.splice(i, 1);
          break;
        }
      }
      this.dataProvider.getCurrentUser().update({
        lectures: lectures
      }).then((success) => {
        this.dataProvider.getLectureFromId(lectureId).take(1).subscribe((lecture) => {
          var members = lecture.members;
          for (var i = 0; i < members.length; i++) {
            if (members[i] == loggedInUserId) {
              members.splice(i, 1);
              break;
            }
          }
          this.dataProvider.getLectureFromId(lectureId).update({
            members: members
          }).then((success) => {
            if (lecture.members.length != 0) {
              this.dataProvider.getLectureConversation(lectureId,lecture.conversationId).subscribe((conversation)=>{
              if (conversation.messages) {
                var messages = conversation.messages;
                for (var i = 0; i < messages.length; i++) {
                  if (messages[i].sender == loggedInUserId) {
                    messages.splice(i, 1);
                    this.dataProvider.getLectureConversation(lectureId, lecture.conversationId).update({
                      messages: messages
                    });
                  }
                }
              }
            });
            } else {
              this.dataProvider.deleteLectureConversation(lectureId, lecture.conversationId);
            }
          }).catch((error) => {});
        });
      }).catch((error) => {});
        return false;
    })

  }


}

