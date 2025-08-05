import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Edit3, Save, X } from 'lucide-react';

interface ProfilePageProps {
  onBackToGame: () => void;
}

interface PersonalBest {
  score: number;
  agency: string;
  level: number;
  date: string;
}

export function ProfilePage({ onBackToGame }: ProfilePageProps) {
  const [playerName, setPlayerName] = useState('Anonymous');
  const [playerImage, setPlayerImage] = useState('👤');
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);

  // Load profile data and personal bests on component mount
  useEffect(() => {
    try {
      // Load profile data
      const savedPlayerName = localStorage.getItem('poke-n-pork-player-name');
      const savedPlayerImage = localStorage.getItem('poke-n-pork-player-image');
      
      if (savedPlayerName) {
        setPlayerName(savedPlayerName);
      } else {
        setPlayerName('Anonymous');
      }
      
      if (savedPlayerImage) {
        setPlayerImage(savedPlayerImage);
      } else {
        setPlayerImage('👤');
      }

      // Load personal best scores
      const savedPersonalBests = localStorage.getItem('poke-n-pork-personal-bests');
      if (savedPersonalBests) {
        const bests = JSON.parse(savedPersonalBests);
        if (Array.isArray(bests)) {
          setPersonalBests(bests);
        }
      }
    } catch (error) {
      console.warn('Failed to load profile data from localStorage:', error);
    }
  }, []);

  // Handle profile save - auto-save on change
  const handleNameChange = (newName: string) => {
    try {
      setPlayerName(newName);
      localStorage.setItem('poke-n-pork-player-name', newName);
    } catch (error) {
      console.warn('Failed to save player name to localStorage:', error);
    }
  };

  const handleImageChange = (newImage: string) => {
    try {
      setPlayerImage(newImage);
      localStorage.setItem('poke-n-pork-player-image', newImage);
    } catch (error) {
      console.warn('Failed to save player image to localStorage:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  // Get rank suffix (1st, 2nd, 3rd, etc.)
  const getRankSuffix = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  const profileImages = [
    // Default and basic avatars
    '👤', '🧑', '👨', '👩', '🧔', '👴', '👵', '👦', '👧', 
    // Formal and special
    '🤵', '👰', '🤴', '👸', '🕴️', '💂', '👮', '👷', '👩‍⚕️', '👨‍⚕️',
    // Expressions and styles
    '🤓', '😎', '🤠', '🥳', '😇', '🤯', '🤔', '😴', '🤐', '🤑',
    // Hats and accessories
    '👑', '🎩', '🧢', '🎓', '⛑️', '👒', '🪖',
    // Animals (perfect for pig game theme!)
    '🐷', '🐽', '🐸', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    // Fun characters
    '🤖', '👻', '👽', '🤡', '💀', '🎃', '😈', '👿', '🙈', '🙉', '🙊',
    // Food and objects
    '🍕', '🍔', '🌮', '🎂', '🍩', '🍪', '☕', '🎲', '🎯', '🏆', '💎', '⭐', '🔥', '💡'
  ];

  // Helper function to get avatar name
  const getAvatarName = (emoji: string) => {
    switch (emoji) {
      // Default and basic avatars
      case '👤': return 'Default Avatar';
      case '🧑': return 'Person';
      case '👨': return 'Man';
      case '👩': return 'Woman';
      case '🧔': return 'Bearded Person';
      case '👴': return 'Older Man';
      case '👵': return 'Older Woman';
      case '👦': return 'Boy';
      case '👧': return 'Girl';
      
      // Formal and special
      case '🤵': return 'Person in Tuxedo';
      case '👰': return 'Person with Veil';
      case '🤴': return 'Prince';
      case '👸': return 'Princess';
      case '🕴️': return 'Person in Suit';
      case '💂': return 'Guard';
      case '👮': return 'Police Officer';
      case '👷': return 'Construction Worker';
      case '👩‍⚕️': return 'Woman Doctor';
      case '👨‍⚕️': return 'Man Doctor';
      
      // Expressions and styles
      case '🤓': return 'Nerd Face';
      case '😎': return 'Cool Sunglasses';
      case '🤠': return 'Cowboy Hat';
      case '🥳': return 'Party Face';
      case '😇': return 'Angel';
      case '🤯': return 'Mind Blown';
      case '🤔': return 'Thinking Face';
      case '😴': return 'Sleepy';
      case '🤐': return 'Zip Mouth';
      case '🤑': return 'Money Face';
      
      // Hats and accessories
      case '👑': return 'Crown';
      case '🎩': return 'Top Hat';
      case '🧢': return 'Baseball Cap';
      case '🎓': return 'Graduation Cap';
      case '⛑️': return 'Rescue Helmet';
      case '👒': return 'Sun Hat';
      case '🪖': return 'Military Helmet';
      
      // Animals (perfect for pig game theme!)
      case '🐷': return 'Pig Face';
      case '🐽': return 'Pig Nose';
      case '🐸': return 'Frog';
      case '🐶': return 'Dog';
      case '🐱': return 'Cat';
      case '🐭': return 'Mouse';
      case '🐹': return 'Hamster';
      case '🐰': return 'Rabbit';
      case '🦊': return 'Fox';
      case '🐻': return 'Bear';
      case '🐼': return 'Panda';
      case '🐨': return 'Koala';
      case '🐯': return 'Tiger';
      case '🦁': return 'Lion';
      case '🐮': return 'Cow';
      
      // Fun characters
      case '🤖': return 'Robot';
      case '👻': return 'Ghost';
      case '👽': return 'Alien';
      case '🤡': return 'Clown';
      case '💀': return 'Skull';
      case '🎃': return 'Pumpkin';
      case '😈': return 'Devil';
      case '👿': return 'Angry Devil';
      case '🙈': return 'See No Evil';
      case '🙉': return 'Hear No Evil';
      case '🙊': return 'Speak No Evil';
      
      // Food and objects
      case '🍕': return 'Pizza';
      case '🍔': return 'Burger';
      case '🌮': return 'Taco';
      case '🎂': return 'Birthday Cake';
      case '🍩': return 'Donut';
      case '🍪': return 'Cookie';
      case '☕': return 'Coffee';
      case '🎲': return 'Dice';
      case '🎯': return 'Bullseye';
      case '🏆': return 'Trophy';
      case '💎': return 'Diamond';
      case '⭐': return 'Star';
      case '🔥': return 'Fire';
      case '💡': return 'Light Bulb';
      
      default: return 'Avatar';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToGame}
              className="flex items-center gap-2 font-boogaloo"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Game
            </Button>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
              <span className="text-2xl">👤</span>
            </div>
            <h1 className="text-4xl font-bold text-green-800 font-boogaloo">{playerName} Profile</h1>
          </div>
        </div>

        {/* Profile Information Card */}
        <Card className="p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 font-boogaloo">Profile Information</h2>
          </div>

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2 font-boogaloo">Edit Profile Name</label>
              <input
                type="text"
                value={playerName === 'Anonymous' ? '' : playerName}
                onChange={(e) => handleNameChange(e.target.value || 'Anonymous')}
                placeholder="Enter your name or leave blank for Anonymous"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                maxLength={25}
              />
            </div>

            {/* Image Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2 pb-4 font-boogaloo">Change Profile Picture</label>
              <Select value={playerImage} onValueChange={handleImageChange}>
                <SelectTrigger className="w-full h-24 text-lg">
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <span className="text-6xl animate-rock">{playerImage}</span>
                      <span className="text-lg font-medium font-boogaloo">{getAvatarName(playerImage)} Selected</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {profileImages.map((emoji) => (
                    <SelectItem key={emoji} value={emoji} className="h-14">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-base font-medium font-boogaloo">
                          {getAvatarName(emoji)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Personal Best Scores Card */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 font-boogaloo">Top 5 Personal Best Scores</h2>
          
          {personalBests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2 font-boogaloo">No Games Played Yet</h3>
              <p className="text-gray-500">Start playing to build your personal best scores!</p>
              <Button
                onClick={onBackToGame}
                className="mt-4 bg-green-600 hover:bg-green-700 font-boogaloo"
              >
                Play Your First Game
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {personalBests.slice(0, 5).map((best, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index === 0 
                      ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' 
                      : index === 1
                      ? 'border-gray-300 bg-gradient-to-r from-gray-50 to-blue-50'
                      : index === 2
                      ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200">
                      <span className="text-xl font-bold text-gray-700">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 font-boogaloo">
                        {best.score.toLocaleString()} points
                      </h4>
                      <p className="text-sm text-gray-600">
                        {best.agency} • Level {best.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{getRankSuffix(index + 1)} Best</p>
                    <p className="text-xs text-gray-500">{formatDate(best.date)}</p>
                  </div>
                </div>
              ))}
              
              {personalBests.length > 5 && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing top 5 of {personalBests.length} games played
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Stats Summary */}
        {personalBests.length > 0 && (
          <Card className="p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 font-boogaloo">Game Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 font-boogaloo">
                  {personalBests.length}
                </div>
                <p className="text-sm text-green-700 font-medium">Games Played</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 font-boogaloo">
                  {Math.max(...personalBests.map(b => b.score)).toLocaleString()}
                </div>
                <p className="text-sm text-blue-700 font-medium">Highest Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 font-boogaloo">
                  {Math.round(personalBests.reduce((sum, b) => sum + b.score, 0) / personalBests.length).toLocaleString()}
                </div>
                <p className="text-sm text-purple-700 font-medium">Average Score</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}