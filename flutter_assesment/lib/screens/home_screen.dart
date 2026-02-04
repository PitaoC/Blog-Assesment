import 'package:flutter/material.dart';
import '../models/post.dart';
import '../widgets/post_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  List<Post> _mockPosts() => [
        Post(
          id: '1',
          title: 'Hello Flutter',
          excerpt: 'Migrating from React to Flutter.',
        ),
        Post(
          id: '2',
          title: 'State Management',
          excerpt: 'Provider vs Riverpod vs Bloc.',
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final posts = _mockPosts();

    return Scaffold(
      appBar: AppBar(title: const Text('Blog')),
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