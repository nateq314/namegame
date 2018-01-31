import * as firebase from 'firebase';

firebase.initializeApp({
  apiKey: "AIzaSyClJ8vAhrO_mr_vN629A2Fp5y3s82Qfv7c",
  authDomain: "namegame-f911e.firebaseapp.com",
  databaseURL: "https://namegame-f911e.firebaseio.com",
  projectId: "namegame-f911e",
  storageBucket: "namegame-f911e.appspot.com",
  messagingSenderId: "192709382924"
});
const auth = firebase.auth();
const db = firebase.database();

export {
	auth, db
};