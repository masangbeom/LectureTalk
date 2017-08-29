import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import * as firebase from 'firebase';

@Injectable()
export class DataProvider {
  // 데이터 Provider
  // 이 Provider 클래스는 파이어 베이스에서 필요한 데이터에 대한 클래스입니다.

  constructor(public angularfire: AngularFire) {
    console.log("Initializing Data Provider");
  }

  getUsers() {
    return this.angularfire.database.list('/accounts', {
      query: {
        orderByChild: 'name'
      }
    });
  }

  getUserWithUsername(username) {
    return this.angularfire.database.list('/accounts', {
      query: {
        orderByChild: 'username',
        equalTo: username
      }
    });
  }

  getCurrentUser() {
    return this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid);
  }

  getUser(userId) {
    return this.angularfire.database.object('/accounts/' + userId);
  }

  getRequests(userId) {
    return this.angularfire.database.object('/requests/' + userId);
  }

  getFriendRequests(userId) {
    return this.angularfire.database.list('/requests', {
      query: {
        orderByChild: 'receiver',
        equalTo: userId
      }
    });
  }

  getConversation(conversationId) {
    return this.angularfire.database.object('/conversations/' + conversationId);
  }

  getConversations() {
    return this.angularfire.database.list('/accounts/' + firebase.auth().currentUser.uid + '/conversations');
  }

  getConversationMessages(conversationId) {
    return this.angularfire.database.object('/conversations/' + conversationId + '/messages');
  }

  deleteConversationMessages(conversationId) {
    return this.angularfire.database.object('/conversations/' + conversationId + '/messages').remove;
  }

  getLectureConversation(lectureId, conversationId) {
    return this.angularfire.database.object('/lectureTalk/' + lectureId + '/conversations/' + conversationId);
  }

  getLectureConversations() {
    return this.angularfire.database.list('/accounts/' + firebase.auth().currentUser.uid + '/lectureConversations');
  }

  getLectureConversationMessages(lectureId, conversationId) {
    return this.angularfire.database.object('/lectureTalk/' + lectureId + '/conversations/' + conversationId + '/messages');
  }

  deleteLectureConversation(lectureId, conversationId) {
    return this.angularfire.database.object('/lectureTalk/' + lectureId + '/conversations/' + conversationId).remove();
  }

  deleteLectureConversationMessages(lectureId, conversationId, index) {
    return this.angularfire.database.object('/lectureTalk/' + lectureId + '/conversations/' + conversationId + '/messages/' + index).remove();
  }


  getLecture(){
    return this.angularfire.database.list('/lectureTalk');
  }

  getUserLectures(){
    return this.angularfire.database.list('/accounts/' + firebase.auth().currentUser.uid + '/lectures');
  }

  getLectureFromId(lectureId){
    return this.angularfire.database.object('/lectureTalk/' + lectureId);
  }

  deleteUserLectureConversation(lectureId){
    return this.angularfire.database.object('/accounts/' + firebase.auth().currentUser.uid + '/lectureConversations/' + lectureId).remove();
  }

}
