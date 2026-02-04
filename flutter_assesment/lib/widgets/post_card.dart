import 'package:flutter/material.dart';
import '../models/post.dart';

class PostCard extends StatelessWidget {
  final Post post;
  final VoidCallback? onTap;

  const PostCard({super.key, required this.post, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(post.title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(post.excerpt, maxLines: 2, overflow: TextOverflow.ellipsis),
        onTap: onTap,
      ),
    );
  }
}