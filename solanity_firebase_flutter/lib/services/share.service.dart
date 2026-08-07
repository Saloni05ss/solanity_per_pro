import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:share_plus/share_plus.dart';

class ShareService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Future<void> sharePost({
    required String postId,
    required String caption,
    required String mediaUrl,
  }) async {
    await SharePlus.instance.share(
      ShareParams(text: '$caption\n$mediaUrl'),
    );
    await _db.collection('posts').doc(postId).update({'sharesCount': FieldValue.increment(1)});
  }
}