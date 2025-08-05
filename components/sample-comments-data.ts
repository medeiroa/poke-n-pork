import { examplePlayerProfiles } from './leaderboard-constants';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  playerName?: string;
  playerImage?: string;
  replies?: Comment[];
  parentId?: string;
}

// Sample comment texts that feel authentic to the game
const sampleCommentTexts = [
  "Amazing score! How did you manage to catch so many senators at that level?",
  "This is insane! I can barely get past 2000 points on level 3 😭",
  "Respect for supporting this cause! Every point counts! 🎯",
  "That's some serious pig-catching skills right there!",
  "I've been trying to beat this score for weeks... any tips?",
  "Epic run! The way you handled those bouncing senators was perfect",
  "This score is absolutely unreal! Well done! 🏆",
  "Supporting this cause while dominating the leaderboard - love it!",
  "How many hours of practice did this take? Incredible dedication!",
  "The pork pieces must have been flying everywhere! Great job!",
  "This is what peak performance looks like! 🔥",
  "Legendary score! You make it look so easy",
  "I'm taking notes on your strategy. This is masterful!",
  "The senators didn't know what hit them! Outstanding work!",
  "This level is so hard and you crushed it! Inspiration right here",
  "Absolutely demolished this level! The cause thanks you! 💪",
  "Pure skill on display here. Respect! 🎮",
  "This score will take forever to beat. Amazing achievement!",
  "You turned those bouncing pigs into points like a pro!",
  "Incredible dedication to both the game and the cause! 🌟",
  "The way you handled the difficulty scaling was perfect",
  "This is what happens when skill meets determination!",
  "Every senator caught was for a good cause. Beautiful work!",
  "Level mastery at its finest! This is art! 🎨",
  "The leaderboard will remember this score for ages!"
];

// Sample comment texts specifically for cause scores
const sampleCauseCommentTexts = [
  "This cause really deserves all the support it's getting! 🌟",
  "So proud to see this humanitarian effort leading the charts!",
  "The community is really rallying behind this important cause! 💪",
  "Every point here makes a real difference in the world! 🌍",
  "Amazing to see this cause getting so much attention!",
  "This is what gaming for good looks like! 🎮❤️",
  "The impact of all these points is going to be incredible!",
  "Love seeing players unite for such an important cause!",
  "This cause has always been close to my heart. Great work everyone!",
  "The dedication to this humanitarian effort is inspiring! ✨",
  "Fantastic to see gamers making a real-world difference!",
  "This cause needs all the support it can get. Well done!",
  "The global impact of this initiative will be amazing! 🌎",
  "So many lives will be changed by this effort! 💝",
  "This is why I love this game - real causes, real impact!",
  "The leaderboard shows what matters most to our community! 🏆",
  "Every pork piece caught for this cause counts! 🐷",
  "This humanitarian effort deserves to be #1! 👑",
  "Amazing how gaming can drive real change in the world!",
  "The commitment to this cause is absolutely beautiful! 🌈",
  "This is proof that games can change the world! 🔥",
  "So many people will benefit from this incredible effort!",
  "The passion for this cause in our community is amazing!",
  "This cause represents the best of humanity! 🕊️",
  "Gaming for good has never looked better than this! ⭐"
];

// Sample reply texts for responses to comments
const sampleReplyTexts = [
  "Thanks! I practiced the corner bounce technique for hours",
  "Totally agree! This level is brutal but so rewarding",
  "You'll get there! Keep practicing the timing",
  "The key is predicting where they'll bounce next",
  "Much appreciated! The cause is what keeps me motivated",
  "Right?! The physics make it so satisfying",
  "Thanks for the kind words! 🙏",
  "Exactly! It's all about the greater good",
  "Practice makes perfect! Don't give up",
  "The senators definitely put up a fight! 😄",
  "You're too kind! Just lucky timing I guess",
  "Thanks! Always happy to help the cause",
  "The bouncing patterns are everything!",
  "Appreciate it! Every point counts for change",
  "You got this! Keep pushing those boundaries"
];

// Generate sample comments for high score entries
export const generateSampleCommentsData = () => {
  const commentsData: { [entryKey: string]: Comment[] } = {};
  
  // Create comments for levels 1-12 with various scenarios
  for (let level = 1; level <= 12; level++) {
    // Most levels will have 1-3 comments, some will have more, some none
    const commentCount = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 4) + 1;
    
    if (commentCount > 0) {
      // Create a mock high score entry key (these should match actual high scores when they exist)
      const mockScore = level * 1000 + Math.floor(Math.random() * 5000);
      const mockTimestamp = Date.now() - Math.floor(Math.random() * 30) * 86400000;
      const entryKey = `${level}-${mockScore}-${mockTimestamp}`;
      
      const comments: Comment[] = [];
      
      for (let i = 0; i < commentCount; i++) {
        const commenter = examplePlayerProfiles[Math.floor(Math.random() * examplePlayerProfiles.length)];
        const commentText = sampleCommentTexts[Math.floor(Math.random() * sampleCommentTexts.length)];
        const commentAge = Math.floor(Math.random() * 7 * 86400000); // Up to 7 days ago
        
        const comment: Comment = {
          id: `${entryKey}-comment-${i}`,
          author: commenter.name,
          text: commentText,
          timestamp: Date.now() - commentAge,
          playerName: commenter.name,
          playerImage: commenter.image,
          replies: []
        };

        // 30% chance to add 1-2 replies to this comment
        if (Math.random() < 0.3) {
          const replyCount = Math.floor(Math.random() * 2) + 1;
          for (let j = 0; j < replyCount; j++) {
            const replier = examplePlayerProfiles[Math.floor(Math.random() * examplePlayerProfiles.length)];
            const replyText = sampleReplyTexts[Math.floor(Math.random() * sampleReplyTexts.length)];
            const replyAge = Math.floor(Math.random() * 5 * 86400000); // Up to 5 days ago (replies are more recent)
            
            comment.replies!.push({
              id: `${entryKey}-comment-${i}-reply-${j}`,
              author: replier.name,
              text: replyText,
              timestamp: Date.now() - replyAge,
              playerName: replier.name,
              playerImage: replier.image,
              parentId: comment.id,
              replies: []
            });
          }
          
          // Sort replies by timestamp (oldest first for natural conversation flow)
          comment.replies!.sort((a, b) => a.timestamp - b.timestamp);
        }

        comments.push(comment);
      }
      
      // Sort comments by timestamp (newest first)
      comments.sort((a, b) => b.timestamp - a.timestamp);
      commentsData[entryKey] = comments;
    }
  }
  
  return commentsData;
};

// Function to populate sample comments in localStorage (called once on app init)
export const initializeSampleComments = () => {
  const COMMENTS_STORAGE_KEY = 'poke-n-pork-comments';
  
  try {
    // Only initialize if no comments exist yet
    const existingComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!existingComments) {
      const sampleData = generateSampleCommentsData();
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(sampleData));
      console.log('Sample comments initialized');
    }
  } catch (error) {
    console.warn('Failed to initialize sample comments:', error);
  }
};

// Create comments for existing high score entries
export const addCommentsForHighScore = (level: number, score: number, timestamp: number, commentCount: number = 1) => {
  const COMMENTS_STORAGE_KEY = 'poke-n-pork-comments';
  const entryKey = `${level}-${score}-${timestamp}`;
  
  try {
    const existingComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const allComments = existingComments ? JSON.parse(existingComments) : {};
    
    // Don't overwrite existing comments
    if (allComments[entryKey]) {
      return;
    }
    
    const comments: Comment[] = [];
    
    for (let i = 0; i < commentCount; i++) {
      const commenter = examplePlayerProfiles[Math.floor(Math.random() * examplePlayerProfiles.length)];
      const commentText = sampleCommentTexts[Math.floor(Math.random() * sampleCommentTexts.length)];
      const commentAge = Math.floor(Math.random() * 7 * 86400000); // Up to 7 days ago
      
      comments.push({
        id: `${entryKey}-comment-${i}`,
        author: commenter.name,
        text: commentText,
        timestamp: Date.now() - commentAge,
        playerName: commenter.name,
        playerImage: commenter.image,
        replies: []
      });
    }
    
    // Sort comments by timestamp (newest first)
    comments.sort((a, b) => b.timestamp - a.timestamp);
    allComments[entryKey] = comments;
    
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  } catch (error) {
    console.warn('Failed to add comments for high score:', error);
  }
};

// Function to get comment preview for a specific high score entry
export const getCommentPreview = (level: number, score: number, timestamp: number): { preview: string; count: number } | null => {
  const COMMENTS_STORAGE_KEY = 'poke-n-pork-comments';
  const entryKey = `${level}-${score}-${timestamp}`;
  
  try {
    const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedComments) {
      const allComments = JSON.parse(savedComments);
      const entryComments = allComments[entryKey] || [];
      
      if (entryComments.length > 0) {
        // Return the most recent comment text, truncated if needed
        const latestComment = entryComments[0];
        const preview = latestComment.text.length > 40 
          ? latestComment.text.substring(0, 37) + '...'
          : latestComment.text;
        
        return {
          preview: `"${preview}" - ${latestComment.author}`,
          count: entryComments.length
        };
      }
    }
  } catch (error) {
    console.warn('Failed to get comment preview:', error);
  }
  
  return null;
};

// Function to get the latest comment for any level (for level-based previews)
export const getLatestCommentForLevel = (level: number): { preview: string; count: number } | null => {
  const COMMENTS_STORAGE_KEY = 'poke-n-pork-comments';
  
  try {
    const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedComments) {
      const allComments = JSON.parse(savedComments);
      
      // Find all comment entries for this level
      let latestComment: Comment | null = null;
      let totalComments = 0;
      
      Object.keys(allComments).forEach(entryKey => {
        const [entryLevel] = entryKey.split('-');
        if (parseInt(entryLevel) === level) {
          const comments = allComments[entryKey] || [];
          totalComments += comments.length;
          
          // Find the most recent comment across all entries for this level
          comments.forEach((comment: Comment) => {
            if (!latestComment || comment.timestamp > latestComment.timestamp) {
              latestComment = comment;
            }
          });
        }
      });
      
      if (latestComment && totalComments > 0) {
        const preview = latestComment.text.length > 40 
          ? latestComment.text.substring(0, 37) + '...'
          : latestComment.text;
        
        return {
          preview: `"${preview}" - ${latestComment.author}`,
          count: totalComments
        };
      }
    }
  } catch (error) {
    console.warn('Failed to get latest comment for level:', error);
  }
  
  return null;
};

// Create comments for cause score entries
export const addCommentsForCauseScore = (cause: string, score: number, rank: number, timestamp: number, commentCount: number = 1) => {
  const COMMENTS_STORAGE_KEY = 'poke-n-pork-cause-comments';
  const entryKey = `${cause}-${score}-${rank}-${timestamp}`;
  
  try {
    const existingComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const allComments = existingComments ? JSON.parse(existingComments) : {};
    
    // Don't overwrite existing comments
    if (allComments[entryKey]) {
      return;
    }
    
    const comments: Comment[] = [];
    
    for (let i = 0; i < commentCount; i++) {
      const commenter = examplePlayerProfiles[Math.floor(Math.random() * examplePlayerProfiles.length)];
      const commentText = sampleCauseCommentTexts[Math.floor(Math.random() * sampleCauseCommentTexts.length)];
      const commentAge = Math.floor(Math.random() * 7 * 86400000); // Up to 7 days ago
      
      comments.push({
        id: `${entryKey}-comment-${i}`,
        author: commenter.name,
        text: commentText,
        timestamp: Date.now() - commentAge,
        playerName: commenter.name,
        playerImage: commenter.image,
        replies: []
      });
    }
    
    // Sort comments by timestamp (newest first)
    comments.sort((a, b) => b.timestamp - a.timestamp);
    allComments[entryKey] = comments;
    
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  } catch (error) {
    console.warn('Failed to add comments for cause score:', error);
  }
};

// Function to get comment preview for a specific cause score entry
export const getCauseCommentPreview = (cause: string, score: number, rank: number, timestamp: number): { preview: string; count: number } | null => {
  const COMMENTS_STORAGE_KEY = 'poke-n-pork-cause-comments';
  const entryKey = `${cause}-${score}-${rank}-${timestamp}`;
  
  try {
    const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedComments) {
      const allComments = JSON.parse(savedComments);
      const entryComments = allComments[entryKey] || [];
      
      if (entryComments.length > 0) {
        // Return the most recent comment text, truncated if needed
        const latestComment = entryComments[0];
        const preview = latestComment.text.length > 40 
          ? latestComment.text.substring(0, 37) + '...'
          : latestComment.text;
        
        return {
          preview: `"${preview}" - ${latestComment.author}`,
          count: entryComments.length
        };
      }
    }
  } catch (error) {
    console.warn('Failed to get cause comment preview:', error);
  }
  
  return null;
};