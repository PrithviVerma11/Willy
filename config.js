import  firebase from 'firebase'
require('@firebase/firestore')

  var firebaseConfig = {
    apiKey: "AIzaSyDh6PNnD2GpOfwTA_Tu5S5lPrh3Qa7DTiI",
    authDomain: "willy-b086a.firebaseapp.com",
    projectId: "willy-b086a",
    storageBucket: "willy-b086a.appspot.com",
    messagingSenderId: "574155951366",
    appId: "1:574155951366:web:74eed046e48e98ea8d2287"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
export default firebase.firestore()