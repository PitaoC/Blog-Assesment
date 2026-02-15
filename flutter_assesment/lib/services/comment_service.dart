import '../main.dart';
import '../models/comment.dart';
import 'dart:typed_data';
import 'package:uuid/uuid.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CommentService {
  final _uuid = const Uuid();
  Future<List<Comment>> getComments(String blogId) async {
    final response = await supabase
        .from('comments')
        .select()
        .eq('blog_id', blogId)
        .order('created_at', ascending: false);

    return (response as List).map((json) => Comment.fromJson(json)).toList();
  }

  Future<Comment> addComment({
    required String blogId,
    String? authorId,
    required String authorName,
    required String content,
    Uint8List? imageBytes,
    String? imageExt,
  }) async {
    String? imageUrl;

    if (imageBytes != null) {
      imageUrl = await _uploadCommentImage(imageBytes, imageExt ?? 'jpg');
    }

    final response = await supabase
        .from('comments')
        .insert({
          'blog_id': blogId,
          'author_id': authorId,
          'author_name': authorName.trim(),
          'content': content.trim(),
          'image_url': imageUrl,
        })
        .select()
        .single();

    return Comment.fromJson(response);
  }

  Future<Comment> updateComment({
    required String commentId,
    required String content,
    Uint8List? newImageBytes,
    String? imageExt,
    String? existingImageUrl,
    bool removeImage = false,
  }) async {
    String? imageUrl = existingImageUrl;

    if (removeImage) {
      imageUrl = null;
    } else if (newImageBytes != null) {
      final uploadedUrl = await _uploadCommentImage(newImageBytes, imageExt ?? 'jpg');
      if (uploadedUrl != null) {
        imageUrl = uploadedUrl;
      }
    }

    final response = await supabase
        .from('comments')
        .update({
          'content': content.trim(),
          'image_url': imageUrl,
        })
        .eq('id', commentId)
        .select()
        .single();

    return Comment.fromJson(response);
  }

  Future<void> deleteComment(String commentId) async {
    print('Attempting to delete comment: $commentId');
    
    try {
      final commentData = await supabase
          .from('comments')
          .select('image_url')
          .eq('id', commentId)
          .maybeSingle();
      
      print('Comment data: $commentData');
      
      if (commentData != null && 
          commentData['image_url'] != null && 
          (commentData['image_url'] as String).isNotEmpty) {
        print('Deleting image: ${commentData['image_url']}');
        await deleteCommentImage(commentData['image_url']);
      }
    } catch (imageError) {
      print('Warning: Error handling image: $imageError');
    }
    
    try {
      await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);
      
      print('Comment deleted successfully from database');
    } catch (e) {
      print('Error deleting comment from database: $e');
      rethrow;
    }
  }

  String _getMimeType(String ext) {
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  Future<String?> _uploadCommentImage(Uint8List imageBytes, String fileExt) async {
    try {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}-${_uuid.v4()}.$fileExt';
      final mimeType = _getMimeType(fileExt);

      await supabase.storage
          .from('comment-images')
          .uploadBinary(
            fileName,
            imageBytes,
            fileOptions: FileOptions(contentType: mimeType),
          );

      final publicUrl = supabase.storage
          .from('comment-images')
          .getPublicUrl(fileName);

      return publicUrl;
    } catch (e) {
      print('Error uploading comment image: $e');
      return null;
    }
  }

  Future<void> deleteCommentImage(String imageUrl) async {
    try {
      if (imageUrl.isEmpty) {
        print('Image URL is empty, skipping deletion');
        return;
      }
      
      final uri = Uri.parse(imageUrl);
      final pathSegments = uri.pathSegments;
      if (pathSegments.isEmpty) {
        print('Could not extract filename from image URL');
        return;
      }
      
      final fileName = pathSegments.last;
      print('Attempting to delete image file: $fileName');
      
      await supabase.storage
          .from('comment-images')
          .remove([fileName]);
      
      print('Image deleted successfully: $fileName');
    } catch (e) {
      print('Warning: Error deleting comment image from storage: $e');
    }
  }
}