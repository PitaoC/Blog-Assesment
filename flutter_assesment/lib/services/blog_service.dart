import '../main.dart';
import '../models/post.dart';

class BlogService {
  Future<List<Post>> getBlogs({int page = 0, int limit = 10}) async {
    final from = page * limit;
    final to = from + limit - 1;

    final response = await supabase
        .from('blogs')
        .select()
        .range(from, to)
        .order('created_at', ascending: false);

    return (response as List).map((json) => Post.fromJson(json)).toList();
  }

  Future<Post?> getBlogById(String id) async {
    final response = await supabase
        .from('blogs')
        .select()
        .eq('id', id)
        .single();

    return Post.fromJson(response);
  }
  
  Future<Post> createBlog({
    required String title,
    required String content,
    required String authorId,
    String? imageUrl,
  }) async {
    final response = await supabase
        .from('blogs')
        .insert({
          'title': title.trim(),
          'content': content.trim(),
          'author_id': authorId,
          'image_url': imageUrl,
        })
        .select()
        .single();

    return Post.fromJson(response);
  }

  Future<void> deleteBlog(String id) async {
    await supabase.from('blogs').delete().eq('id', id);
  }

}