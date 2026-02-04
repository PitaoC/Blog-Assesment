class Post {
  final String id;
  final String title;
  final String excerpt;

  Post({
    required this.id,
    required this.title,
    required this.excerpt,
  });

  factory Post.fromJson(Map<String, dynamic> json) => Post(
        id: '${json['id']}',
        title: json['title'] ?? '',
        excerpt: json['excerpt'] ?? '',
      );
}