import 'package:flutter/material.dart';
import '../models/comment.dart';
import '../widgets/user_avatar.dart';
import 'dart:typed_data';
import 'package:image_picker/image_picker.dart';

class CommentItem extends StatefulWidget {
  final Comment comment;
  final bool isOwner;
  final Function(String content, List<({Uint8List bytes, String ext})> newImages, List<String> keepImageUrls) onEdit;
  final VoidCallback onDelete;
  final Function(bool isEditing)? onEditingChanged;

  const CommentItem({
    super.key,
    required this.comment,
    required this.isOwner,
    required this.onEdit,
    required this.onDelete,
    this.onEditingChanged,
  });

  @override
  State<CommentItem> createState() => _CommentItemState();
}

class _PickedImage {
  final Uint8List bytes;
  final String ext;
  _PickedImage({required this.bytes, required this.ext});
}

class _CommentItemState extends State<CommentItem> {
  bool _isEditing = false;
  late TextEditingController _editController;
  bool _isSaving = false;
  final ImagePicker _imagePicker = ImagePicker();
  List<_PickedImage> _newImages = [];
  List<String> _existingImageUrls = [];

  @override
  void initState() {
    super.initState();
    _editController = TextEditingController(text: widget.comment.content);
  }

  @override
  void dispose() {
    _editController.dispose();
    super.dispose();
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 1) {
      return 'Just now';
    } else if (diff.inHours < 1) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inDays < 1) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return '${date.month}/${date.day}/${date.year}';
    }
  }

  void _handleCancelEdit() {
    widget.onEditingChanged?.call(false);
    setState(() {
      _isEditing = false;
      _editController.text = widget.comment.content;
      _newImages = [];
      _existingImageUrls = [];
    });
  }
  Future<void> _pickImages() async {
    widget.onEditingChanged?.call(true);
    final pickedFiles = await _imagePicker.pickMultiImage(
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 80,
    );

    if (pickedFiles.isNotEmpty) {
      final List<_PickedImage> picked = [];
      for (final xfile in pickedFiles) {
        final bytes = await xfile.readAsBytes();
        final ext = xfile.name.split('.').last;
        picked.add(_PickedImage(bytes: bytes, ext: ext));
      }
      if (!mounted) return;
      setState(() {
        _newImages.addAll(picked);
      });
    }
  }

  void _removeExistingImage(int index) {
    setState(() {
      _existingImageUrls.removeAt(index);
    });
  }

  void _removeNewImage(int index) {
    setState(() {
      _newImages.removeAt(index);
    });
  }

  Future<void> _handleSaveEdit() async {
    if (_editController.text.trim().isEmpty) return;

    setState(() {
      _isSaving = true;
    });

    try {
      await widget.onEdit(
        _editController.text.trim(),
        _newImages.map((img) => (bytes: img.bytes, ext: img.ext)).toList(),
        _existingImageUrls,
      );
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isSaving = false;
      });
      return;
    }

    if (!mounted) return;
    widget.onEditingChanged?.call(false);
    setState(() {
      _isEditing = false;
      _isSaving = false;
      _newImages = [];
      _existingImageUrls = [];
    });
  }

  Future<void> _confirmDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Comment'),
        content: const Text('Are you sure you want to delete this comment?'),
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
      widget.onDelete();
    }
  }

  void _showFullImage(String imageUrl, {int initialIndex = 0}) {
    final urls = widget.comment.imageUrls;
    final allUrls = urls.isNotEmpty ? urls : [imageUrl];
    final pageController = PageController(initialPage: initialIndex);
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          int currentIndex = pageController.hasClients
              ? (pageController.page?.round() ?? initialIndex)
              : initialIndex;

          return Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: EdgeInsets.zero,
            child: Stack(
              children: [
                Center(
                  child: allUrls.length > 1
                      ? PageView.builder(
                          controller: pageController,
                          itemCount: allUrls.length,
                          onPageChanged: (index) {
                            setDialogState(() {});
                          },
                          itemBuilder: (context, index) {
                            return InteractiveViewer(
                              child: Center(
                                child: Image.network(
                                  allUrls[index],
                                  fit: BoxFit.contain,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(Icons.image_not_supported, size: 60, color: Colors.white54);
                                  },
                                ),
                              ),
                            );
                          },
                        )
                      : InteractiveViewer(
                          child: Image.network(
                            imageUrl,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(Icons.image_not_supported, size: 60, color: Colors.white54);
                            },
                          ),
                        ),
                ),
                Positioned(
                  top: 40,
                  right: 16,
                  child: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 30),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
                if (allUrls.length > 1) ...[
                  // Previous button
                  if (currentIndex > 0)
                    Positioned(
                      left: 8,
                      top: 0,
                      bottom: 0,
                      child: Center(
                        child: IconButton(
                          iconSize: 40,
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.chevron_left, color: Colors.white, size: 28),
                          ),
                          onPressed: () {
                            pageController.previousPage(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                            );
                          },
                        ),
                      ),
                    ),
                  // Next button
                  if (currentIndex < allUrls.length - 1)
                    Positioned(
                      right: 8,
                      top: 0,
                      bottom: 0,
                      child: Center(
                        child: IconButton(
                          iconSize: 40,
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.chevron_right, color: Colors.white, size: 28),
                          ),
                          onPressed: () {
                            pageController.nextPage(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeInOut,
                            );
                          },
                        ),
                      ),
                    ),
                  // Page indicator
                  Positioned(
                    bottom: 40,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          '${currentIndex + 1} / ${allUrls.length}',
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildImageCollage() {
    final urls = widget.comment.imageUrls;
    final count = urls.length;

    Widget img(String url, int index) {
      return GestureDetector(
        onTap: () => _showFullImage(url, initialIndex: index),
        child: Image.network(
          url,
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
          errorBuilder: (context, error, stackTrace) {
            return Container(
              color: const Color(0xFFE2E8F0),
              child: const Center(
                child: Icon(Icons.image_not_supported, size: 30, color: Color(0xFF718096)),
              ),
            );
          },
        ),
      );
    }

    if (count == 1) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(height: 150, width: double.infinity, child: img(urls[0], 0)),
      );
    }

    if (count == 2) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: 130,
          child: Row(children: [
            Expanded(child: img(urls[0], 0)),
            const SizedBox(width: 2),
            Expanded(child: img(urls[1], 1)),
          ]),
        ),
      );
    }

    if (count == 3) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SizedBox(
          height: 150,
          child: Row(children: [
            Expanded(flex: 2, child: img(urls[0], 0)),
            const SizedBox(width: 2),
            Expanded(
              child: Column(children: [
                Expanded(child: img(urls[1], 1)),
                const SizedBox(height: 2),
                Expanded(child: img(urls[2], 2)),
              ]),
            ),
          ]),
        ),
      );
    }

    // 4+ images
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        height: 150,
        child: Row(children: [
          Expanded(
            child: Column(children: [
              Expanded(child: img(urls[0], 0)),
              const SizedBox(height: 2),
              Expanded(child: img(urls[2], 2)),
            ]),
          ),
          const SizedBox(width: 2),
          Expanded(
            child: Column(children: [
              Expanded(child: img(urls[1], 1)),
              const SizedBox(height: 2),
              Expanded(
                child: count > 4
                    ? GestureDetector(
                        onTap: () => _showFullImage(urls[3], initialIndex: 3),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.network(urls[3], fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(color: const Color(0xFFE2E8F0))),
                            Container(
                              color: Colors.black45,
                              child: Center(
                                child: Text(
                                  '+${count - 3}',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : img(urls[3], 3),
              ),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _buildEditImageGrid() {
    final totalImages = _existingImageUrls.length + _newImages.length;
    if (totalImages == 0) return const SizedBox.shrink();

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 6,
        mainAxisSpacing: 6,
      ),
      itemCount: totalImages,
      itemBuilder: (context, index) {
        if (index < _existingImageUrls.length) {
          return Stack(
            fit: StackFit.expand,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  _existingImageUrls[index],
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: const Color(0xFFE2E8F0),
                    child: const Icon(Icons.image_not_supported, color: Color(0xFF718096)),
                  ),
                ),
              ),
              Positioned(
                top: 2,
                right: 2,
                child: GestureDetector(
                  onTap: () => _removeExistingImage(index),
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 14),
                  ),
                ),
              ),
            ],
          );
        } else {
          final newIndex = index - _existingImageUrls.length;
          return Stack(
            fit: StackFit.expand,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.memory(
                  _newImages[newIndex].bytes,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                top: 2,
                right: 2,
                child: GestureDetector(
                  onTap: () => _removeNewImage(newIndex),
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 14),
                  ),
                ),
              ),
            ],
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  UserAvatar(
                    photoUrl: widget.comment.authorPhotoUrl,
                    name: widget.comment.authorName,
                    size: 36,
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.comment.authorName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF2D3748),
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        _formatDate(widget.comment.createdAt),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF718096),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              if (widget.isOwner && !_isEditing)
                Row(
                  children: [
                    GestureDetector(
                      onTap: () {
                        widget.onEditingChanged?.call(true);
                        setState(() {
                          _isEditing = true;
                          _existingImageUrls = List.from(widget.comment.imageUrls);
                          _newImages = [];
                        });
                      },
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.edit,
                          size: 18,
                          color: Color(0xFF5A67D8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _confirmDelete,
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(
                          Icons.delete,
                          size: 18,
                          color: Colors.red,
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 12),

          if (_isEditing)
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _editController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: 'Edit your comment...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(color: Color(0xFF5A67D8), width: 2),
                    ),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                ),
                const SizedBox(height: 12),

                _buildEditImageGrid(),

                const SizedBox(height: 12),

                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    TextButton.icon(
                      onPressed: _pickImages,
                      icon: const Icon(Icons.image, size: 18),
                      label: Text(
                        _existingImageUrls.isNotEmpty || _newImages.isNotEmpty
                            ? 'Add More'
                            : 'Add Images',
                      ),
                      style: TextButton.styleFrom(
                        foregroundColor: const Color(0xFF718096),
                      ),
                    ),
                    Wrap(
                      spacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        TextButton(
                          onPressed: _isSaving ? null : _handleCancelEdit,
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          onPressed: _isSaving ? null : _handleSaveEdit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF5A67D8),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isSaving
                              ? const SizedBox(
                                  height: 16,
                                  width: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Save'),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            )
          else
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.comment.content,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Color(0xFF2D3748),
                    height: 1.5,
                  ),
                ),

                if (widget.comment.hasImages)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: _buildImageCollage(),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}