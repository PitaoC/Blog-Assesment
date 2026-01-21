import React, { useState } from 'react';
import styled from 'styled-components';

export interface CommentData {
  id: string;
  author: string;
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
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsDeleting(true);
      try {
        await onDelete(comment.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditSave = async () => {
    if (isSaving || !onEdit || !editedContent.trim()) return;
    setIsSaving(true);
    try {
      await onEdit(comment.id, editedContent.trim());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  return (
    <CommentWrapper>
      <AvatarPlaceholder>
        {comment.author && comment.author !== 'Anonymous' ? (
          getInitials(comment.author)
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
          <span className="author-name">{comment.author || 'Anonymous'}</span>
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
            <CommentActions>
              <button
                onClick={handleEditSave}
                disabled={isSaving || !editedContent.trim()}
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
            {currentUserId && (
              <CommentActions>
                <button onClick={() => setIsEditing(true)}>Edit</button>
                <button className="delete-btn" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </CommentActions>
            )}
          </>
        )}
      </CommentContent>
    </CommentWrapper>
  );
};

export default Comment;
