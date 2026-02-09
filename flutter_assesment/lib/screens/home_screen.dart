import 'package:flutter/material.dart';
import '../models/post.dart';
import '../widgets/post_card.dart';
import '../services/blog_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

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

  @override
  void initState() {
    super.initState();
    _loadBlogs();
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



  void _handleLogout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
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
        backgroundColor: const Color(0xFF5A67D8),
        foregroundColor: Colors.white,
        title: const Text('📝 BlogHub'),
        actions: [
          if (currentUser != null) ...[
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
          },
        );
      },
    );
  }
}