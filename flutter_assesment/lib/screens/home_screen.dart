import 'package:flutter/material.dart';
import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/post.dart';
import '../widgets/post_card.dart';
import '../services/blog_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'view_blog_screen.dart';
import 'create_screen.dart';
import 'edit_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final BlogService _blogService = BlogService();
  final AuthService _authService = AuthService();
  List<Post> _blogs = [];
  bool _isLoading = true;
  String? _error;
  late final StreamSubscription<AuthState> _authSub;

  @override
  void initState() {
    super.initState();
    _loadBlogs();
    _authSub = _authService.authStateChanges.listen((_) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _authSub.cancel();
    super.dispose();
  }

  Future<void> _loadBlogs() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final blogs = await _blogService.getBlogs();
      if (!mounted) return;
      
      setState(() {
        _blogs = blogs;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteBlog(Post blog) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Blog'),
        content: const Text('Are you sure you want to delete this blog? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _blogService.deleteBlog(blog.id);
        setState(() {
          _blogs.removeWhere((b) => b.id == blog.id);
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Blog deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete blog: $e')),
          );
        }
      }
    }
  }

  void _handleLogout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = _authService.currentUser;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAFC),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: const Color(0xFF5A67D8),
        foregroundColor: Colors.white,
        title: const Text('📝 BlogHub'),
        actions: [
          if (currentUser != null) ...[
            IconButton(
              icon: const Icon(Icons.add),
              onPressed: () async {
                final result = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(builder: (_) => const CreateBlogScreen()),
                );
                if (result == true) {
                  _loadBlogs();
                }
              },
            ),
            IconButton(
              icon: const Icon(Icons.logout),
              onPressed: _handleLogout,
            ),
          ] else ...[
            TextButton(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              child: const Text(
                'Login',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadBlogs,
        child: _buildBody(),
      ),
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
              onPressed: _loadBlogs,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_blogs.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.article_outlined,
              size: 80,
              color: Color(0xFF718096),
            ),
            SizedBox(height: 20),
            Text(
              'No blogs found yet.',
              style: TextStyle(
                fontSize: 18,
                color: Color(0xFF718096),
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Be the first to share your story!',
              style: TextStyle(
                fontSize: 16,
                color: Color(0xFFA0AEC0),
              ),
            ),
          ],
        ),
      );
    }

    final currentUser = _authService.currentUser;

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _blogs.length,
      itemBuilder: (context, index) {
        final blog = _blogs[index];
        final isOwner = currentUser?.id == blog.authorId;

        return PostCard(
          post: blog,
          isOwner: isOwner,
          onTap: () async {
            await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ViewBlogScreen(blogId: blog.id),
              ),
            );
            _loadBlogs();
          },
          onEdit: () async {
            final result = await Navigator.of(context).push<bool>(
              MaterialPageRoute(
                builder: (_) => EditBlogScreen(blogId: blog.id),
              ),
            );
            if (result == true) {
              _loadBlogs();
            }
          },
          onDelete: () => _deleteBlog(blog),
        );
      },
    );
  }
}