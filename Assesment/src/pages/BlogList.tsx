import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchBlogs, setPage } from '../store/slices/blogsSlice';
import styled from 'styled-components';

const BlogItem = styled.div`
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const BlogList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error, currentPage, totalPages, hasMore } = useSelector((state: RootState) => state.blogs);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchBlogs({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleNextPage = () => {
    if (hasMore) {
      dispatch(setPage(currentPage + 1));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(setPage(currentPage - 1));
    }
  };

  return (
    <div>
      <h1>Blogs</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      {list.map((blog) => (
        <BlogItem key={blog.id}>
          <h2>{blog.title}</h2>
          <p>{blog.content.substring(0, 100)}...</p>
          <small>By {blog.author_id} on {new Date(blog.created_at).toLocaleDateString()}</small>
          {user && user.id === blog.author_id && (
            <div>
              <Link to={`/blogs/${blog.id}/edit`}>Edit</Link>
            </div>
          )}
        </BlogItem>
      ))}
      <Controls>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={!hasMore}>Next</button>
      </Controls>
    </div>
  );
};

export default BlogList;