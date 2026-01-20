import React from 'react';
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

interface CommentProps {
  comment: CommentData;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const getInitials = (name: string) => {
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

  return (
    <CommentWrapper>
      <AvatarPlaceholder>{getInitials(comment.author)}</AvatarPlaceholder>
      <CommentContent>
        <CommentHeader>
          <span className="author-name">{comment.author}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </CommentHeader>
        <CommentText>{comment.content}</CommentText>
        {comment.image_url && <CommentImage src={comment.image_url} alt="Comment attachment" />}
      </CommentContent>
    </CommentWrapper>
  );
};

export default Comment;
