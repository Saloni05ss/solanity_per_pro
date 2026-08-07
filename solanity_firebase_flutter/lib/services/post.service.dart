import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:solanity_firebase_flutter/models/post.model.dart';

/// Holds one page of feed results plus the cursor needed to fetch the next page.
class FeedPage {
  final List<PostModel> posts;
  final DocumentSnapshot? lastDoc; // pass this back into getFeedPage() to continue
  final bool hasMore;

  FeedPage({required this.posts, required this.lastDoc, required this.hasMore});
}

class PostService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _posts => _db.collection('posts');

  Future<String> createPost({
    required String userId,
    required String caption,
    required String mediaUrl,
    required String mediaType,
  }) async {
    final doc = await _posts.add({
      'userId': userId,
      'caption': caption,
      'mediaUrl': mediaUrl,
      'mediaType': mediaType,
      'likesCount': 0,
      'commentsCount': 0,
      'sharesCount': 0,
      'reactionsCount': {},
      'createdAt': FieldValue.serverTimestamp(),
    });

    await _db.collection('users').doc(userId).update({
      'postsCount': FieldValue.increment(1),
    });

    return doc.id;
  }

  /// Live feed — use for the first page only, so brand-new posts appear
  /// instantly without a manual refresh.
  Stream<List<PostModel>> feedStream({int limit = 20}) {
    return _posts
        .orderBy('createdAt', descending: true)
        .limit(limit)
        .snapshots()
        .map((snap) => snap.docs.map((d) => PostModel.fromDoc(d)).toList());
  }

  /// Paginated feed — use this for infinite scroll (page 2 onward).
  /// Pass the previous page's lastDoc as startAfter to continue from there.
  Future<FeedPage> getFeedPage({
    DocumentSnapshot? startAfter,
    int limit = 10,
  }) async {
    Query<Map<String, dynamic>> query =
        _posts.orderBy('createdAt', descending: true).limit(limit);

    if (startAfter != null) {
      query = query.startAfterDocument(startAfter);
    }

    final snap = await query.get();

    return FeedPage(
      posts: snap.docs.map((d) => PostModel.fromDoc(d)).toList(),
      lastDoc: snap.docs.isNotEmpty ? snap.docs.last : null,
      hasMore: snap.docs.length == limit,
    );
  }

  Stream<List<PostModel>> userPostsStream(String userId) {
    return _posts
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((d) => PostModel.fromDoc(d)).toList());
  }

  Future<PostModel?> getPost(String postId) async {
    final doc = await _posts.doc(postId).get();
    return doc.exists ? PostModel.fromDoc(doc) : null;
  }

  /// Call StorageService.deleteMedia(post.mediaUrl) separately before/after
  /// this, since PostService doesn't own the storage layer.
  Future<void> deletePost({required String postId, required String userId}) async {
    await _posts.doc(postId).delete();

    final comments = await _db.collection('comments').where('postId', isEqualTo: postId).get();
    for (final c in comments.docs) {
      await c.reference.delete();
    }

    await _db.collection('users').doc(userId).update({
      'postsCount': FieldValue.increment(-1),
    });
  }
}