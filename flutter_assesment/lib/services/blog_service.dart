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

}