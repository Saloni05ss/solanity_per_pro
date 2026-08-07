import 'package:cloud_firestore/cloud_firestore.dart';

enum ReactionType { like, love, haha, wow, sad }

extension ReactionTypeX on ReactionType {
  //extension meaning adding some extra properties to enum without changing the root functionality
  String get emoji {
    switch (this) {
      case ReactionType.like:
        return '👌';
      case ReactionType.love:
        return '❤️';
      case ReactionType.haha:
        return '😂';
      case ReactionType.wow:
        return '😀';
      case ReactionType.sad:
        return '😥';
    }
  }

  String get label {
    switch (this) {
      case ReactionType.like:
        return 'Like';
      case ReactionType.love:
        return 'Love';
      case ReactionType.haha:
        return 'Haha';
      case ReactionType.wow:
        return 'Wow';
      case ReactionType.sad:
        return 'Sad';
    }
  }

  String get key => name;

  static ReactionType fromKey(String key) => ReactionType.values.firstWhere(
    (r) => r.key == key,
    orElse: () => ReactionType.like,
  );

  //static function or variable inside class means
}

class ReactionModel {
  final String userId;
  final String userName;
  final String useravatarurl;
  final ReactionType type;

  ReactionModel({
    required this.userId,
    required this.userName,
    required this.useravatarurl,
    required this.type,
  });

  factory ReactionModel.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    //doc has 2 parts id and data
    final data = doc.data()!;
    return ReactionModel(
      userId: data['userId'],
      userName: data['userName'],
      useravatarurl: data['useravatarurl'],
      type:ReactionTypeX.fromKey(data['type']),
    );
  }
}
