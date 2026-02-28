import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:image_picker/image_picker.dart';

class _PickedImage {
  final Uint8List bytes;
  final String ext;
  _PickedImage({required this.bytes, required this.ext});
}

class AddComment extends StatefulWidget {
  final Future<void> Function(String content, String authorName, List<({Uint8List bytes, String ext})> images) onSubmit;
  final bool isLoading;
  final bool isLoggedIn;
  final String? defaultAuthorName;

  const AddComment({
    super.key,
    required this.onSubmit,
    this.isLoading = false,
    this.isLoggedIn = false,
    this.defaultAuthorName,
  });

  @override
  State<AddComment> createState() => _AddCommentState();
}

class _AddCommentState extends State<AddComment> {
  final _contentController = TextEditingController();
  final _nameController = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();
  List<_PickedImage> _selectedImages = [];

  @override
  void initState() {
    super.initState();
    if (widget.defaultAuthorName != null) {
      _nameController.text = widget.defaultAuthorName!;
    }
  }

  @override
  void dispose() {
    _contentController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final pickedFiles = await _imagePicker.pickMultiImage(
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 80,
    );

    if (pickedFiles.isNotEmpty) {
      final List<_PickedImage> newImages = [];
      for (final xfile in pickedFiles) {
        final bytes = await xfile.readAsBytes();
        final ext = xfile.name.split('.').last;
        newImages.add(_PickedImage(bytes: bytes, ext: ext));
      }
      setState(() {
        _selectedImages.addAll(newImages);
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<void> _handleSubmit() async {
    final content = _contentController.text.trim();
    final authorName = _nameController.text.trim().isEmpty 
        ? 'Anonymous' 
        : _nameController.text.trim();

    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a comment')),
      );
      return;
    }

    try {
      await widget.onSubmit(
        content,
        authorName,
        _selectedImages.map((img) => (bytes: img.bytes, ext: img.ext)).toList(),
      );
      _contentController.clear();
      _nameController.clear();
      setState(() {
        _selectedImages = [];
      });
    } catch (_) {
      // Silently ignored - comment submission handled by parent
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (widget.defaultAuthorName == null || widget.defaultAuthorName!.isEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  hintText: 'Your name (optional)',
                  prefixIcon: const Icon(Icons.person_outline, size: 20),
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
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 12,
                  ),
                ),
              ),
            ),

          TextField(
            controller: _contentController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Write a comment...',
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

          if (_selectedImages.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 6,
                  mainAxisSpacing: 6,
                ),
                itemCount: _selectedImages.length,
                itemBuilder: (context, index) {
                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.memory(
                          _selectedImages[index].bytes,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 2,
                        right: 2,
                        child: GestureDetector(
                          onTap: () => _removeImage(index),
                          child: Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),

          const SizedBox(height: 12),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: TextButton.icon(
                  onPressed: _pickImages,
                  icon: const Icon(Icons.image_outlined, size: 20),
                  label: Text(_selectedImages.isNotEmpty ? 'Add More' : 'Add Images'),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF718096),
                  ),
                ),
              ),

              ElevatedButton(
                onPressed: widget.isLoading ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5A67D8),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: widget.isLoading
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Post Comment'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}