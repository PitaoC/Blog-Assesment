import 'package:flutter/material.dart';
import '../models/post.dart';
import '../models/user_profile.dart';
import '../services/profile_service.dart';
import '../widgets/user_avatar.dart';

class PostCard extends StatefulWidget {
  final Post post;
  final bool isOwner;
  final VoidCallback onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const PostCard({
    super.key,
    required this.post,
    required this.isOwner,
    required this.onTap,
    this.onEdit,
    this.onDelete,
  });

  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  final ProfileService _profileService = ProfileService();
  UserProfile? _authorProfile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAuthorProfile();
  }

  Future<void> _loadAuthorProfile() async {
    try {
      final profile = await _profileService.getUserProfile(widget.post.authorId);
      if (mounted) {
        setState(() {
          _authorProfile = profile;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _getAuthorDisplayName() {
    if (_authorProfile?.displayName != null && _authorProfile!.displayName!.isNotEmpty) {
      return _authorProfile!.displayName!;
    } else if (_authorProfile?.email != null) {
      return _authorProfile!.email.split('@').first;
    } else {
      return 'Unknown Author';
    }
  }

  Widget _buildImageCollage() {
    final urls = widget.post.imageUrls;
    final count = urls.length;

    Widget img(String url) {
      return Image.network(
        url,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: const Color(0xFFE2E8F0),
            child: const Center(
              child: Icon(
                Icons.image_not_supported,
                size: 30,
                color: Color(0xFF718096),
              ),
            ),
          );
        },
      );
    }

    if (count == 1) {
      return SizedBox(
        height: 200,
        width: double.infinity,
        child: img(urls[0]),
      );
    }

    if (count == 2) {
      return SizedBox(
        height: 180,
        child: Row(
          children: [
            Expanded(child: img(urls[0])),
            const SizedBox(width: 2),
            Expanded(child: img(urls[1])),
          ],
        ),
      );
    }

    if (count == 3) {
      return SizedBox(
        height: 200,
        child: Row(
          children: [
            Expanded(
              flex: 2,
              child: img(urls[0]),
            ),
            const SizedBox(width: 2),
            Expanded(
              child: Column(
                children: [
                  Expanded(child: img(urls[1])),
                  const SizedBox(height: 2),
                  Expanded(child: img(urls[2])),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // 4+ images: 2x2 grid with overlay for extras
    return SizedBox(
      height: 200,
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                Expanded(child: img(urls[0])),
                const SizedBox(height: 2),
                Expanded(child: img(urls[2])),
              ],
            ),
          ),
          const SizedBox(width: 2),
          Expanded(
            child: Column(
              children: [
                Expanded(child: img(urls[1])),
                const SizedBox(height: 2),
                Expanded(
                  child: count > 4
                      ? Stack(
                          fit: StackFit.expand,
                          children: [
                            img(urls[3]),
                            Container(
                              color: Colors.black45,
                              child: Center(
                                child: Text(
                                  '+${count - 3}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        )
                      : img(urls[3]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget.post.hasImages)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
                child: _buildImageCollage(),
              ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.post.title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A202C),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 10),

                  Text(
                    widget.post.content.length > 150
                        ? '${widget.post.content.substring(0, 150)}...'
                        : widget.post.content,
                    style: const TextStyle(
                      fontSize: 15,
                      color: Color(0xFF718096),
                      height: 1.5,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _isLoading
                          ? Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE2E8F0),
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                  child: const Center(
                                    child: SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Color(0xFF5A67D8),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 80,
                                      height: 14,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE2E8F0),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatDate(widget.post.createdAt),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(0xFFA0AEC0),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            )
                          : Row(
                              children: [
                                UserAvatar(
                                  photoUrl: _authorProfile?.photoUrl,
                                  name: _getAuthorDisplayName(),
                                  size: 36,
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _getAuthorDisplayName(),
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                        color: Color(0xFF4A5568),
                                      ),
                                    ),
                                    Text(
                                      _formatDate(widget.post.createdAt),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(0xFFA0AEC0),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                      if (widget.isOwner)
                        Row(
                          children: [
                            TextButton(
                              onPressed: widget.onEdit,
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFF5A67D8),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                              ),
                              child: const Text('Edit'),
                            ),
                            TextButton(
                              onPressed: widget.onDelete,
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.red,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                              ),
                              child: const Text('Delete'),
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}