import '../main.dart';
import '../models/comment.dart';

class CommentService {
  Future<List<Comment>> getComments(String blogId) async {
    final response = await supabase
        .from('comments')
        .select()
        .eq('blog_id', blogId)
        .order('created_at', ascending: false);

    return (response as List).map((json) => Comment.fromJson(json)).toList();
  }

  Future<Comment> addComment({
    required String blogId,
    required String authorId,
    required String content,
  }) async {
    final response = await supabase
        .from('comments')
        .insert({
          'blog_id': blogId,
          'author_id': authorId,
          'content': content.trim(),
        })
        .select()
        .single();

    return Comment.fromJson(response);
  }
}