import 'package:cloud_firestore/cloud_firestore.dart';

class CommentModel {
  final String id;
  final String userId;
  final String postId;
  final String userName;
  final String useravatarurl;
  final String text;
  final String? parentCommentId;
  final String? rootCommentId;
  final String? replyingToUser;
  final int repliesCount;
  final int likesCount;
  final Map<String, int> reactionsCount;
  final DateTime? createdAt;

  bool get isReply => parentCommentId != null;
  //get keyword  makes a variable getter, the value of that variable assigned according to logic written in function

  CommentModel({
    required this.id,
    required this.postId,
    required this.userId,
    required this.userName,
    required this.useravatarurl,
    required this.text,
    this.parentCommentId,
    this.rootCommentId,
    this.replyingToUser,
    this.repliesCount = 0,
    this.likesCount = 0,
    this.reactionsCount = const {},
    this.createdAt,
  });

  factory CommentModel.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return CommentModel(
      id: doc.id,
      postId: data['postId'],
      userId: data['userId'],
      userName: data['userName'],
      useravatarurl: data['useravatarurl'],
      text: data['text'],
      parentCommentId: data['parentCommentId'],
      rootCommentId: data['rootCommentId'],
      replyingToUser: data['replyingToUser'],
      repliesCount: data['repliesCount'] ?? 0,
      likesCount: data['likesCount'] ?? 0,
      reactionsCount: Map<String, int>.from(data['reactionsCount'] ?? {}),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
    );
  }
}