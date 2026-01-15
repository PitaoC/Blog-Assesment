import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setBlogs, removeBlog, setLoading, setError } from '../store/slices/blogsSlice';
import { Blog } from '../store/slices/blogsSlice';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const BlogItem = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const BlogList: React.FC = () => {
  const dispatch = useDispatch();
  const blogs = useSelector((state: RootState) => state.blogs.list);
  const user = useSelector((state: RootState) => state.auth.user as User | null);
  const [page, setPage] = useState(0);

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

  return (
    <div className="container">
      <h1>Blogs</h1>
      {blogs.map((blog: Blog) => (
        <BlogItem key={blog.id}>
          <h2>{blog.title}</h2>
          <p>{blog.content.substring(0, 100)}...</p>
          {user && user.id === blog.author_id && (
            <>
              <Link to={`/blogs/${blog.id}/edit`}>Edit</Link>
              <button onClick={() => handleDelete(blog.id)}>Delete</button>
            </>
          )}
        </BlogItem>
      ))}
      <button onClick={() => setPage(page - 1)} disabled={page === 0}>Prev</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
};

export default BlogList;