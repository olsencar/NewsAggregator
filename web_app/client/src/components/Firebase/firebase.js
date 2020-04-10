import app from 'firebase/app';
import 'firebase/auth';

const config = {
  apiKey: "AIzaSyBFktDa9RNgzbfjJ1M1pOEhMqcnpemt1ss",
    authDomain: "news-aggregator-e9fec.firebaseapp.com",
    databaseURL: "https://news-aggregator-e9fec.firebaseio.com",
    projectId: "news-aggregator-e9fec",
    storageBucket: "news-aggregator-e9fec.appspot.com",
    messagingSenderId: "903777205225",
    appId: "1:903777205225:web:87f1b5dd225a1a18932978",
    measurementId: "G-TK9NGYZMTJ"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
  }

  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
}

export default Firebase;
