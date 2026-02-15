class Comment {
  final String id;
  final String blogId;
  final String? authorId;
  final String authorName;
  final String content;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  Comment({
    required this.id,
    required this.blogId,
    this.authorId,
    required this.authorName,
    required this.content,
    this.imageUrl,
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
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'blog_id': blogId,
      'author_id': authorId,
      'author_name': authorName,
      'content': content,
      'image_url': imageUrl,
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