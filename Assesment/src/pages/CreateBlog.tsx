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

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 15px;
  }

  @media (max-width: 480px) {
    width: 100%;
    align-self: stretch;
    padding: 12px 16px;
    font-size: 14px;
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

const ImagePreviewContainer = styled.div`
  margin-top: 15px;
  text-align: center;

  img {
    max-width: 300px;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    object-fit: cover;
  }
`;

const ImageUploadLabel = styled.label`
  display: inline-block;
  padding: 12px 20px;
  background: #5a67d8;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-bottom: 10px;

  &:hover {
    background: #4c51bf;
  }

  input[type='file'] {
    display: none;
  }

  @media (max-width: 480px) {
    width: 100%;
    text-align: center;
    display: block;
    padding: 12px 16px;
  }
`;

const ImageFileName = styled.div`
  color: #4a5568;
  font-size: 14px;
  margin-top: 8px;
  font-weight: 500;
`;

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
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

    setUploading(true);
    let imageUrl = '';

    try {
      // Upload image if provided
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(`${fileName}`, image);

        if (uploadError) {
          setError(`❌ Error uploading image: ${uploadError.message}`);
          setUploading(false);
          return;
        }

        // Get public URL
        const { data: publicData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(`${fileName}`);

        imageUrl = publicData.publicUrl;
      }

      // Insert blog with image URL (always include it, even if null)
      const { data, error: dbError } = await supabase
        .from('blogs')
        .insert({
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
          image_url: imageUrl || null
        })
        .select()
        .single();

      if (dbError) {
        setError(`❌ Error publishing blog: ${dbError.message}`);
        console.error('Database error:', dbError);
      } else if (data) {
        dispatch(addBlog(data));
        setSuccess('✓ Blog published successfully! Redirecting...');
        setTimeout(() => navigate('/blogs'), 1500);
      }
    } catch (err) {
      setError(`❌ An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
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
            <label>Blog Image (Optional)</label>
            <ImageUploadLabel>
              📸 Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </ImageUploadLabel>
            {image && <ImageFileName>Selected: {image.name}</ImageFileName>}
            {imagePreview && (
              <ImagePreviewContainer>
                <img src={imagePreview} alt="Preview" />
              </ImagePreviewContainer>
            )}
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
          <SubmitBtn type="submit" disabled={uploading}>
            {uploading ? 'Publishing...' : 'Publish Blog'}
          </SubmitBtn>
        </Form>
      </FormCard>
    </div>
  );
};

export default CreateBlog;