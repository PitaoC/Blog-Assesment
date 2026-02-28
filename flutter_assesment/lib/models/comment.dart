import 'dart:convert';

class Comment {
  final String id;
  final String blogId;
  final String? authorId;
  final String authorName;
  final String content;
  final String? imageUrl;
  final String? authorPhotoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  Comment({
    required this.id,
    required this.blogId,
    this.authorId,
    required this.authorName,
    required this.content,
    this.imageUrl,
    this.authorPhotoUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as String,
      blogId: json['blog_id'] as String,
      authorId: json['author_id'] as String?,
      authorName: json['author_name'] as String,
      content: json['content'] as String,
      imageUrl: json['image_url'] as String?,
      authorPhotoUrl: json['author_photo_url'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  /// Parses the imageUrl field into a list of image URLs.
  List<String> get imageUrls {
    if (imageUrl == null || imageUrl!.isEmpty) return [];
    final trimmed = imageUrl!.trim();
    if (trimmed.startsWith('[')) {
      try {
        final decoded = jsonDecode(trimmed) as List;
        return decoded.cast<String>().where((url) => url.isNotEmpty).toList();
      } catch (_) {
        return [trimmed];
      }
    }
    return [trimmed];
  }

  bool get hasImages => imageUrls.isNotEmpty;

  String? get firstImageUrl => hasImages ? imageUrls.first : null;

  static String? encodeImageUrls(List<String> urls) {
    if (urls.isEmpty) return null;
    if (urls.length == 1) return urls.first;
    return jsonEncode(urls);
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'blog_id': blogId,
      'author_id': authorId,
      'author_name': authorName,
      'content': content,
      'image_url': imageUrl,
      'author_photo_url': authorPhotoUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Comment copyWith({
    String? id,
    String? blogId,
    String? authorId,
    String? authorName,
    String? content,
    String? imageUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Comment(
      id: id ?? this.id,
      blogId: blogId ?? this.blogId,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      content: content ?? this.content,
      imageUrl: imageUrl ?? this.imageUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}