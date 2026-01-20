import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setBlogs, removeBlog, setLoading, setError } from '../store/slices/blogsSlice';
import { Blog } from '../store/slices/blogsSlice';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Comment, { CommentData } from '../components/Comment';
import AddComment from '../components/AddComment';

const PageHeader = styled.div`
  margin-bottom: 40px;

  h1 {
    color: #1a202c;
    font-size: 2.5rem;
    margin: 0 0 10px 0;
  }

  p {
    color: #718096;
    font-size: 1.1rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 30px;

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;

    h1 {
      font-size: 1.5rem;
    }

    p {
      font-size: 0.9rem;
    }
  }
`;

const BlogContainer = styled.div`
  display: grid;
  gap: 25px;
  margin-bottom: 40px;
`;

const BlogItem = styled.article`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 30px;
  border: 1px solid rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border-left: 4px solid #5a67d8;
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
    transform: translateY(-4px);
  }

  img {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
    margin-bottom: 20px;
    background: #f7fafc;
  }

  h2 {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    color: #1a202c;
  }

  p {
    color: #4a5568;
    line-height: 1.7;
    margin: 0 0 20px 0;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 24px;

    img {
      max-height: 300px;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 1.25rem;
    }

    p {
      font-size: 0.95rem;
    }
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 8px;

    img {
      max-height: 200px;
      margin-bottom: 12px;
    }

    h2 {
      font-size: 1.1rem;
      margin-bottom: 10px;
    }

    p {
      font-size: 0.9rem;
      margin-bottom: 16px;
    }
  }
`;

const BlogActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;

  a {
    display: inline-block;
    padding: 8px 16px;
    background: #5a67d8;
    color: white;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      background: #4c51bf;
      text-decoration: none;
    }
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;

    a {
      padding: 6px 12px;
      font-size: 12px;
    }
  }
`;

const BlogItemContent = styled.div`
  cursor: pointer;

  &:hover h2 {
    color: #5a67d8;
  }

  h2, p {
    transition: color 0.3s ease;
  }
`;

const DeleteBtn = styled.button`
  background: #f56565;
  padding: 8px 16px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(245, 101, 101, 0.2);

  &:hover:not(:disabled) {
    background: #e53e3e;
    box-shadow: 0 4px 8px rgba(245, 101, 101, 0.3);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  flex-wrap: wrap;

  button {
    padding: 10px 20px;
    min-width: 100px;
  }

  @media (max-width: 768px) {
    margin-top: 30px;

    button {
      padding: 8px 16px;
      min-width: 90px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 20px;

    button {
      padding: 6px 12px;
      min-width: auto;
      font-size: 12px;
    }

    span {
      font-size: 12px;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #718096;

  p {
    font-size: 1.1rem;
    margin: 10px 0;
  }
`;

const CommentsSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
`;

const CommentsSectionTitle = styled.h3`
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

const ViewCommentsLink = styled(Link)`
  display: inline-block;
  color: #5a67d8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  margin-top: 12px;
  transition: all 0.3s ease;

  &:hover {
    color: #4c51bf;
    text-decoration: underline;
  }
`;

const BlogList: React.FC = () => {
  const dispatch = useDispatch();
  const blogs = useSelector((state: RootState) => state.blogs.list);
  const user = useSelector((state: RootState) => state.auth.user as User | null);
  const [page, setPage] = useState(0);
  const comments: { [blogId: string]: CommentData[] } = {};
  const loadingComments: { [blogId: string]: boolean } = {};

  useEffect(() => {
    const fetchBlogs = async () => {
      dispatch(setLoading(true));
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .range(page * 10, (page + 1) * 10 - 1)
        .order('created_at', { ascending: false });
      if (error) {
        dispatch(setError(error.message));
      } else {
        dispatch(setBlogs(data || []));
      }
    };
    fetchBlogs();
  }, [page, dispatch]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) {
      dispatch(removeBlog(id));
    }
  };

  const handleAddComment = (blogId: string, comment: { author: string; content: string; image_url?: string }) => {
    console.log('Comment added to blog:', blogId, comment);
  };

  return (
    <div className="container">
      <PageHeader>
        <h1>Discover Stories</h1>
        <p>Explore amazing blog posts from our community</p>
      </PageHeader>
      {blogs.length === 0 ? (
        <EmptyState>
          <p>No blogs found yet.</p>
          <p>Be the first to share your story!</p>
        </EmptyState>
      ) : (
        <>
          <BlogContainer>
            {blogs.map((blog: Blog) => (
              <BlogItem key={blog.id}>
                <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <BlogItemContent>
                    <h2>{blog.title}</h2>
                    <p>{blog.content.substring(0, 150)}...</p>
                    {blog.image_url && <img src={blog.image_url} alt={blog.title} />}
                  </BlogItemContent>
                </Link>
                {user && user.id === blog.author_id && (
                  <BlogActions>
                    <Link to={`/blogs/${blog.id}/edit`}>Edit</Link>
                    <DeleteBtn onClick={() => handleDelete(blog.id)}>Delete</DeleteBtn>
                  </BlogActions>
                )}
                <CommentsSection>
                  <CommentsSectionTitle>Comments</CommentsSectionTitle>
                  <AddComment
                    blogId={blog.id}
                    userName={user?.email || 'Anonymous User'}
                    onCommentAdd={(comment) => handleAddComment(blog.id, comment)}
                    isLoading={loadingComments[blog.id] || false}
                  />
                  <CommentsList>
                    {(comments[blog.id] || []).slice(0, 3).map((comment) => (
                      <Comment key={comment.id} comment={comment} />
                    ))}
                  </CommentsList>
                  {(comments[blog.id]?.length || 0) > 3 && (
                    <ViewCommentsLink to={`/blogs/${blog.id}`}>
                      View all {comments[blog.id]?.length} comments →
                    </ViewCommentsLink>
                  )}
                </CommentsSection>
              </BlogItem>
            ))}
          </BlogContainer>
          <PaginationContainer>
            <button onClick={() => setPage(page - 1)} disabled={page === 0}>← Previous</button>
            <span style={{ color: '#718096', fontWeight: 600 }}>Page {page + 1}</span>
            <button onClick={() => setPage(page + 1)} disabled={blogs.length < 10}>Next →</button>
          </PaginationContainer>
        </>
      )}
    </div>
  );
};

export default BlogList;