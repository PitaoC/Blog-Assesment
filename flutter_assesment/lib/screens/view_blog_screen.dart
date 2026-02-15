import 'package:flutter/material.dart';
import '../models/post.dart';
import '../services/blog_service.dart';
import '../services/auth_service.dart';
import 'edit_screen.dart';
import '../models/comment.dart';
import '../services/comment_service.dart';
import '../widgets/comment_item.dart';
import '../widgets/add_comment.dart';
import 'login_screen.dart';
import 'dart:typed_data';


class ViewBlogScreen extends StatefulWidget {
  final String blogId;

  const ViewBlogScreen({super.key, required this.blogId});

  @override
  State<ViewBlogScreen> createState() => _ViewBlogScreenState();
}

class _ViewBlogScreenState extends State<ViewBlogScreen> {
  final BlogService _blogService = BlogService();
  final AuthService _authService = AuthService();
  final CommentService _commentService = CommentService();

  Post? _blog;
  bool _isLoading = true;
  String? _error;
  bool _isDeleting = false;
  List<Comment> _comments = [];
  bool _isLoadingComments = false;
  bool _isAddingComment = false;

  @override
  void initState() {
    super.initState();
    _loadBlog();
    _loadComments();
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

  Future<void> _deleteBlog() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Blog'),
        content: const Text(
          'Are you sure you want to delete this blog? This will also delete all comments. This action cannot be undone.',
        ),
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

    if (confirm == true && _blog != null) {
      setState(() {
        _isDeleting = true;
      });

      try {
        await _blogService.deleteBlog(_blog!.id);
        if (mounted) {
          Navigator.of(context).pop(true);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete blog: $e')),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isDeleting = false;
          });
        }
      }
    }
  }

  String _formatDate(DateTime date) {
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  Future<void> _loadComments() async {
    setState(() {
      _isLoadingComments = true;
    });

    try {
      final comments = await _commentService.getComments(widget.blogId);
      setState(() {
        _comments = comments;
        _isLoadingComments = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingComments = false;
      });
      print('Error loading comments: $e');
    }
  }

  Future<void> _addComment(String content, String authorName, Uint8List? imageBytes, String? imageExt) async {
    final user = _authService.currentUser;

    setState(() {
      _isAddingComment = true;
    });

    try {
      final comment = await _commentService.addComment(
        blogId: widget.blogId,
        authorId: user?.id,
        authorName: authorName,
        content: content,
        imageBytes: imageBytes,
        imageExt: imageExt,
      );
      
      await _loadComments();
      
      setState(() {
        _isAddingComment = false;
      });
      
      if (mounted) {
        if (imageBytes != null && (comment.imageUrl == null || comment.imageUrl!.isEmpty)) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Comment posted, but image upload failed. Update your Supabase storage bucket policy to allow public uploads.'),
              duration: Duration(seconds: 5),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Comment posted successfully!')),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isAddingComment = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add comment: $e')),
        );
      }
      rethrow; 
    }
  }

  Future<void> _editComment(
    String commentId,
    String content,
    Uint8List? newImageBytes,
    String? imageExt,
    bool removeImage,
  ) async {
    try {
      final existingComment = _comments.firstWhere((c) => c.id == commentId);
      
      final updatedComment = await _commentService.updateComment(
        commentId: commentId,
        content: content,
        newImageBytes: newImageBytes,
        imageExt: imageExt,
        existingImageUrl: existingComment.imageUrl,
        removeImage: removeImage,
      );
      
      setState(() {
        final index = _comments.indexWhere((c) => c.id == commentId);
        if (index != -1) {
          _comments[index] = updatedComment;
        }
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment updated successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update comment: $e')),
        );
      }
    }
  }

  Future<void> _deleteComment(String commentId) async {
    try {
      await _commentService.deleteComment(commentId);
      
      await _loadComments();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Comment deleted')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete comment: $e')),
        );
      }
    }
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
        actions: [
          if (isOwner && _blog != null) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () async {
                final result = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => EditBlogScreen(blogId: _blog!.id),
                  ),
                );
                if (result == true) {
                  _loadBlog();
                }
              },
            ),
            IconButton(
              icon: _isDeleting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.delete),
              onPressed: _isDeleting ? null : _deleteBlog,
            ),
          ],
        ],
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

    final currentUser = _authService.currentUser;
    final userEmail = currentUser?.email;
    final defaultAuthorName = userEmail?.split('@').first;

    return RefreshIndicator(
      onRefresh: () async {
        await Future.wait([_loadBlog(), _loadComments()]);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
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

                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text(
                              '💬 Comments',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF2D3748),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF5A67D8),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '${_comments.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        AddComment(
                          onSubmit: _addComment,
                          isLoading: _isAddingComment,
                          isLoggedIn: currentUser != null,
                          defaultAuthorName: defaultAuthorName,
                        ),
                        const SizedBox(height: 24),

                        if (_isLoadingComments)
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.all(20),
                              child: CircularProgressIndicator(
                                color: Color(0xFF5A67D8),
                              ),
                            ),
                          )
                        else if (_comments.isEmpty)
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.chat_bubble_outline,
                                    size: 48,
                                    color: Color(0xFFA0AEC0),
                                  ),
                                  SizedBox(height: 12),
                                  Text(
                                    'No comments yet',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                      color: Color(0xFF718096),
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Be the first to share your thoughts!',
                                    style: TextStyle(
                                      color: Color(0xFFA0AEC0),
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _comments.length,
                            itemBuilder: (context, index) {
                              final comment = _comments[index];
                              final isCommentOwner = 
                                  currentUser != null &&
                                  comment.authorId != null &&
                                  currentUser.id == comment.authorId;

                              return CommentItem(
                                key: ValueKey(comment.id),
                                comment: comment,
                                isOwner: isCommentOwner,
                                onEdit: (content, newImageBytes, imageExt, removeImage) => 
                                    _editComment(
                                      comment.id,
                                      content,
                                      newImageBytes,
                                      imageExt,
                                      removeImage,
                                    ),
                                onDelete: () => _deleteComment(comment.id),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}