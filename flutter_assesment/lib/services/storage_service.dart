import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../main.dart';

class StorageService {
  final _uuid = const Uuid();

  /// Upload a single image from bytes. [fileExt] should be e.g. 'jpg', 'png'.
  Future<String?> uploadImageBytes(Uint8List bytes, String fileExt) async {
    try {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}-${_uuid.v4()}.$fileExt';

      await supabase.storage
          .from('blog-images')
          .uploadBinary(fileName, bytes);

      final publicUrl = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

      return publicUrl;
    } catch (e) {
      debugPrint('Error uploading image: $e');
      return null;
    }
  }

  /// Upload multiple images from bytes and return a list of public URLs.
  /// Each entry is a tuple of (bytes, fileExtension).
  /// Returns null if any upload fails.
  Future<List<String>?> uploadMultipleImages(List<({Uint8List bytes, String ext})> images) async {
    final List<String> urls = [];
    for (final img in images) {
      final url = await uploadImageBytes(img.bytes, img.ext);
      if (url == null) return null;
      urls.add(url);
    }
    return urls;
  }

  Future<void> deleteImage(String imageUrl) async {
    try {
      final uri = Uri.parse(imageUrl);
      final pathSegments = uri.pathSegments;
      final fileName = pathSegments.last;

      await supabase.storage
          .from('blog-images')
          .remove([fileName]);
    } catch (e) {
      debugPrint('Error deleting image: $e');
    }
  }
}