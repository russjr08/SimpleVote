import firebase from 'firebase/app'
import 'firebase/firebase-firestore'

firebase.initializeApp({
    apiKey: "AIzaSyDS4RSTZo-WOxfqFD4Y6BMpEFZ2MWgV1B0",
    authDomain: "simple-vote-224ff.firebaseapp.com",
    projectId: "simple-vote-224ff"
})

var db = firebase.firestore()

db.settings({
    timestampsInSnapshots: true
})

export default db