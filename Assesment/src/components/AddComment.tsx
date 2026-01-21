import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabase';

const AddCommentWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
`;

const CommentInputSection = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const InputContainer = styled.div`
  flex: 1;
`;

const CommentInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #5a67d8;
    box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }

  @media (max-width: 480px) {
    min-height: 60px;
    font-size: 13px;
    padding: 10px;
  }
`;

const ToolbarSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  height: 36px;
  width: 36px;
  min-width: 36px;

  &:hover {
    background: #edf2f7;
    border-color: #cbd5e0;
  }

  &:active {
    background: #e2e8f0;
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    height: 32px;
    width: 32px;
    font-size: 14px;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ImagePreviewContainer = styled.div`
  margin-top: 12px;
  position: relative;
  display: inline-block;
`;

const ImagePreview = styled.img`
  max-height: 150px;
  max-width: 200px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
`;

const RemoveImageBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #e53e3e;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: stretch;

    button {
      flex: 1;
    }
  }
`;

const SubmitBtn = styled.button`
  background: linear-gradient(135deg, #5a67d8 0%, #4c51bf 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(90, 103, 216, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const CancelBtn = styled.button`
  background: #e2e8f0;
  color: #2d3748;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: #cbd5e0;
  }

  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 13px;
  }
`;

const EmojiPicker = styled.div`
  position: absolute;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const EmojiOption = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7fafc;
    transform: scale(1.2);
  }
`;

interface AddCommentProps {
  blogId: string;
  userName?: string;
  userId?: string;
  onCommentAdd?: () => void;
  isLoading?: boolean;
}

const EMOJIS = ['😀', '😂', '❤️', '😍', '🎉', '👍', '🔥', '💯', '✨', '🙌', '😢', '🤔'];

const AddComment: React.FC<AddCommentProps> = ({
  blogId,
  userName = 'Anonymous User',
  userId,
  onCommentAdd,
  isLoading = false,
}) => {
  const [commentText, setCommentText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCommentImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { data, error } = await supabase.storage
        .from('comment-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('comment-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadCommentImage(imageFile);
      }

      const { error } = await supabase.from('comments').insert([
        {
          blog_id: blogId,
          author_id: userId || null,
          author_name: userName,
          content: commentText.trim(),
          image_url: imageUrl,
        },
      ]);

      if (error) throw error;

      setCommentText('');
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onCommentAdd?.();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCommentText('');
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AddCommentWrapper>
      <CommentInputSection>
        <AvatarPlaceholder>
          {userName && userName !== 'Anonymous User' ? (
            getInitials(userName)
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          )}
        </AvatarPlaceholder>
        <InputContainer>
          <CommentInput
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isLoading}
          />
        </InputContainer>
      </CommentInputSection>

      <ToolbarSection>
        <div style={{ position: 'relative' }}>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            title="Add image"
            disabled={isLoading}
          >
            🖼️
          </IconButton>
          <FileInput ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div style={{ position: 'relative' }}>
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
            disabled={isLoading}
          >
            😊
          </IconButton>
          {showEmojiPicker && (
            <EmojiPicker ref={emojiPickerRef}>
              {EMOJIS.map((emoji) => (
                <EmojiOption
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  type="button"
                >
                  {emoji}
                </EmojiOption>
              ))}
            </EmojiPicker>
          )}
        </div>
      </ToolbarSection>

      {imagePreview && (
        <ImagePreviewContainer>
          <ImagePreview src={imagePreview} alt="Preview" />
          <RemoveImageBtn onClick={handleRemoveImage} disabled={isLoading}>
            ✕
          </RemoveImageBtn>
        </ImagePreviewContainer>
      )}

      <ButtonGroup>
        <CancelBtn onClick={handleCancel} disabled={isLoading}>
          Cancel
        </CancelBtn>
        <SubmitBtn
          onClick={handleSubmit}
          disabled={!commentText.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </SubmitBtn>
      </ButtonGroup>
    </AddCommentWrapper>
  );
};

export default AddComment;
