import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ArrowLeft, MessageCircle, Send, User, Reply, X } from 'lucide-react';
import { initializeSampleComments } from './sample-comments-data';
import { HighScoreEntry, CauseScoreEntry } from './leaderboard-types';

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  playerName?: string;
  playerImage?: string;
  replies?: Comment[];
  parentId?: string;
}

interface CommentsPageProps {
  onBackToLeaderboard: () => void;
  highScoreEntry?: HighScoreEntry;
  causeScoreEntry?: CauseScoreEntry;
}

const PLAYER_NAME_STORAGE_KEY = 'poke-n-pork-player-name';
const PLAYER_IMAGE_STORAGE_KEY = 'poke-n-pork-player-image';

export function CommentsPage({ onBackToLeaderboard, highScoreEntry, causeScoreEntry }: CommentsPageProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [playerProfile, setPlayerProfile] = useState<{name: string, image: string} | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Determine if this is a high score or cause score
  const isHighScore = !!highScoreEntry;
  const isCauseScore = !!causeScoreEntry;
  
  // Safety check - ensure we have at least one entry
  if (!isHighScore && !isCauseScore) {
    return (
      <div className="min-h-screen font-boogaloo">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={onBackToLeaderboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 font-boogaloo"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Leaderboard
            </Button>
          </div>

          {/* Centered Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-boogaloo text-gray-800">
              Comments & Discussion
            </h1>
          </div>

          <div className="text-center">
            <p className="text-xl font-boogaloo text-gray-600">
              No score data available. Please go back to the leaderboard.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Generate a unique key for this entry
  const entryKey = isHighScore 
    ? `${highScoreEntry?.level || 0}-${highScoreEntry?.score || 0}-${highScoreEntry?.timestamp || 0}`
    : `${causeScoreEntry?.cause || 'unknown'}-${causeScoreEntry?.score || 0}-${causeScoreEntry?.rank || 0}-${causeScoreEntry?.timestamp || 0}`;
  
  // Use different storage keys for different types of comments
  const COMMENTS_STORAGE_KEY = isHighScore ? 'poke-n-pork-comments' : 'poke-n-pork-cause-comments';

  // Initialize sample comments and load player profile
  useEffect(() => {
    // Initialize sample comments if they don't exist
    initializeSampleComments();
    
    try {
      // Load player name and image from localStorage using same keys as ProfilePage
      const savedPlayerName = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
      const savedPlayerImage = localStorage.getItem(PLAYER_IMAGE_STORAGE_KEY);
      
      const playerName = savedPlayerName || 'Anonymous';
      const playerImage = savedPlayerImage || '👤';
      
      setPlayerProfile({ name: playerName, image: playerImage });
    } catch (error) {
      console.warn('Failed to load player profile:', error);
    }
  }, []);

  // Load comments for this entry
  useEffect(() => {
    try {
      const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (savedComments) {
        const allComments = JSON.parse(savedComments);
        const entryComments = allComments[entryKey] || [];
        setComments(entryComments.sort((a: Comment, b: Comment) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.warn('Failed to load comments:', error);
    }
  }, [entryKey, COMMENTS_STORAGE_KEY]);

  const saveComments = (updatedComments: Comment[]) => {
    try {
      const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
      const allComments = savedComments ? JSON.parse(savedComments) : {};
      allComments[entryKey] = updatedComments;
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
    } catch (error) {
      console.warn('Failed to save comments:', error);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !playerProfile?.name) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: playerProfile.name,
      text: newComment.trim(),
      timestamp: Date.now(),
      playerName: playerProfile.name,
      playerImage: playerProfile.image,
      replies: []
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    saveComments(updatedComments);
    setNewComment('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim() || !playerProfile?.name) return;

    const reply: Comment = {
      id: Date.now().toString(),
      author: playerProfile.name,
      text: replyText.trim(),
      timestamp: Date.now(),
      playerName: playerProfile.name,
      playerImage: playerProfile.image,
      parentId: parentId,
      replies: []
    };

    const updatedComments = comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply].sort((a, b) => a.timestamp - b.timestamp)
        };
      }
      return comment;
    });

    setComments(updatedComments);
    saveComments(updatedComments);
    setReplyText('');
    setReplyingTo(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCommentCount = () => {
    try {
      const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (savedComments) {
        const allComments = JSON.parse(savedComments);
        const entryComments = allComments[entryKey] || [];
        let totalCount = entryComments.length;
        
        // Count replies too
        entryComments.forEach((comment: Comment) => {
          if (comment.replies) {
            totalCount += comment.replies.length;
          }
        });
        
        return totalCount;
      }
    } catch (error) {
      console.warn('Failed to get comment count:', error);
    }
    return 0;
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <Card key={comment.id} className={`p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 ${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300 flex-shrink-0`}>
          <span className={isReply ? 'text-sm' : 'text-lg'}>{comment.playerImage || '👤'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`font-boogaloo ${isReply ? 'text-base' : 'text-lg'} text-gray-800`}>
              {comment.author}
            </h4>
            <span className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-500`}>
              {formatDate(comment.timestamp)}
            </span>
            {isReply && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-boogaloo">
                Reply
              </span>
            )}
          </div>
          <p className={`text-gray-700 font-boogaloo leading-relaxed ${isReply ? 'text-sm' : ''}`}>
            {comment.text}
          </p>
          {!isReply && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs font-boogaloo text-gray-600 hover:text-blue-600 h-auto p-1"
              >
                <Reply className="w-3 h-3 mr-1" />
                {replyingTo === comment.id ? 'Cancel' : 'Reply'}
              </Button>
              {comment.replies && comment.replies.length > 0 && (
                <span className="text-xs text-gray-500 font-boogaloo">
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="mt-4 ml-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Reply className="w-4 h-4 text-blue-600" />
            <span className="font-boogaloo text-sm text-blue-800">
              Replying to {comment.author}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="ml-auto h-auto p-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-3">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${comment.author}...`}
              rows={3}
              className="font-boogaloo resize-none text-sm"
              maxLength={300}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {replyText.length}/300 characters
              </div>
              <Button
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyText.trim()}
                size="sm"
                className="font-boogaloo bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-3 h-3 mr-1" />
                Post Reply
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen font-boogaloo">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={onBackToLeaderboard}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 font-boogaloo"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Button>
        </div>

        {/* Centered Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-boogaloo text-gray-800">
            Comments & Discussion
          </h1>
        </div>

        {/* Score Summary */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-2 border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-3 border-pink-300">
                <span className="text-3xl">
                  {isHighScore ? (highScoreEntry?.playerImage || '👤') : '🎯'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-boogaloo text-gray-800">
                  {isHighScore ? highScoreEntry?.playerName : causeScoreEntry?.cause}
                </h2>
                <p className="text-lg text-gray-600 font-boogaloo">
                  {isHighScore 
                    ? `Level ${highScoreEntry?.level} High Score`
                    : `Cause Rank #${causeScoreEntry?.rank}`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-boogaloo text-blue-600">
                {(isHighScore ? highScoreEntry?.score : causeScoreEntry?.score)?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {isHighScore ? highScoreEntry?.cause : 'Worldwide Points'}
              </div>
            </div>
          </div>
        </Card>

        {/* Add Comment Section */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-2 border-blue-200">
          <h3 className="text-2xl font-boogaloo text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            {playerProfile?.name ? `${playerProfile.name} - Add Your Comment` : 'Add Your Comment'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-boogaloo text-gray-700 mb-2">
                Your Comment:
              </label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isHighScore 
                  ? "Share your thoughts about this high score..." 
                  : "Share your thoughts about this cause..."
                }
                rows={4}
                className="font-boogaloo resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {newComment.length}/500 characters
              </div>
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !playerProfile?.name}
              className="flex items-center gap-2 font-boogaloo bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
              Post Comment
            </Button>
          </div>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          <h3 className="text-2xl font-boogaloo text-gray-800 mb-4">
            Comments ({getCommentCount()})
          </h3>
          
          {comments.length === 0 ? (
            <Card className="p-8 bg-white/60 backdrop-blur-sm border-2 border-gray-200">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-boogaloo">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            </Card>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get comment count for a high score entry
export function getCommentCount(level: number, score: number, timestamp: number): number {
  try {
    const entryKey = `${level}-${score}-${timestamp}`;
    const savedComments = localStorage.getItem('poke-n-pork-comments');
    if (savedComments) {
      const allComments = JSON.parse(savedComments);
      const entryComments = allComments[entryKey] || [];
      let totalCount = entryComments.length;
      
      // Count replies too
      entryComments.forEach((comment: Comment) => {
        if (comment.replies) {
          totalCount += comment.replies.length;
        }
      });
      
      return totalCount;
    }
  } catch (error) {
    console.warn('Failed to get comment count:', error);
  }
  return 0;
}

// Helper function to get comment count for a cause score entry
export function getCauseCommentCount(cause: string, score: number, rank: number, timestamp: number): number {
  try {
    const entryKey = `${cause}-${score}-${rank}-${timestamp}`;
    const savedComments = localStorage.getItem('poke-n-pork-cause-comments');
    if (savedComments) {
      const allComments = JSON.parse(savedComments);
      const entryComments = allComments[entryKey] || [];
      let totalCount = entryComments.length;
      
      // Count replies too
      entryComments.forEach((comment: Comment) => {
        if (comment.replies) {
          totalCount += comment.replies.length;
        }
      });
      
      return totalCount;
    }
  } catch (error) {
    console.warn('Failed to get cause comment count:', error);
  }
  return 0;
}