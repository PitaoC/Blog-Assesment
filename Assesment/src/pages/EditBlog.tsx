import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateBlog } from '../store/slices/blogsSlice';
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

const FormCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 40px;
  border: 1px solid rgba(0,0,0,0.05);
  max-width: 700px;

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 8px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;

  @media (max-width: 480px) {
    gap: 20px;
  }
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

  @media (max-width: 768px) {
    label {
      font-size: 15px;
    }
  }

  @media (max-width: 480px) {
    gap: 8px;

    label {
      font-size: 14px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 10px;

    button {
      flex: 1;
      min-width: 100px;
    }
  }
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.25);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(66, 153, 225, 0.35);
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const CancelBtn = styled.button`
  background: #cbd5e0;
  color: #2d3748;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover {
    background: #a0aec0;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 15px;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      const { data } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
    };
    fetchBlog();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const { data, error } = await supabase
      .from('blogs')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      dispatch(updateBlog(data));
      navigate('/blogs');
    }
  };

  return (
    <div className="container">
      <PageHeader>
        <h1>Edit Your Story</h1>
        <p>Update your blog post</p>
      </PageHeader>
      <FormCard>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="title">Blog Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edit your story here..."
              rows={15}
              required
              style={{ resize: 'vertical', minHeight: '400px' }}
            />
          </FormGroup>
          <ButtonGroup>
            <SubmitBtn type="submit">Update Blog</SubmitBtn>
            <CancelBtn type="button" onClick={() => navigate('/blogs')}>Cancel</CancelBtn>
          </ButtonGroup>
        </Form>
      </FormCard>
    </div>
  );
};

export default EditBlog;