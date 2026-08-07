import 'dart:io';

import 'package:firebase_storage/firebase_storage.dart';
import 'package:path/path.dart' as path;

class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;

  Future<String> uploadMedia({
    required File file,
    required String userId,
    required String mediaType,
  }) async {
    final extension = path.extension(file.path);
    final fileName = '${DateTime.now().millisecondsSinceEpoch}$extension';
    final ref = _storage.ref().child('posts/$userId/$mediaType/$fileName');
    final uploadTask = await ref.putFile(file);
    return await uploadTask.ref.getDownloadURL();
  }

  Future<String> uploadAvatar({
    required File file,
    required String userId,
  }) async {
    final extension = path.extension(file.path);
    final fileName = '${DateTime.now().millisecondsSinceEpoch}$extension';
    final ref = _storage.ref().child('avatars/$userId/$fileName');
    final uploadTask = await ref.putFile(file);
    return await uploadTask.ref.getDownloadURL();
  }

  Future<void> deleteMedia(String downloadUrl) async {
    try {
      await _storage.refFromURL(downloadUrl).delete();
    } 
    catch (_) {}
  }
}
