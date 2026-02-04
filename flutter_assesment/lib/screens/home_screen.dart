import 'package:flutter/material.dart';
import '../models/post.dart';
import '../widgets/post_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  List<Post> _mockPosts() => [
        Post(
          id: '1',
          title: 'Hello Flutter',
          content: 'Migrating from React to Flutter.',
          authorId: 'author1',
          imageUrl: null,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
        Post(
          id: '2',
          title: 'State Management',
          content: 'Provider vs Riverpod vs Bloc.',
          authorId: 'author2',
          imageUrl: null,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final posts = _mockPosts();

    return Scaffold(
      appBar: AppBar(
        title: const Text('📝 BlogHub'),
        backgroundColor: const Color(0xFF5A67D8),
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: posts.length,
        itemBuilder: (ctx, i) {
          final post = posts[i];
          return PostCard(
            post: post,
            onTap: () {},
          );
        },
      ),
    );
  }
}