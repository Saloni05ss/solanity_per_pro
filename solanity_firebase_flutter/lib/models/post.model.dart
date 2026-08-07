import 'package:cloud_firestore/cloud_firestore.dart';

class PostModel {
  final String id;
  final String userId;
  final String caption;
  final String mediaUrl;
  final String mediaType;
  final int likesCount;
  final int commentsCount;
  final int sharesCount;
  final Map<String, int> reactionsCount;
  final DateTime? createdAt;

  PostModel({
    required this.id,
    required this.userId,
    required this.caption,
    required this.mediaUrl,
    required this.mediaType,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.sharesCount = 0,
    this.reactionsCount =
        const {}, //The default value of an optional parameter must be constant
    this.createdAt,
  });

  factory PostModel.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return PostModel(
      id: doc.id,
      userId: data['userId'],
      caption: data['caption'] ?? '',
      mediaUrl: data['mediaUrl'],
      mediaType: data['mediaType'] ?? 'image',
      likesCount: data['likesCount'] ?? 0,
      commentsCount: data['commentsCount'] ?? 0,
      sharesCount: data['sharesCount'] ?? 0,
      reactionsCount: Map<String, int>.from(data['reactionsCount'] ?? {}),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
    );
  }
}
