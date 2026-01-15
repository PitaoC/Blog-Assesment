import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addBlog } from '../store/slices/blogsSlice';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 500px;
`;

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('blogs')
      .insert({ title, content, author_id: user.id })
      .select()
      .single();
    if (!error && data) {
      dispatch(addBlog(data));
      navigate('/blogs');
    }
  };

  return (
    <div>
      <h1>Create Blog</h1>
      <Form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          rows={10}
          required
        />
        <button type="submit">Create</button>
      </Form>
    </div>
  );
};

export default CreateBlog;