import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import styled from 'styled-components';
import { Blog } from '../store/slices/blogsSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User } from '@supabase/supabase-js';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
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

  button, a {
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

  .back-btn {
    background: #e2e8f0;
    color: #2d3748;

    &:hover {
      background: #cbd5e0;
    }
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

    button, a {
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

const ViewBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      <PageContainer className="container">
        <LoadingSpinner>
          <p>Loading blog...</p>
        </LoadingSpinner>
      </PageContainer>
    );
  }

  if (error || !blog) {
    return (
      <PageContainer className="container">
        <ErrorMessage>{error || 'Blog not found'}</ErrorMessage>
        <button className="back-btn" onClick={() => navigate('/blogs')}>
          ← Back to Blogs
        </button>
      </PageContainer>
    );
  }

  const createdDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageContainer className="container">
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
          <button className="back-btn" onClick={() => navigate('/blogs')}>
            ← Back to Blogs
          </button>
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
      </BlogContent>
    </PageContainer>
  );
};

export default ViewBlog;
