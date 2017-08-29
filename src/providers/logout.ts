import { Injectable } from '@angular/core';
import { App } from 'ionic-angular';
import { LoadingProvider } from './loading';
import { DataProvider } from './data';
import * as firebase from 'firebase';

@Injectable()
export class LogoutProvider {
  constructor(public app: App, public loadingProvider: LoadingProvider, public dataProvider: DataProvider) {
    console.log("Initializing Logout Provider");
  }

  setApp(app) {
    this.app = app;
  }

  logout() {
    this.loadingProvider.show();
  
    firebase.auth().signOut().then((success) => {
  
      this.app.getRootNav().popToRoot().then(() => {
        this.loadingProvider.hide();
  
        document.location.href = 'index.html';
      });
    });
  }

}
