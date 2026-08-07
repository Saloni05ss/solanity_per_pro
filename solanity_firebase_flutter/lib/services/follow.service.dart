import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:solanity_firebase_flutter/models/user.model.dart';

class FollowService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _follows => _db.collection('follows');

  String _followId(String followerId, String followingId) => '${followerId}_$followingId';

  Future<void> follow({required String followerId, required String followingId}) async {
    if (followerId == followingId) return;
    final id = _followId(followerId, followingId);
    final batch = _db.batch();

    batch.set(_follows.doc(id), {
      'followerId': followerId,
      'followingId': followingId,
      'createdAt': FieldValue.serverTimestamp(),
    });
    batch.update(_db.collection('users').doc(followerId), {'followingCount': FieldValue.increment(1)});
    batch.update(_db.collection('users').doc(followingId), {'followersCount': FieldValue.increment(1)});

    await batch.commit();
  }

  Future<void> unfollow({required String followerId, required String followingId}) async {
    final id = _followId(followerId, followingId);
    final batch = _db.batch();

    batch.delete(_follows.doc(id));
    batch.update(_db.collection('users').doc(followerId), {'followingCount': FieldValue.increment(-1)});
    batch.update(_db.collection('users').doc(followingId), {'followersCount': FieldValue.increment(-1)});

    await batch.commit();
  }

  Future<bool> isFollowing({required String followerId, required String followingId}) async {
    final doc = await _follows.doc(_followId(followerId, followingId)).get();
    return doc.exists;
  }

  Stream<List<UserModel>> followersStream(String userId) {
    return _follows.where('followingId', isEqualTo: userId).snapshots().asyncMap((snap) {
      final ids = snap.docs.map((d) => d['followerId'] as String).toList();
      return _fetchUsers(ids);
    });
  }

  Stream<List<UserModel>> followingStream(String userId) {
    return _follows.where('followerId', isEqualTo: userId).snapshots().asyncMap((snap) {
      final ids = snap.docs.map((d) => d['followingId'] as String).toList();
      return _fetchUsers(ids);
    });
  }

  Future<List<UserModel>> _fetchUsers(List<String> ids) async {
    if (ids.isEmpty) return [];
    final users = <UserModel>[];
    for (var i = 0; i < ids.length; i += 10) {
      final chunk = ids.sublist(i, i + 10 > ids.length ? ids.length : i + 10);
      final snap = await _db.collection('users').where(FieldPath.documentId, whereIn: chunk).get();
      users.addAll(snap.docs.map((d) => UserModel.fromDoc(d)));
    }
    return users;
  }
}