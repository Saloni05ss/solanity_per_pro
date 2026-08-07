import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:solanity_firebase_flutter/models/user.model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  User? get currentUser => _auth.currentUser;
  //it means currentUser is a getter variable which can contain only User object means instance of User class (a prebuild class of firebase)
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  //Stream emits data → StreamBuilder receives it → UI updates automatically

  Future<UserCredential> signup({
    required String email,
    required String password,
    required String username,
  }) async {
    final data = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );

    await _db.collection('users').doc(data.user!.uid).set({
      'uid': data.user!.uid,
      'email': email,
      'username': username,
      'useravatarurl': null,
      'followersCount': 0,
      'followingCount': 0,
      'postsCount': 0,
      'createdAt': FieldValue.serverTimestamp(),
    });

    return data;
  }
  //Future is like Promise it waits till the function returns and allow to work asynchronously

  Future<UserCredential> signin({
    required String email,
    required String password
  }) async{
    return await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<void> signout() => _auth.signOut();

  Stream<UserModel?> userProfile(String uid) {
    return _db.collection('users').doc(uid).snapshots().map(
      (doc) => doc.exists ? UserModel.fromDoc(doc) : null,
    );
  }

  Future<void> updateProfile({
    required String uid,
    String? username,
    String? useravatarurl,
  }) async {
    final updatedData = <String, dynamic>{};
    if (username != null) updatedData['username'] = username;
    if (useravatarurl != null) updatedData['useravatarurl'] = useravatarurl;

    if (updatedData.isNotEmpty) {
      await _db.collection('users').doc(uid).update(updatedData);
    }
  }
}
