import { Injectable } from '@angular/core';
import { AlertProvider } from './alert';
import { LoadingProvider } from './loading';
import { Camera, CameraOptions } from 'ionic-native';
import * as firebase from 'firebase';
import { AngularFire } from 'angularfire2';

@Injectable()
export class ImageProvider {
  // 이미지 Provider
  // 이 Provider 클래스는 Firebase에 이미지를 업로드하여 이미지를 처리하는 클래스입니다.
  // 기본적으로 .jpg파일로 업로드를 합니다. 
  // 다른 파일로 업로드 하고 싶으면 파이어베이스에 인코딩 방식을 설정 해줘야 합니다

  private profilePhotoOptions: CameraOptions = {
    quality: 50,
    targetWidth: 384,
    targetHeight: 384,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.JPEG,
    correctOrientation: true
  };

  private photoMessageOptions: CameraOptions = {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.JPEG,
    correctOrientation: true
  };

  private groupPhotoOptions: CameraOptions = {
    quality: 50,
    targetWidth: 384,
    targetHeight: 384,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.JPEG,
    correctOrientation: true
  };
  // Firebase에 업로드 할 모든 파일의 유형은 DATA_URL이여야 합니다.
  // 이미지URI가 반환되고 Firebase에 업로드 할수 있습니다.
  
  constructor(public angularfire: AngularFire, public alertProvider: AlertProvider, public loadingProvider: LoadingProvider) {
    console.log("Initializing Image Provider");
  }

  imgURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: mimeString
    });
  }

  generateFilename() {
    var length = 8;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text + ".jpg";
  }

  // 사용자와 사진의 종류가 지정된 프로필 사진을 설정하고
  // 데이터 베이스에 사용자의 정보를 업데이트합니다.
  setProfilePhoto(user, sourceType) {
    this.profilePhotoOptions.sourceType = sourceType;
    this.loadingProvider.show();
    // 갤러리나 사진을 찍어 가져옵니다.
    Camera.getPicture(this.profilePhotoOptions).then((imageData) => {
      let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
      let metadata = {
        'contentType': imgBlob.type
      };
      // 파일이름을 생성하고 Firebase에 업로드합니다.
      firebase.storage().ref().child('images/' + user.userId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
        // 기존의 프로필 사진이 있으면 삭제합니다.
        this.deleteImageFile(user.img);
        let url = snapshot.metadata.downloadURLs[0];
        let profile = {
          displayName: user.name,
          photoURL: url
        };
        // 사용자의 Firebase 업데이트.
        firebase.auth().currentUser.updateProfile(profile)
          .then((success) => {
            // 데이터 베이스에 사용자의 정보 업데이트.
            this.angularfire.database.object('/accounts/' + user.userId).update({
              img: url
            }).then((success) => {
              this.loadingProvider.hide();
              this.alertProvider.showProfileUpdatedMessage();
            }).catch((error) => {
              this.loadingProvider.hide();
              this.alertProvider.showErrorMessage('profile/error-change-photo');
            });
          })
          .catch((error) => {
            this.loadingProvider.hide();
            this.alertProvider.showErrorMessage('profile/error-change-photo');
          });
      }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage('image/error-image-upload');
      });
    }).catch((error) => {
      this.loadingProvider.hide();
    });
  }

  // 그룹의 사진을 업로드합니다.
  setGroupPhoto(group, sourceType) {
    this.groupPhotoOptions.sourceType = sourceType;
    this.loadingProvider.show();
    // 사진을 갤러리에서 가져오거나 찍습니다.
    Camera.getPicture(this.groupPhotoOptions).then((imageData) => {
      let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
      let metadata = {
        'contentType': imgBlob.type
      };
      firebase.storage().ref().child('images/' + firebase.auth().currentUser.uid + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
        this.deleteImageFile(group.img);
        let url = snapshot.metadata.downloadURLs[0];
        group.img = url;
        this.loadingProvider.hide();
      }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage('image/error-image-upload');
      });
    }).catch((error) => {
      this.loadingProvider.hide();
    });
  }

  // 그룹의 사진을 설정하고 그룹의 객체를 반환합니다.
  setGroupPhotoPromise(group, sourceType): Promise<any> {
    return new Promise(resolve => {
      this.groupPhotoOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // 사진을 갤러리에서 가져오거나 찍습니다.
      Camera.getPicture(this.groupPhotoOptions).then((imageData) => {
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        firebase.storage().ref().child('images/' + firebase.auth().currentUser.uid + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          this.deleteImageFile(group.img);
          let url = snapshot.metadata.downloadURLs[0];
          group.img = url;
          this.loadingProvider.hide();
          resolve(group);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  // 이미지를 삭제합니다.
  deleteImageFile(path) {
    var fileName = path.substring(path.lastIndexOf('%2F') + 3, path.lastIndexOf('?'));
    firebase.storage().ref().child('images/' + firebase.auth().currentUser.uid + '/' + fileName).delete().then(() => { }).catch((error) => { });
  }

  // 사용자의 이미지를 삭제합니다.
  deleteUserImageFile(user) {
    var fileName = user.img.substring(user.img.lastIndexOf('%2F') + 3, user.img.lastIndexOf('?'));
    firebase.storage().ref().child('images/' + user.userId + '/' + fileName).delete().then(() => { }).catch((error) => { });
  }

  // 그룹의 이미지파일을 삭제합니다.
  deleteGroupImageFile(groupId, path) {
    var fileName = path.substring(path.lastIndexOf('%2F') + 3, path.lastIndexOf('?'));
    firebase.storage().ref().child('images/' + groupId + '/' + fileName).delete().then(() => { }).catch((error) => { });
  }

  // 사진 메시지를 업로드하고 URI를 반환합니다.
  uploadPhotoMessage(conversationId, sourceType): Promise<any> {
    return new Promise(resolve => {
      this.photoMessageOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // 사진을 찍거나 갤러리에서 가져옵니다.
      Camera.getPicture(this.photoMessageOptions).then((imageData) => {
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        // 파일이름을 생성하고 Firebase에 업로드합니다.
        firebase.storage().ref().child('images/' + conversationId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          let url = snapshot.metadata.downloadURLs[0];
          this.loadingProvider.hide();
          resolve(url);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }

  // 그룹의 사진 메시지를 업로드하고 URI를 반환합니다.
  uploadGroupPhotoMessage(groupId, sourceType): Promise<any> {
    return new Promise(resolve => {
      this.photoMessageOptions.sourceType = sourceType;
      this.loadingProvider.show();
      // 사진을 찍거나 갤러리에서 가져올수 있습니다.
      Camera.getPicture(this.photoMessageOptions).then((imageData) => {
        let imgBlob = this.imgURItoBlob("data:image/jpeg;base64," + imageData);
        let metadata = {
          'contentType': imgBlob.type
        };
        // 파일이름을 생성하고 Firebase에 업로드합니다.
        firebase.storage().ref().child('images/' + groupId + '/' + this.generateFilename()).put(imgBlob, metadata).then((snapshot) => {
          let url = snapshot.metadata.downloadURLs[0];
          this.loadingProvider.hide();
          resolve(url);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage('image/error-image-upload');
        });
      }).catch((error) => {
        this.loadingProvider.hide();
      });
    });
  }
}
