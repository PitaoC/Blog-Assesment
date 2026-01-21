import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import styled from 'styled-components';
import { Blog } from '../store/slices/blogsSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User } from '@supabase/supabase-js';
import Comment, { CommentData } from '../components/Comment';
import AddComment from '../components/AddComment';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: #e2e8f0;
  color: #2d3748;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: #cbd5e0;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const BlogContent = styled.article`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 40px;
  border: 1px solid rgba(0,0,0,0.05);

  h1 {
    color: #1a202c;
    font-size: 2.2rem;
    margin: 0 0 20px 0;
    line-height: 1.3;
  }

  .blog-meta {
    color: #718096;
    font-size: 0.95rem;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;

    span {
      margin-right: 20px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  img {
    width: 100%;
    height: auto;
    max-height: 500px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 30px;
    background: #f7fafc;
  }

  .blog-body {
    color: #2d3748;
    line-height: 1.8;
    font-size: 1.05rem;

    p {
      margin: 0 0 20px 0;
    }
  }

  @media (max-width: 768px) {
    padding: 30px;

    h1 {
      font-size: 1.8rem;
    }

    .blog-meta {
      font-size: 0.9rem;
    }

    .blog-body {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 8px;

    h1 {
      font-size: 1.5rem;
      margin-bottom: 16px;
    }

    .blog-meta {
      font-size: 0.85rem;
      margin-bottom: 20px;
      padding-bottom: 16px;

      span {
        display: block;
        margin-bottom: 8px;
        margin-right: 0;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    img {
      max-height: 300px;
      margin-bottom: 20px;
    }

    .blog-body {
      font-size: 0.95rem;
    }
  }
`;

const BlogActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;

  button {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }

  .edit-btn {
    background: #5a67d8;
    color: white;

    &:hover {
      background: #4c51bf;
    }
  }

  .delete-btn {
    background: #f56565;
    color: white;

    &:hover:not(:disabled) {
      background: #e53e3e;
    }
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 24px;
    padding-top: 20px;

    button {
      padding: 8px 16px;
      font-size: 12px;
    }
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;

  p {
    font-size: 1.1rem;
    margin: 10px 0;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #c53030;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const CommentsSection = styled.div`
  margin-top: 50px;
  padding-top: 40px;
  border-top: 2px solid #e2e8f0;
`;

const CommentsSectionTitle = styled.h2`
  color: #1a202c;
  font-size: 1.5rem;
  margin: 0 0 30px 0;
  font-weight: 600;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NoCommentsMessage = styled.p`
  color: #718096;
  text-align: center;
  padding: 30px;
  font-style: italic;
`;

const ViewBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user as User | null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        setError('Blog ID not found');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setError(error.message);
        } else if (data) {
          setBlog(data as Blog);
        } else {
          setError('Blog not found');
        }
      } catch {
        setError('Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const loadComments = async () => {
    if (!id) return;
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId);

      if (error) throw error;
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, content } : c)));
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!blog) return;

    if (window.confirm('Are you sure you want to delete this blog?')) {
      const { error } = await supabase.from('blogs').delete().eq('id', blog.id);
      if (!error) {
        navigate('/blogs');
      } else {
        setError('Failed to delete blog');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <BackButton onClick={() => navigate('/blogs')}>← Back to Blogs</BackButton>
        <PageContainer>
          <LoadingSpinner>
            <p>Loading blog...</p>
          </LoadingSpinner>
        </PageContainer>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container">
        <BackButton onClick={() => navigate('/blogs')}>← Back to Blogs</BackButton>
        <PageContainer>
          <ErrorMessage>{error || 'Blog not found'}</ErrorMessage>
        </PageContainer>
      </div>
    );
  }

  const createdDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container">
      <BackButton onClick={() => navigate('/blogs')}>← Back to Blogs</BackButton>
      <PageContainer>
        <BlogContent>
          <h1>{blog.title}</h1>
          <div className="blog-meta">
            <span>By Author</span>
            <span>{createdDate}</span>
          </div>
          {blog.image_url && <img src={blog.image_url} alt={blog.title} />}
          <div className="blog-body">
            <p>{blog.content}</p>
          </div>
          <BlogActions>
            {user && user.id === blog.author_id && (
              <>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/blogs/${blog.id}/edit`)}
                >
                  Edit
                </button>
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </BlogActions>

          <CommentsSection>
            <CommentsSectionTitle>Comments ({comments.length})</CommentsSectionTitle>
            <AddComment
              blogId={blog.id}
              userName={user?.email || 'Anonymous User'}
              userId={user?.id}
              onCommentAdd={() => loadComments()}
              isLoading={loadingComments}
            />
            {comments.length === 0 ? (
              <NoCommentsMessage>No comments yet. Be the first to share your thoughts!</NoCommentsMessage>
            ) : (
              <CommentsList>
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                    onDelete={handleDeleteComment}
                    onEdit={(commentId, content) => handleEditComment(commentId, content)}
                  />
                ))}
              </CommentsList>
            )}
          </CommentsSection>
        </BlogContent>
      </PageContainer>
    </div>
  );
};

export default ViewBlog;
