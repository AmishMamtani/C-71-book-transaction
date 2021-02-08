import * as firebase from 'firebase'
require('@firebase/firestore')
var firebaseConfig = {
    apiKey: "AIzaSyCBA8oyikygNMa3qYOJMpp3x9uXYqxHqbM",
    authDomain: "willi-972b3.firebaseapp.com",
    databaseURL: "https://willi-972b3.firebaseio.com",
    projectId: "willi-972b3",
    storageBucket: "willi-972b3.appspot.com",
    messagingSenderId: "52971093383",
    appId: "1:52971093383:web:0e880a1e706ac347846722"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore