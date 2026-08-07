import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:solanity_firebase_flutter/models/reaction.model.dart';

class ReactionService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> _reactionsRef(String parentCollection, String parentId) {
    return _db.collection(parentCollection).doc(parentId).collection('reactions');
  }

  Future<void> react({
    required String parentCollection, // 'posts' or 'comments'
    required String parentId,
    required String userId,
    required String userName,
    required String useravatarurl,
    required ReactionType type,
  }) async {
    final ref = _reactionsRef(parentCollection, parentId).doc(userId);
    final parentRef = _db.collection(parentCollection).doc(parentId);

    await _db.runTransaction((tx) async {
      final existing = await tx.get(ref);
      final parentSnap = await tx.get(parentRef);
      final counts = Map<String, int>.from(parentSnap.data()?['reactionsCount'] ?? {});

      if (existing.exists) {
        final oldType = ReactionTypeX.fromKey(existing.data()!['type']);
        counts[oldType.key] = (counts[oldType.key] ?? 1) - 1;
      }
      counts[type.key] = (counts[type.key] ?? 0) + 1;

      tx.set(ref, {
        'userId': userId,
        'userName': userName,
        'useravatarurl': useravatarurl,
        'type': type.key,
        'createdAt': FieldValue.serverTimestamp(),
      });

      tx.update(parentRef, {
        'reactionsCount': counts,
        'likesCount': counts.values.fold<int>(0, (a, b) => a + b),
      });
    });
  }

  Future<void> removeReaction({
    required String parentCollection,
    required String parentId,
    required String userId,
  }) async {
    final ref = _reactionsRef(parentCollection, parentId).doc(userId);
    final parentRef = _db.collection(parentCollection).doc(parentId);

    await _db.runTransaction((tx) async {
      final existing = await tx.get(ref);
      if (!existing.exists) return;

      final parentSnap = await tx.get(parentRef);
      final counts = Map<String, int>.from(parentSnap.data()?['reactionsCount'] ?? {});
      final oldType = ReactionTypeX.fromKey(existing.data()!['type']);
      counts[oldType.key] = (counts[oldType.key] ?? 1) - 1;

      tx.delete(ref);
      tx.update(parentRef, {
        'reactionsCount': counts,
        'likesCount': counts.values.fold<int>(0, (a, b) => a + b),
      });
    });
  }

  Stream<List<ReactionModel>> reactionsStream(String parentCollection, String parentId) {
    return _reactionsRef(parentCollection, parentId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => ReactionModel.fromDoc(d)).toList());
  }

  Future<ReactionType?> getMyReaction({
    required String parentCollection,
    required String parentId,
    required String userId,
  }) async {
    final doc = await _reactionsRef(parentCollection, parentId).doc(userId).get();
    return doc.exists ? ReactionTypeX.fromKey(doc.data()!['type']) : null;
  }
}