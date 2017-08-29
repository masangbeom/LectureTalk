import { TabsPage } from './pages/tabs/tabs';
import { VerificationPage } from './pages/verification/verification';

export namespace Login {
  //Firebase Config 등록
  export const firebaseConfig = {
    apiKey: "AIzaSyDkvhMTDN27NTC6UFjjc5QxCr2bekW83P0",
    authDomain: "lecturetalk-2e744.firebaseapp.com",
    databaseURL: "https://lecturetalk-2e744.firebaseio.com",
    projectId: "lecturetalk-2e744",
    storageBucket: "lecturetalk-2e744.appspot.com",
    messagingSenderId: "847522099238"
  };

  export const facebookAppId: string = "1531086373602365";
  // oauth_client: [
  //   {
  //     "client_id": "31493597450-u75kd39sk6f8q6r4bfh807oush6tq7lu.apps.googleusercontent.com",
  //     "client_type": 3
  //   }
  // ]
  
  export const googleClientId: string = "177758728807-kemfbmj22q6jh6uoopa6sqghfn8rfvkt.apps.googleusercontent.com";
  
  export const homePage = TabsPage;
  export const verificationPage = VerificationPage;
  
  export const emailVerification: boolean = true;
}
