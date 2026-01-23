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

const ImagePreviewContainer = styled.div`
  margin-top: 15px;
  text-align: center;

  img {
    max-width: 300px;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    object-fit: cover;
    display: block;
    margin: 0 auto;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RemoveImageBtn = styled.button`
  background: rgba(82, 82, 82, 0.9);
  color: white;
  padding: 4px 8px;
  font-size: 16px;
  border-radius: 4px;
  border: none;
  transition: all 0.3s ease;
  opacity: 0.7;
  cursor: pointer;
  margin-left: 10px;
  vertical-align: middle;

  &:hover {
    opacity: 1;
    background: rgba(220, 38, 38, 0.95);
    transform: scale(1.1);
  }
`;

const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      const { data } = await supabase.from('blogs').select('*').eq('id', id).single();
      if (data) {
        setTitle(data.title);
        setContent(data.content);
        if (data.image_url) {
          setCurrentImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      }
    };
    fetchBlog();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setUploading(true);
    let imageUrl = currentImageUrl;

    try {
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(`${fileName}`, image);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          setUploading(false);
          return;
        }
        const { data: publicData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(`${fileName}`);

        imageUrl = publicData.publicUrl;
      }

      const { data, error } = await supabase
        .from('blogs')
        .update({ 
          title, 
          content, 
          image_url: imageUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) {
        dispatch(updateBlog(data));
        navigate('/blogs');
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUploading(false);
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
            <label>Blog Image</label>
            <ImageUploadLabel>
              📸 {image ? 'Change Image' : currentImageUrl ? 'Replace Image' : 'Upload Image'}
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
            {(image || currentImageUrl) && (
              <ImageFileName>
                <span>{image ? `New image: ${image.name}` : 'Current image'}</span>
                <RemoveImageBtn
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview('');
                    setCurrentImageUrl('');
                  }}
                >
                  🗑️
                </RemoveImageBtn>
              </ImageFileName>
            )}
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
              placeholder="Edit your story here..."
              rows={15}
              required
              style={{ resize: 'vertical', minHeight: '400px' }}
            />
          </FormGroup>
          <ButtonGroup>
            <SubmitBtn type="submit" disabled={uploading}>
              {uploading ? 'Updating...' : 'Update Blog'}
            </SubmitBtn>
            <CancelBtn type="button" onClick={() => navigate('/blogs')}>Cancel</CancelBtn>
          </ButtonGroup>
        </Form>
      </FormCard>
    </div>
  );
};

export default EditBlog;