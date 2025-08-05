import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { getCauseCommentCount } from './CommentsPage';
import { getCauseCommentPreview, addCommentsForCauseScore } from './sample-comments-data';
import { getRankIcon } from './leaderboard-helpers';
import { CauseScoreEntry } from './leaderboard-types';

interface CauseScoreCardProps {
  cause: string;
  points: number;
  index: number;
  isPlayerCause: boolean;
  onNavigateToCauseComments?: (causeScoreEntry: CauseScoreEntry) => void;
}

export function CauseScoreCard({ cause, points, index, isPlayerCause, onNavigateToCauseComments }: CauseScoreCardProps) {
  const causeTimestamp = Date.now() - (index * 3600000); // Staggered timestamps
  
  // Add sample comments for this cause score with random chance
  if (Math.random() < 0.4) {
    const commentCount = Math.floor(Math.random() * 3) + 1;
    addCommentsForCauseScore(cause, points, index + 1, causeTimestamp, commentCount);
  }

  return (
    <Card 
      key={cause} 
      className={`p-3 transition-all ${
        isPlayerCause 
          ? 'bg-green-50 border-2 border-green-300 shadow-md' 
          : 'hover:shadow-md'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getRankIcon(index + 1)}
            <span className="font-bold text-lg text-gray-800">#{index + 1}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {/* Left Side - Cause Name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`font-medium text-sm break-words ${isPlayerCause ? 'text-green-800' : 'text-gray-800'}`}>
                    {cause}
                  </span>
                  {isPlayerCause && (
                    <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs">
                      Your Cause
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Side - Points */}
            <div className="text-right ml-4 min-w-0 flex-shrink-0">
              <div className="font-bold text-3xl text-blue-600 font-boogaloo leading-none">
                {points.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                points
              </div>
            </div>
          </div>
        </div>
        
        {/* Horizontal Divider */}
        <Separator className="my-1" />
        
        {/* Comment Section - Entire Row Clickable */}
        <div 
          className={`flex items-center gap-2 text-xs p-1 rounded transition-colors ${
            onNavigateToCauseComments 
              ? 'cursor-pointer hover:bg-blue-50 hover:shadow-sm' 
              : ''
          }`}
          onClick={onNavigateToCauseComments ? () => onNavigateToCauseComments({
            cause: cause,
            score: points,
            rank: index + 1,
            timestamp: causeTimestamp
          }) : undefined}
        >
          <MessageCircle className="w-3 h-3 text-gray-400" />
          <span className="font-boogaloo text-gray-600">
            {getCauseCommentCount(cause, points, index + 1, causeTimestamp) || 0} comments
          </span>
          
          {/* Comment Summary - Same Line */}
          {(() => {
            const commentInfo = getCauseCommentPreview(cause, points, index + 1, causeTimestamp);
            if (commentInfo) {
              return (
                <span className="text-gray-400 italic truncate flex-1">
                  {commentInfo.preview}
                </span>
              );
            } else {
              return (
                <span className="text-gray-400 italic">
                  No comments yet
                </span>
              );
            }
          })()}
        </div>
      </div>
    </Card>
  );
}