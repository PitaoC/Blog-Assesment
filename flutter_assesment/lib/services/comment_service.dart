import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../main.dart';
import '../models/comment.dart';
import 'package:uuid/uuid.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CommentService {
  final _uuid = const Uuid();
  Future<List<Comment>> getComments(String blogId) async {
    try {
      final response = await supabase
          .from('comments')
          .select('id, blog_id, author_id, author_name, content, image_url, author_photo_url, created_at, updated_at, profiles(display_name, photo_url)')
          .eq('blog_id', blogId)
          .order('created_at', ascending: false);

      return (response as List).map((json) {
        final commentData = Map<String, dynamic>.from(json);
        if (json['profiles'] != null && json['profiles'] is Map) {
          final profiles = json['profiles'] as Map;
          commentData['author_photo_url'] = profiles['photo_url'];
          if (profiles['display_name'] != null) {
            commentData['author_name'] = profiles['display_name'];
          }
        }
        commentData.remove('profiles');
        return Comment.fromJson(commentData);
      }).toList();
    } catch (e) {
      final response = await supabase
          .from('comments')
          .select()
          .eq('blog_id', blogId)
          .order('created_at', ascending: false);

      return (response as List).map((json) => Comment.fromJson(json)).toList();
    }
  }

  Future<List<String>?> uploadMultipleCommentImages(List<({Uint8List bytes, String ext})> images) async {
    final List<String> urls = [];
    for (final img in images) {
      final url = await _uploadCommentImage(img.bytes, img.ext);
      if (url == null) return null;
      urls.add(url);
    }
    return urls;
  }

  Future<Comment> addComment({
    required String blogId,
    String? authorId,
    required String authorName,
    required String content,
    List<({Uint8List bytes, String ext})>? images,
  }) async {
    String? imageUrl;

    if (images != null && images.isNotEmpty) {
      final urls = await uploadMultipleCommentImages(images);
      if (urls != null) {
        imageUrl = Comment.encodeImageUrls(urls);
      }
    }

    String finalAuthorName = authorName.trim();
    String? authorPhotoUrl;
    if (authorId != null) {
      try {
        final profileData = await supabase
            .from('profiles')
            .select('display_name, photo_url')
            .eq('id', authorId)
            .maybeSingle();
        
        if (profileData != null && profileData['display_name'] != null) {
          finalAuthorName = profileData['display_name'];
        }
        if (profileData != null && profileData['photo_url'] != null) {
          authorPhotoUrl = profileData['photo_url'];
        }
      } catch (_) {
        // Silently ignored - profile fetch is optional
      }
    }

    try {
      final response = await supabase
          .from('comments')
          .insert({
            'blog_id': blogId,
            'author_id': authorId,
            'author_name': finalAuthorName,
            'author_photo_url': authorPhotoUrl,
            'content': content.trim(),
            'image_url': imageUrl,
          })
          .select('id, blog_id, author_id, author_name, content, image_url, author_photo_url, created_at, updated_at, profiles(display_name, photo_url)')
          .single();

      final commentData = Map<String, dynamic>.from(response);
      if (response['profiles'] != null && response['profiles'] is Map) {
        final profiles = response['profiles'] as Map;
        commentData['author_photo_url'] = profiles['photo_url'];
        if (profiles['display_name'] != null) {
          commentData['author_name'] = profiles['display_name'];
        }
      }
      commentData.remove('profiles');
      return Comment.fromJson(commentData);
    } catch (e) {
      final response = await supabase
          .from('comments')
          .insert({
            'blog_id': blogId,
            'author_id': authorId,
            'author_name': finalAuthorName,
            'author_photo_url': authorPhotoUrl,
            'content': content.trim(),
            'image_url': imageUrl,
          })
          .select()
          .single();

      return Comment.fromJson(response);
    }
  }

  Future<Comment> updateComment({
    required String commentId,
    required String content,
    List<({Uint8List bytes, String ext})>? newImages,
    List<String>? keepImageUrls,
  }) async {
    List<String> allUrls = List.from(keepImageUrls ?? []);

    if (newImages != null && newImages.isNotEmpty) {
      final uploadedUrls = await uploadMultipleCommentImages(newImages);
      if (uploadedUrls != null) {
        allUrls.addAll(uploadedUrls);
      }
    }

    final imageUrl = Comment.encodeImageUrls(allUrls);

    try {
      final response = await supabase
          .from('comments')
          .update({
            'content': content.trim(),
            'image_url': imageUrl,
          })
          .eq('id', commentId)
          .select('id, blog_id, author_id, author_name, content, image_url, author_photo_url, created_at, updated_at, profiles(display_name, photo_url)')
          .single();

      final commentData = Map<String, dynamic>.from(response);
      if (response['profiles'] != null && response['profiles'] is Map) {
        final profiles = response['profiles'] as Map;
        commentData['author_photo_url'] = profiles['photo_url'];
        if (profiles['display_name'] != null) {
          commentData['author_name'] = profiles['display_name'];
        }
      }
      commentData.remove('profiles');
      return Comment.fromJson(commentData);
    } catch (e) {
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
  }

  Future<void> deleteComment(String commentId) async {
    debugPrint('Attempting to delete comment: $commentId');
    
    try {
      final commentData = await supabase
          .from('comments')
          .select('image_url')
          .eq('id', commentId)
          .maybeSingle();
      
      debugPrint('Comment data: $commentData');
      
      if (commentData != null && 
          commentData['image_url'] != null && 
          (commentData['image_url'] as String).isNotEmpty) {
        final rawUrl = commentData['image_url'] as String;
        List<String> urlsToDelete;
        final trimmedUrl = rawUrl.trim();
        if (trimmedUrl.startsWith('[')) {
          try {
            urlsToDelete = (jsonDecode(trimmedUrl) as List).cast<String>();
          } catch (_) {
            urlsToDelete = [trimmedUrl];
          }
        } else {
          urlsToDelete = [trimmedUrl];
        }
        for (final url in urlsToDelete) {
          if (url.isNotEmpty) {
            debugPrint('Deleting image: $url');
            await deleteCommentImage(url);
          }
        }
      }
    } catch (imageError) {
      debugPrint('Warning: Error handling image: $imageError');
    }
    
    try {
      await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);
      
      debugPrint('Comment deleted successfully from database');
    } catch (e) {
      debugPrint('Error deleting comment from database: $e');
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
      debugPrint('Error uploading comment image: $e');
      return null;
    }
  }

  Future<void> deleteCommentImage(String imageUrl) async {
    try {
      if (imageUrl.isEmpty) {
        debugPrint('Image URL is empty, skipping deletion');
        return;
      }
      
      final uri = Uri.parse(imageUrl);
      final pathSegments = uri.pathSegments;
      if (pathSegments.isEmpty) {
        debugPrint('Could not extract filename from image URL');
        return;
      }
      
      final fileName = pathSegments.last;
      debugPrint('Attempting to delete image file: $fileName');
      
      await supabase.storage
          .from('comment-images')
          .remove([fileName]);
      
      debugPrint('Image deleted successfully: $fileName');
    } catch (e) {
      debugPrint('Warning: Error deleting comment image from storage: $e');
    }
  }
}