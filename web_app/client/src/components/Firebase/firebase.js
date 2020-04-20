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
  doCreateUserWithEmailAndPassword = async (email, password, username) => {
    let cred = await this.auth.createUserWithEmailAndPassword(email, password);
    cred.user.updateProfile({
      displayName: username
    });
  }

  doSignInWithEmailAndPassword = (email, password) => 
    this.auth.signInWithEmailAndPassword(email, password);
  
  doUpdateDisplayName = (name) => this.auth.currentUser.updateProfile({
    displayName: name
  });

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  reauthenticate = async (currentPassword) => {
    const user = this.auth.currentUser;
    const cred = app.auth.EmailAuthProvider.credential(user.email, currentPassword);
    user.reauthenticateWithCredential(cred);
  }

  doPasswordUpdate = async (currentPassword, newPassword) => {
    try {
      await this.reauthenticate(currentPassword);
      const user = this.auth.currentUser;
      await user.updatePassword(newPassword);
      this.doSignOut();
    } catch (err) {
      return err.message;
    }
  }
}

export default Firebase;
