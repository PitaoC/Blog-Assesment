import React, { useState } from 'react';
import styled from 'styled-components';
import ConfirmDialog from './ConfirmDialog';
import { supabase } from '../utils/supabase';

export interface CommentData {
  id: string;
  author?: string;
  author_name?: string;
  author_id?: string;
  content: string;
  image_url?: string;
  created_at: string;
}

const CommentWrapper = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 3px solid #5a67d8;
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
  position: relative;
  overflow: hidden;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .author-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 14px;
  }

  .comment-date {
    color: #a0aec0;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const CommentText = styled.p`
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  word-break: break-word;
`;

const CommentImage = styled.img`
  max-width: 100%;
  height: auto;
  max-height: 250px;
  border-radius: 6px;
  margin-top: 10px;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;

  button {
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      color: #5a67d8;
    }

    &.delete-btn:hover {
      color: #f56565;
    }
  }
`;

const ImageUploadBtn = styled.button`
  background: #5a67d8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #4c51bf;
  }
`;

const EditImagePreview = styled.div`
  margin-top: 8px;
  position: relative;
  display: inline-block;

  img {
    max-height: 120px;
    max-width: 180px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }
`;

const RemoveEditImageBtn = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56565;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #e53e3e;
  }
`;

interface CommentProps {
  comment: CommentData;
  currentUserId?: string;
  onDelete?: (commentId: string) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
}

const Comment: React.FC<CommentProps> = ({ comment, currentUserId, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [currentEditImageUrl, setCurrentEditImageUrl] = useState<string | null>(null);

  const getDisplayAuthor = () => {
    const name = comment.author || comment.author_name;
    if (!name) return 'Anonymous User';
    return name;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AN';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleDelete = async () => {
    if (isDeleting || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
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

  const handleEditSave = async () => {
    if (isSaving || !onEdit) return;
    setIsSaving(true);
    try {
      let imageUrl = currentEditImageUrl;

      // Upload new image if provided
      if (editImageFile) {
        imageUrl = await uploadCommentImage(editImageFile);
      }

      // Update comment with text and image
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: editedContent.trim() || '',
          image_url: imageUrl 
        })
        .eq('id', comment.id);

      if (error) throw error;

      // Update local state to reflect changes
      comment.content = editedContent.trim() || '';
      comment.image_url = imageUrl || undefined;
      
      setIsEditing(false);
      setEditImageFile(null);
      setEditImagePreview(null);
      setCurrentEditImageUrl(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditedContent(comment.content);
    setEditImageFile(null);
    setEditImagePreview(null);
    setCurrentEditImageUrl(comment.image_url || null);
    setIsEditing(false);
  };

  const displayAuthor = getDisplayAuthor();
  const isAnonymous = !displayAuthor || displayAuthor.toLowerCase() === 'anonymous user' || displayAuthor.toLowerCase() === 'anonymous';

  return (
    <>
      <CommentWrapper>
      <AvatarPlaceholder>
        {!isAnonymous ? (
          getInitials(displayAuthor)
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
      <CommentContent>
        <CommentHeader>
          <span className="author-name">{isAnonymous ? 'Anonymous User' : displayAuthor}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </CommentHeader>
        {isEditing ? (
          <>
            <textarea
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              disabled={isSaving}
            />
            <ImageUploadBtn
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: Event) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    setEditImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setEditImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }}
              disabled={isSaving}
            >
              {editImageFile ? '📷 Change Image' : comment.image_url ? '📷 Replace Image' : '📷 Add Image'}
            </ImageUploadBtn>
            {(editImagePreview || currentEditImageUrl) && (
              <EditImagePreview>
                <img src={editImagePreview || currentEditImageUrl || ''} alt="Preview" />
                <RemoveEditImageBtn
                  type="button"
                  onClick={() => {
                    setEditImageFile(null);
                    setEditImagePreview(null);
                    setCurrentEditImageUrl(null);
                  }}
                  disabled={isSaving}
                >
                  ✕
                </RemoveEditImageBtn>
              </EditImagePreview>
            )}
            <CommentActions>
              <button
                onClick={handleEditSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleEditCancel} disabled={isSaving}>
                Cancel
              </button>
            </CommentActions>
          </>
        ) : (
          <>
            <CommentText>{comment.content}</CommentText>
            {comment.image_url && (
              <CommentImage src={comment.image_url} alt="Comment attachment" />
            )}
            {currentUserId && currentUserId === comment.author_id && (
              <CommentActions>
                <button onClick={() => {
                  setIsEditing(true);
                  setCurrentEditImageUrl(comment.image_url || null);
                  setEditImagePreview(comment.image_url || null);
                }}>Edit</button>
                <button className="delete-btn" onClick={handleDeleteClick} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </CommentActions>
            )}
          </>
        )}
      </CommentContent>
    </CommentWrapper>
    {showDeleteConfirm && (
      <ConfirmDialog
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    )}
    </>
  );
};

export default Comment;
