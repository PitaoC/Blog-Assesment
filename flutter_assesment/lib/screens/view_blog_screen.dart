import 'package:flutter/material.dart';
import '../models/post.dart';
import '../services/blog_service.dart';
import '../services/auth_service.dart';


class ViewBlogScreen extends StatefulWidget {
  final String blogId;

  const ViewBlogScreen({super.key, required this.blogId});

  @override
  State<ViewBlogScreen> createState() => _ViewBlogScreenState();
}

class _ViewBlogScreenState extends State<ViewBlogScreen> {
  final BlogService _blogService = BlogService();
  final AuthService _authService = AuthService();

  Post? _blog;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBlog();
  }

  Future<void> _loadBlog() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final blog = await _blogService.getBlogById(widget.blogId);
      setState(() {
        _blog = blog;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }


  String _formatDate(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = _authService.currentUser;
    final isOwner = currentUser?.id == _blog?.authorId;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF5A67D8),
        foregroundColor: Colors.white,
        title: const Text('View Blog'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF5A67D8),
        ),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 60,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              _error!,
              style: const TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadBlog,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_blog == null) {
      return const Center(
        child: Text(
          'Blog not found',
          style: TextStyle(
            fontSize: 18,
            color: Color(0xFF718096),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_blog!.imageUrl != null && _blog!.imageUrl!.isNotEmpty)
            Image.network(
              _blog!.imageUrl!,
              height: 250,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 250,
                  color: const Color(0xFFE2E8F0),
                  child: const Center(
                    child: Icon(
                      Icons.image_not_supported,
                      size: 60,
                      color: Color(0xFF718096),
                    ),
                  ),
                );
              },
            ),

          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _blog!.title,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A202C),
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    const Icon(
                      Icons.calendar_today,
                      size: 16,
                      color: Color(0xFF718096),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _formatDate(_blog!.createdAt),
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF718096),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                Container(
                  height: 1,
                  color: const Color(0xFFE2E8F0),
                ),
                const SizedBox(height: 24),

                Text(
                  _blog!.content,
                  style: const TextStyle(
                    fontSize: 17,
                    color: Color(0xFF2D3748),
                    height: 1.8,
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }
}