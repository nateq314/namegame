import * as firebase from "firebase";

firebase.initializeApp({
  apiKey: "AIzaSyCfo91HjJzUHHeTmmQWqXWzn6J0HgcTacc",
  authDomain: "namegame-a4735.firebaseapp.com",
  databaseURL: "https://namegame-a4735.firebaseio.com",
  projectId: "namegame-a4735",
  storageBucket: "namegame-a4735.appspot.com",
  messagingSenderId: "227635925240"
});
const auth = firebase.auth();
const db = firebase.database();

export { auth, db };
