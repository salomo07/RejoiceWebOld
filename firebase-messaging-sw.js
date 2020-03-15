importScripts('https://www.gstatic.com/firebasejs/7.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyCQNwonpfC5hKyFY2dtWEUZr3plbpaUDBg",
  authDomain: "rejoicesystem.firebaseapp.com",
  databaseURL: "https://rejoicesystem.firebaseio.com",
  projectId: "rejoicesystem",
  storageBucket: "rejoicesystem.appspot.com",
  messagingSenderId: "952514227777",
  appId: "1:952514227777:web:7c28f7e9e85a63d50520c0",
  measurementId: "G-5C5EWYCWH0"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();