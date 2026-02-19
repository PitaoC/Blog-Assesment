import '../main.dart';
import '../models/user_profile.dart';
import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileService {

  Future<UserProfile?> getUserProfile(String userId) async {
    try {
      final response = await supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      if (response == null) return null;
      return UserProfile.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  Future<UserProfile> createOrUpdateProfile({
    required String userId,
    required String email,
    String? displayName,
    String? photoUrl,
  }) async {
    final now = DateTime.now().toIso8601String();
    
    final data = {
      'id': userId,
      'email': email,
      'display_name': displayName,
      'photo_url': photoUrl,
      'updated_at': now,
    };

    final response = await supabase
        .from('profiles')
        .upsert(data)
        .select()
        .single();

    final updatedProfile = UserProfile.fromJson(response);

    await _syncCommentAuthorData(
      userId: userId,
      displayName: updatedProfile.displayName,
      photoUrl: updatedProfile.photoUrl,
    );

    return updatedProfile;
  }

  Future<void> _syncCommentAuthorData({
    required String userId,
    String? displayName,
    String? photoUrl,
  }) async {
    try {
      final updates = <String, dynamic>{
        'author_photo_url': photoUrl,
      };

      if (displayName != null && displayName.trim().isNotEmpty) {
        updates['author_name'] = displayName.trim();
      }

      await supabase
          .from('comments')
          .update(updates)
          .eq('author_id', userId);
    } catch (e) {
    }
  }

  Future<String?> uploadProfilePhoto(String userId, Uint8List imageBytes, String fileExt) async {
    try {
      final fileName = 'profile_$userId.$fileExt';
      final mimeType = _getMimeType(fileExt);

      try {
        await supabase.storage
            .from('profile-photos')
            .remove([fileName]);
      } catch (e) {
      }

      await supabase.storage
          .from('profile-photos')
          .uploadBinary(
            fileName,
            imageBytes,
            fileOptions: FileOptions(
              contentType: mimeType,
              upsert: true,
            ),
          );

        final publicUrl = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        return '$publicUrl?v=${DateTime.now().millisecondsSinceEpoch}';
    } catch (e) {
      return null;
    }
  }

  Future<void> deleteProfilePhoto(String userId) async {
    try {
      final fileName = 'profile_$userId.jpg';
      await supabase.storage
          .from('profile-photos')
          .remove([fileName]);
    } catch (e) {
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
}
