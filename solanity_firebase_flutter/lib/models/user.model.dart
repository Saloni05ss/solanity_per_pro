import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String username;
  final String? useravatarurl;
  final int postsCount;
  final int followersCount;
  final int followingCount;
  //final is a variable modifier it implies that value will be assigned once during run time and can't be modified.

  UserModel({
    required this.uid,
    required this.username,
    this.useravatarurl,
    this.postsCount = 0,
    this.followersCount = 0,
    this.followingCount = 0,
  });

  factory UserModel.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return UserModel(
      uid: doc.id,
      username: data['username'],
      useravatarurl: data['useravatarurl'],
      postsCount: data['postsCount'] ?? 0,
      followersCount: data['followersCount'] ?? 0,
      followingCount: data['followingCount'] ?? 0,
    );
  }
  //factory is a type constructor which allows to do some extra operation like fromdoc, fromjson, conditions, validations etc. where normal constructor only assigns value 
  //Here in usermodel class due to factory constructor it take data from document then returns instance of that usermodel class
}
