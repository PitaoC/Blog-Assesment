import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addBlog } from '../store/slices/blogsSlice';
import styled from 'styled-components';

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
`;

const FormCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 40px;
  border: 1px solid rgba(0,0,0,0.05);
  max-width: 700px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    font-weight: 600;
    color: #2d3748;
    font-size: 16px;
  }
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(72, 187, 120, 0.25);
  align-self: flex-start;
  margin-top: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(72, 187, 120, 0.35);
  }
`;

const ErrorAlert = styled.div`
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 16px;
  color: #c53030;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SuccessAlert = styled.div`
  background: #c6f6d5;
  border: 1px solid #9ae6b4;
  border-radius: 8px;
  padding: 16px;
  color: #22543d;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('❌ You must be logged in to publish a blog. Please log in to continue.');
      return;
    }

    if (!title.trim()) {
      setError('❌ Please enter a blog title.');
      return;
    }

    if (!content.trim()) {
      setError('❌ Please enter some content for your blog.');
      return;
    }

    const { data, error: dbError } = await supabase
      .from('blogs')
      .insert({ title, content, author_id: user.id })
      .select()
      .single();

    if (dbError) {
      setError(`❌ Error publishing blog: ${dbError.message}`);
    } else if (data) {
      dispatch(addBlog(data));
      setSuccess('✓ Blog published successfully! Redirecting...');
      setTimeout(() => navigate('/blogs'), 1500);
    }
  };

  return (
    <div className="container">
      <PageHeader>
        <h1>Share Your Story</h1>
        <p>Write and publish your own blog post</p>
      </PageHeader>
      <FormCard>
        {error && <ErrorAlert>{error}</ErrorAlert>}
        {success && <SuccessAlert>{success}</SuccessAlert>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="title">Blog Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title..."
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story here..."
              rows={15}
              required
              style={{ resize: 'vertical', minHeight: '400px' }}
            />
          </FormGroup>
          <SubmitBtn type="submit">Publish Blog</SubmitBtn>
        </Form>
      </FormCard>
    </div>
  );
};

export default CreateBlog;