import 'package:flutter/material.dart';
import '../models/post.dart';

class PostCard extends StatelessWidget {
  final Post post;
  final VoidCallback? onTap;

  const PostCard({super.key, required this.post, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Row(
        children: <Widget>[
          Expanded(
            child: ListTile(
              title: Text(post.title, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(post.content),
              onTap: onTap,
            ),
          ),
          Row(
            children: <Widget>[
              IconButton(
                icon: const Icon(Icons.thumb_up),
                onPressed: () {},
              ),
              IconButton(
                icon: const Icon(Icons.thumb_down),
                onPressed: () {},
              ),
            ],
          )
        ]
      ),
    );
  }
}