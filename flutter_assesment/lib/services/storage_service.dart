import 'dart:io';
import 'package:uuid/uuid.dart';
import '../main.dart';

class StorageService {
  final _uuid = const Uuid();

  Future<String?> uploadImage(File imageFile) async {
    try {
      final fileExt = imageFile.path.split('.').last;
      final fileName = '${DateTime.now().millisecondsSinceEpoch}-${_uuid.v4()}.$fileExt';

      await supabase.storage
          .from('blog-images')
          .upload(fileName, imageFile);

      final publicUrl = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);

      return publicUrl;
    } catch (e) {
      print('Error uploading image: $e');
      return null;
    }
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
      print('Error deleting image: $e');
    }
  }
}