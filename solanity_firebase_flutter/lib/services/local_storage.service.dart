import 'package:hive_flutter/hive_flutter.dart';
import 'package:solanity_firebase_flutter/models/post.model.dart';

class LocalStorageService {
  static const String savedBox = 'saved_posts';
  static const String historyBox = 'history';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(savedBox);
    await Hive.openBox(historyBox);
  }

  // ---------- SAVED POSTS ----------
  Box get _saved => Hive.box(savedBox);

  Future<void> savePost(PostModel post) async {
    await _saved.put(post.id, {
      'id': post.id,
      'userId': post.userId,
      'caption': post.caption,
      'mediaUrl': post.mediaUrl,
      'mediaType': post.mediaType,
      'savedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> unsavePost(String postId) async => await _saved.delete(postId);
  bool isPostSaved(String postId) => _saved.containsKey(postId);

  List<Map> getSavedPosts() {
    final items = _saved.values.cast<Map>().toList();
    items.sort((a, b) => b['savedAt'].compareTo(a['savedAt']));
    return items;
  }

  // ---------- HISTORY ----------
  Box get _history => Hive.box(historyBox);

  Future<void> addToHistory(PostModel post, {int maxItems = 200}) async {
    await _history.put(post.id, {
      'id': post.id,
      'userId': post.userId,
      'caption': post.caption,
      'mediaUrl': post.mediaUrl,
      'mediaType': post.mediaType,
      'viewedAt': DateTime.now().toIso8601String(),
    });

    if (_history.length > maxItems) {
      final entries = _history.values.cast<Map>().toList()
        ..sort((a, b) => a['viewedAt'].compareTo(b['viewedAt']));
      for (var i = 0; i < entries.length - maxItems; i++) {
        await _history.delete(entries[i]['id']);
      }
    }
  }

  List<Map> getHistory() {
    final items = _history.values.cast<Map>().toList();
    items.sort((a, b) => b['viewedAt'].compareTo(a['viewedAt']));
    return items;
  }

  Future<void> clearHistory() async => await _history.clear();
  Future<void> removeFromHistory(String postId) async => await _history.delete(postId);
}