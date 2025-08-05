import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ShowHeader } from './ShowHeader';
import { EventsPanel } from './EventsPanel';
import { UniversalVictorySystem } from './UniversalVictorySystem';
import { UniversalFailureSystem } from './UniversalFailureSystem';
import { PersonalBestTracker } from './PersonalBestTracker';

import { 
  AGENCY_FUNDING_TARGETS, 
  AVAILABLE_AGENCIES, 
  DEFAULT_AGENCY, 
  DEFAULT_GOP_BILL_TARGET,
  getLevelMultiplier,
  getCauseBaseValue,
  formatCurrency 
} from './causes-constants';
import { Trophy, Play, Pause, ChevronDown, ChevronUp, X, Settings, Volume2, VolumeX, Share2, Globe } from 'lucide-react';
import { CockroachIcon } from './CockroachIcon';

import { triggerGameStartJingle, useGameAudio } from './GameAudio';

interface PigGameProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  onNavigateToProfile?: () => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
}

interface PigType {
  id: string;
  name: string;
  emoji: string;
  value: number;
  color: string;
  description: string;
  agency: string;
  size: number;
}

interface PigPosition {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pig: PigType;
  lastDirectionChange: number;
  rotation: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

interface LawsuitState {
  isActive: boolean;
  amount: number;
  escalationLevel: number;
  lastLawsuitTime: number;
}

const pigTypes: PigType[] = [
  // Alabama
  {
    id: 'tuberville',
    name: 'Tuberville',
    emoji: '🐷',
    value: 850,
    color: 'bg-red-200 hover:bg-red-300',
    description: 'for 850 points',
    agency: 'Department of Defense',
    size: 56
  },
  {
    id: 'britt',
    name: 'Britt',
    emoji: '🐷',
    value: 1200,
    color: 'bg-blue-200 hover:bg-blue-300',
    description: 'for 1,200 points',
    agency: 'Department of Homeland Security',
    size: 52
  },
  // Alaska
  {
    id: 'murkowski',
    name: 'Murkowski',
    emoji: '🐷',
    value: 450,
    color: 'bg-green-200 hover:bg-green-300',
    description: 'for 450 points',
    agency: 'Department of the Interior',
    size: 62
  },
  {
    id: 'sullivan',
    name: 'Sullivan',
    emoji: '🐷',
    value: 680,
    color: 'bg-purple-200 hover:bg-purple-300',
    description: 'for 680 points',
    agency: 'Coast Guard',
    size: 58
  },
  // Arizona
  {
    id: 'sinema',
    name: 'Sinema',
    emoji: '🐷',
    value: 950,
    color: 'bg-yellow-200 hover:bg-yellow-300',
    description: 'for 950 points',
    agency: 'Immigration Services',
    size: 54
  },
  {
    id: 'kelly',
    name: 'Kelly',
    emoji: '🐷',
    value: 750,
    color: 'bg-indigo-200 hover:bg-indigo-300',
    description: 'for 750 points',
    agency: 'NASA',
    size: 57
  },
  // Arkansas
  {
    id: 'cotton',
    name: 'Cotton',
    emoji: '🐷',
    value: 1150,
    color: 'bg-orange-200 hover:bg-orange-300',
    description: 'for 1,150 points',
    agency: 'Department of Defense',
    size: 53
  },
  {
    id: 'boozman',
    name: 'Boozman',
    emoji: '🐷',
    value: 380,
    color: 'bg-teal-200 hover:bg-teal-300',
    description: 'for 380 points',
    agency: 'Department of Veterans Affairs',
    size: 63
  },
  // California
  {
    id: 'feinstein',
    name: 'Feinstein',
    emoji: '🐷',
    value: 200,
    color: 'bg-cyan-200 hover:bg-cyan-300',
    description: 'for 200 points',
    agency: 'Senate Intelligence Committee',
    size: 70
  },
  {
    id: 'padilla',
    name: 'Padilla',
    emoji: '🐷',
    value: 820,
    color: 'bg-lime-200 hover:bg-lime-300',
    description: 'for 820 points',
    agency: 'Department of Homeland Security',
    size: 56
  },
  // Colorado
  {
    id: 'bennet',
    name: 'Bennet',
    emoji: '🐷',
    value: 650,
    color: 'bg-emerald-200 hover:bg-emerald-300',
    description: 'for 650 points',
    agency: 'Department of Education',
    size: 58
  },
  {
    id: 'hickenlooper',
    name: 'Hickenlooper',
    emoji: '🐷',
    value: 780,
    color: 'bg-rose-200 hover:bg-rose-300',
    description: 'for 780 points',
    agency: 'Department of Energy',
    size: 57
  },
  // Connecticut
  {
    id: 'blumenthal',
    name: 'Blumenthal',
    emoji: '🐷',
    value: 420,
    color: 'bg-amber-200 hover:bg-amber-300',
    description: 'for 420 points',
    agency: 'Department of Veterans Affairs',
    size: 62
  },
  {
    id: 'murphy',
    name: 'Murphy',
    emoji: '🐷',
    value: 890,
    color: 'bg-violet-200 hover:bg-violet-300',
    description: 'for 890 points',
    agency: 'Department of Health and Human Services',
    size: 55
  },
  // Delaware
  {
    id: 'carper',
    name: 'Carper',
    emoji: '🐷',
    value: 320,
    color: 'bg-fuchsia-200 hover:bg-fuchsia-300',
    description: 'for 320 points',
    agency: 'EPA',
    size: 64
  },
  {
    id: 'coons',
    name: 'Coons',
    emoji: '🐷',
    value: 580,
    color: 'bg-sky-200 hover:bg-sky-300',
    description: 'for 580 points',
    agency: 'State Department',
    size: 59
  },
  // Florida
  {
    id: 'rubio',
    name: 'Rubio',
    emoji: '🐷',
    value: 650,
    color: 'bg-stone-200 hover:bg-stone-300',
    description: 'for 650 points',
    agency: 'State Department',
    size: 58
  },
  {
    id: 'scott',
    name: 'Scott',
    emoji: '🐷',
    value: 1050,
    color: 'bg-neutral-200 hover:bg-neutral-300',
    description: 'for 1,050 points',
    agency: 'Department of Commerce',
    size: 54
  },
  // Georgia
  {
    id: 'warnock',
    name: 'Warnock',
    emoji: '🐷',
    value: 1300,
    color: 'bg-zinc-200 hover:bg-zinc-300',
    description: 'for 1,300 points',
    agency: 'Department of Agriculture',
    size: 51
  },
  {
    id: 'ossoff',
    name: 'Ossoff',
    emoji: '🐷',
    value: 1450,
    color: 'bg-slate-200 hover:bg-slate-300',
    description: 'for 1,450 points',
    agency: 'Department of Justice',
    size: 50
  },
  // Hawaii
  {
    id: 'schatz',
    name: 'Schatz',
    emoji: '🐷',
    value: 720,
    color: 'bg-red-300 hover:bg-red-400',
    description: 'for 720 points',
    agency: 'Department of Commerce',
    size: 58
  },
  {
    id: 'hirono',
    name: 'Hirono',
    emoji: '🐷',
    value: 980,
    color: 'bg-blue-300 hover:bg-blue-400',
    description: 'for 980 points',
    agency: 'Department of Veterans Affairs',
    size: 54
  },
  // Idaho
  {
    id: 'crapo',
    name: 'Crapo',
    emoji: '🐷',
    value: 350,
    color: 'bg-green-300 hover:bg-green-400',
    description: 'for 350 points',
    agency: 'Ethics Committee',
    size: 64
  },
  {
    id: 'risch',
    name: 'Risch',
    emoji: '🐷',
    value: 420,
    color: 'bg-yellow-300 hover:bg-yellow-400',
    description: 'for 420 points',
    agency: 'State Department',
    size: 62
  },
  // Illinois
  {
    id: 'durbin',
    name: 'Durbin',
    emoji: '🐷',
    value: 280,
    color: 'bg-purple-300 hover:bg-purple-400',
    description: 'for 280 points',
    agency: 'Department of Justice',
    size: 67
  },
  {
    id: 'duckworth',
    name: 'Duckworth',
    emoji: '🐷',
    value: 850,
    color: 'bg-pink-300 hover:bg-pink-400',
    description: 'for 850 points',
    agency: 'Department of Veterans Affairs',
    size: 56
  },
  // Indiana
  {
    id: 'braun',
    name: 'Braun',
    emoji: '🐷',
    value: 680,
    color: 'bg-orange-300 hover:bg-orange-400',
    description: 'for 680 points',
    agency: 'Department of Health and Human Services',
    size: 58
  },
  {
    id: 'young',
    name: 'Young',
    emoji: '🐷',
    value: 520,
    color: 'bg-teal-300 hover:bg-teal-400',
    description: 'for 520 points',
    agency: 'Department of Defense',
    size: 60
  },
  // Iowa
  {
    id: 'grassley',
    name: 'Grassley',
    emoji: '🐷',
    value: 180,
    color: 'bg-indigo-300 hover:bg-indigo-400',
    description: 'for 180 points',
    agency: 'Department of Justice',
    size: 72
  },
  {
    id: 'ernst',
    name: 'Ernst',
    emoji: '🐷',
    value: 750,
    color: 'bg-cyan-300 hover:bg-cyan-400',
    description: 'for 750 points',
    agency: 'Department of Agriculture',
    size: 57
  },
  // Kansas
  {
    id: 'moran',
    name: 'Moran',
    emoji: '🐷',
    value: 480,
    color: 'bg-lime-300 hover:bg-lime-400',
    description: 'for 480 points',
    agency: 'Department of Veterans Affairs',
    size: 61
  },
  {
    id: 'marshall',
    name: 'Marshall',
    emoji: '🐷',
    value: 920,
    color: 'bg-emerald-300 hover:bg-emerald-400',
    description: 'for 920 points',
    agency: 'Department of Health and Human Services',
    size: 55
  },
  // Kentucky
  {
    id: 'mcconnell',
    name: 'McConnell',
    emoji: '🐷',
    value: 120,
    color: 'bg-rose-300 hover:bg-rose-400',
    description: 'for 120 points',
    agency: 'Senate Budget Committee',
    size: 78
  },
  {
    id: 'paul',
    name: 'Paul',
    emoji: '🐷',
    value: 1250,
    color: 'bg-amber-300 hover:bg-amber-400',
    description: 'for 1,250 points',
    agency: 'Department of Health and Human Services',
    size: 52
  },
  // Louisiana
  {
    id: 'cassidy',
    name: 'Cassidy',
    emoji: '🐷',
    value: 620,
    color: 'bg-violet-300 hover:bg-violet-400',
    description: 'for 620 points',
    agency: 'Department of Health and Human Services',
    size: 59
  },
  {
    id: 'kennedy',
    name: 'Kennedy',
    emoji: '🐷',
    value: 980,
    color: 'bg-fuchsia-300 hover:bg-fuchsia-400',
    description: 'for 980 points',
    agency: 'Ethics Committee',
    size: 54
  },
  // Maine
  {
    id: 'collins',
    name: 'Collins',
    emoji: '🐷',
    value: 350,
    color: 'bg-sky-300 hover:bg-sky-400',
    description: 'for 350 points',
    agency: 'Department of Defense',
    size: 64
  },
  {
    id: 'king',
    name: 'King',
    emoji: '🐷',
    value: 450,
    color: 'bg-stone-300 hover:bg-stone-400',
    description: 'for 450 points',
    agency: 'Department of Energy',
    size: 62
  },
  // Maryland
  {
    id: 'cardin',
    name: 'Cardin',
    emoji: '🐷',
    value: 380,
    color: 'bg-neutral-300 hover:bg-neutral-400',
    description: 'for 380 points',
    agency: 'State Department',
    size: 63
  },
  {
    id: 'van_hollen',
    name: 'Van Hollen',
    emoji: '🐷',
    value: 720,
    color: 'bg-zinc-300 hover:bg-zinc-400',
    description: 'for 720 points',
    agency: 'Ethics Committee',
    size: 58
  },
  // Massachusetts
  {
    id: 'warren',
    name: 'Warren',
    emoji: '🐷',
    value: 1580,
    color: 'bg-slate-300 hover:bg-slate-400',
    description: 'for 1,580 points',
    agency: 'Ethics Committee',
    size: 49
  },
  {
    id: 'markey',
    name: 'Markey',
    emoji: '🐷',
    value: 890,
    color: 'bg-red-400 hover:bg-red-500',
    description: 'for 890 points',
    agency: 'Department of Energy',
    size: 55
  },
  // Michigan
  {
    id: 'stabenow',
    name: 'Stabenow',
    emoji: '🐷',
    value: 520,
    color: 'bg-blue-400 hover:bg-blue-500',
    description: 'for 520 points',
    agency: 'Department of Agriculture',
    size: 60
  },
  {
    id: 'peters',
    name: 'Peters',
    emoji: '🐷',
    value: 780,
    color: 'bg-green-400 hover:bg-green-500',
    description: 'for 780 points',
    agency: 'Department of Homeland Security',
    size: 57
  },
  // Minnesota
  {
    id: 'klobuchar',
    name: 'Klobuchar',
    emoji: '🐷',
    value: 650,
    color: 'bg-yellow-400 hover:bg-yellow-500',
    description: 'for 650 points',
    agency: 'Department of Commerce',
    size: 58
  },
  {
    id: 'smith',
    name: 'Smith',
    emoji: '🐷',
    value: 820,
    color: 'bg-purple-400 hover:bg-purple-500',
    description: 'for 820 points',
    agency: 'Department of Agriculture',
    size: 56
  },
  // Mississippi
  {
    id: 'wicker',
    name: 'Wicker',
    emoji: '🐷',
    value: 480,
    color: 'bg-pink-400 hover:bg-pink-500',
    description: 'for 480 points',
    agency: 'Department of Defense',
    size: 61
  },
  {
    id: 'hyde_smith',
    name: 'Hyde-Smith',
    emoji: '🐷',
    value: 750,
    color: 'bg-orange-400 hover:bg-orange-500',
    description: 'for 750 points',
    agency: 'Department of Agriculture',
    size: 57
  },
  // Missouri
  {
    id: 'blunt',
    name: 'Blunt',
    emoji: '🐷',
    value: 320,
    color: 'bg-teal-400 hover:bg-teal-500',
    description: 'for 320 points',
    agency: 'Department of Commerce',
    size: 64
  },
  {
    id: 'hawley',
    name: 'Hawley',
    emoji: '🐷',
    value: 1850,
    color: 'bg-indigo-400 hover:bg-indigo-500',
    description: 'for 1,850 points',
    agency: 'Department of Justice',
    size: 47
  },
  // Montana
  {
    id: 'daines',
    name: 'Daines',
    emoji: '🐷',
    value: 580,
    color: 'bg-cyan-400 hover:bg-cyan-500',
    description: 'for 580 points',
    agency: 'Department of Energy',
    size: 59
  },
  {
    id: 'tester',
    name: 'Tester',
    emoji: '🐷',
    value: 420,
    color: 'bg-lime-400 hover:bg-lime-500',
    description: 'for 420 points',
    agency: 'Department of Veterans Affairs',
    size: 62
  },
  // Nebraska
  {
    id: 'fischer',
    name: 'Fischer',
    emoji: '🐷',
    value: 650,
    color: 'bg-emerald-400 hover:bg-emerald-500',
    description: 'for 650 points',
    agency: 'Department of Defense',
    size: 58
  },
  {
    id: 'ricketts',
    name: 'Ricketts',
    emoji: '🐷',
    value: 920,
    color: 'bg-rose-400 hover:bg-rose-500',
    description: 'for 920 points',
    agency: 'Department of Agriculture',
    size: 55
  },
  // Nevada
  {
    id: 'cortez_masto',
    name: 'Cortez Masto',
    emoji: '🐷',
    value: 780,
    color: 'bg-amber-400 hover:bg-amber-500',
    description: 'for 780 points',
    agency: 'Ethics Committee',
    size: 57
  },
  {
    id: 'rosen',
    name: 'Rosen',
    emoji: '🐷',
    value: 850,
    color: 'bg-violet-400 hover:bg-violet-500',
    description: 'for 850 points',
    agency: 'Department of Energy',
    size: 56
  },
  // New Hampshire
  {
    id: 'shaheen',
    name: 'Shaheen',
    emoji: '🐷',
    value: 520,
    color: 'bg-fuchsia-400 hover:bg-fuchsia-500',
    description: 'for 520 points',
    agency: 'State Department',
    size: 60
  },
  {
    id: 'hassan',
    name: 'Hassan',
    emoji: '🐷',
    value: 720,
    color: 'bg-sky-400 hover:bg-sky-500',
    description: 'for 720 points',
    agency: 'Department of Homeland Security',
    size: 58
  },
  // New Jersey
  {
    id: 'menendez',
    name: 'Menendez',
    emoji: '🐷',
    value: 1450,
    color: 'bg-stone-400 hover:bg-stone-500',
    description: 'for 1,450 points',
    agency: 'State Department',
    size: 50
  },
  {
    id: 'booker',
    name: 'Booker',
    emoji: '🐷',
    value: 980,
    color: 'bg-neutral-400 hover:bg-neutral-500',
    description: 'for 980 points',
    agency: 'Department of Justice',
    size: 54
  },
  // New Mexico
  {
    id: 'heinrich',
    name: 'Heinrich',
    emoji: '🐷',
    value: 650,
    color: 'bg-zinc-400 hover:bg-zinc-500',
    description: 'for 650 points',
    agency: 'Department of Energy',
    size: 58
  },
  {
    id: 'lujan',
    name: 'Lujan',
    emoji: '🐷',
    value: 820,
    color: 'bg-slate-400 hover:bg-slate-500',
    description: 'for 820 points',
    agency: 'Department of Commerce',
    size: 56
  },
  // New York
  {
    id: 'schumer',
    name: 'Schumer',
    emoji: '🐷',
    value: 180,
    color: 'bg-red-500 hover:bg-red-600',
    description: 'for 180 points',
    agency: 'Senate Majority Leader Fund',
    size: 72
  },
  {
    id: 'gillibrand',
    name: 'Gillibrand',
    emoji: '🐷',
    value: 750,
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'for 750 points',
    agency: 'Department of Defense',
    size: 57
  },
  // North Carolina
  {
    id: 'burr',
    name: 'Burr',
    emoji: '🐷',
    value: 280,
    color: 'bg-green-500 hover:bg-green-600',
    description: 'for 280 points',
    agency: 'Senate Intelligence Committee',
    size: 67
  },
  {
    id: 'tillis',
    name: 'Tillis',
    emoji: '🐷',
    value: 680,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    description: 'for 680 points',
    agency: 'Department of Justice',
    size: 58
  },
  // North Dakota
  {
    id: 'hoeven',
    name: 'Hoeven',
    emoji: '🐷',
    value: 420,
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'for 420 points',
    agency: 'Department of Energy',
    size: 62
  },
  {
    id: 'cramer',
    name: 'Cramer',
    emoji: '🐷',
    value: 580,
    color: 'bg-pink-500 hover:bg-pink-600',
    description: 'for 580 points',
    agency: 'Department of Transportation',
    size: 59
  },
  // Ohio
  {
    id: 'portman',
    name: 'Portman',
    emoji: '🐷',
    value: 350,
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'for 350 points',
    agency: 'Department of Commerce',
    size: 64
  },
  {
    id: 'vance',
    name: 'Vance',
    emoji: '🐷',
    value: 1650,
    color: 'bg-teal-500 hover:bg-teal-600',
    description: 'for 1,650 points',
    agency: 'Department of Labor',
    size: 49
  },
  // Oklahoma
  {
    id: 'inhofe',
    name: 'Inhofe',
    emoji: '🐷',
    value: 320,
    color: 'bg-indigo-500 hover:bg-indigo-600',
    description: 'for 320 points',
    agency: 'EPA',
    size: 64
  },
  {
    id: 'lankford',
    name: 'Lankford',
    emoji: '🐷',
    value: 780,
    color: 'bg-cyan-500 hover:bg-cyan-600',
    description: 'for 780 points',
    agency: 'Department of Homeland Security',
    size: 57
  },
  // Oregon
  {
    id: 'wyden',
    name: 'Wyden',
    emoji: '🐷',
    value: 480,
    color: 'bg-lime-500 hover:bg-lime-600',
    description: 'for 480 points',
    agency: 'Ethics Committee',
    size: 61
  },
  {
    id: 'merkley',
    name: 'Merkley',
    emoji: '🐷',
    value: 850,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    description: 'for 850 points',
    agency: 'Department of the Interior',
    size: 56
  },
  // Pennsylvania
  {
    id: 'casey',
    name: 'Casey',
    emoji: '🐷',
    value: 450,
    color: 'bg-rose-500 hover:bg-rose-600',
    description: 'for 450 points',
    agency: 'Department of Health and Human Services',
    size: 62
  },
  {
    id: 'fetterman',
    name: 'Fetterman',
    emoji: '🐷',
    value: 1280,
    color: 'bg-amber-500 hover:bg-amber-600',
    description: 'for 1,280 points',
    agency: 'Department of Labor',
    size: 52
  },
  // Rhode Island
  {
    id: 'reed',
    name: 'Reed',
    emoji: '🐷',
    value: 380,
    color: 'bg-violet-500 hover:bg-violet-600',
    description: 'for 380 points',
    agency: 'Department of Defense',
    size: 63
  },
  {
    id: 'whitehouse',
    name: 'Whitehouse',
    emoji: '🐷',
    value: 720,
    color: 'bg-fuchsia-500 hover:bg-fuchsia-600',
    description: 'for 720 points',
    agency: 'Department of Justice',
    size: 58
  },
  // South Carolina
  {
    id: 'graham',
    name: 'Graham',
    emoji: '🐷',
    value: 580,
    color: 'bg-sky-500 hover:bg-sky-600',
    description: 'for 580 points',
    agency: 'State Department',
    size: 59
  },
  {
    id: 'scott_tim',
    name: 'Scott',
    emoji: '🐷',
    value: 920,
    color: 'bg-stone-500 hover:bg-stone-600',
    description: 'for 920 points',
    agency: 'Department of Labor',
    size: 55
  },
  // South Dakota
  {
    id: 'thune',
    name: 'Thune',
    emoji: '🐷',
    value: 250,
    color: 'bg-neutral-500 hover:bg-neutral-600',
    description: 'for 250 points',
    agency: 'Senate Republican Leadership',
    size: 68
  },
  {
    id: 'rounds',
    name: 'Rounds',
    emoji: '🐷',
    value: 650,
    color: 'bg-zinc-500 hover:bg-zinc-600',
    description: 'for 650 points',
    agency: 'Department of Veterans Affairs',
    size: 58
  },
  // Tennessee
  {
    id: 'alexander',
    name: 'Alexander',
    emoji: '🐷',
    value: 220,
    color: 'bg-slate-500 hover:bg-slate-600',
    description: 'for 220 points',
    agency: 'Department of Education',
    size: 69
  },
  {
    id: 'blackburn',
    name: 'Blackburn',
    emoji: '🐷',
    value: 1150,
    color: 'bg-red-600 hover:bg-red-700',
    description: 'for 1,150 points',
    agency: 'FTC',
    size: 53
  },
  // Texas
  {
    id: 'cornyn',
    name: 'Cornyn',
    emoji: '🐷',
    value: 280,
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'for 280 points',
    agency: 'Senate Republican Whip',
    size: 67
  },
  {
    id: 'cruz',
    name: 'Cruz',
    emoji: '🐷',
    value: 1750,
    color: 'bg-green-600 hover:bg-green-700',
    description: 'for 1,750 points',
    agency: 'Department of Energy',
    size: 48
  },
  // Utah
  {
    id: 'lee',
    name: 'Lee',
    emoji: '🐷',
    value: 1350,
    color: 'bg-yellow-600 hover:bg-yellow-700',
    description: 'for 1,350 points',
    agency: 'Department of Justice',
    size: 51
  },
  {
    id: 'romney',
    name: 'Romney',
    emoji: '🐷',
    value: 450,
    color: 'bg-purple-600 hover:bg-purple-700',
    description: 'for 450 points',
    agency: 'Department of Health and Human Services',
    size: 62
  },
  // Vermont
  {
    id: 'leahy',
    name: 'Leahy',
    emoji: '🐷',
    value: 180,
    color: 'bg-pink-600 hover:bg-pink-700',
    description: 'for 180 points',
    agency: 'Senate Judiciary Committee',
    size: 72
  },
  {
    id: 'sanders',
    name: 'Sanders',
    emoji: '🐷',
    value: 1980,
    color: 'bg-orange-600 hover:bg-orange-700',
    description: 'for 1,980 points',
    agency: 'Department of Health and Human Services',
    size: 46
  },
  // Virginia
  {
    id: 'warner',
    name: 'Warner',
    emoji: '🐷',
    value: 520,
    color: 'bg-teal-600 hover:bg-teal-700',
    description: 'for 520 points',
    agency: 'Senate Intelligence Committee',
    size: 60
  },
  {
    id: 'kaine',
    name: 'Kaine',
    emoji: '🐷',
    value: 680,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    description: 'for 680 points',
    agency: 'State Department',
    size: 58
  },
  // Washington
  {
    id: 'murray',
    name: 'Murray',
    emoji: '🐷',
    value: 420,
    color: 'bg-cyan-600 hover:bg-cyan-700',
    description: 'for 420 points',
    agency: 'Department of Health and Human Services',
    size: 62
  },
  {
    id: 'cantwell',
    name: 'Cantwell',
    emoji: '🐷',
    value: 580,
    color: 'bg-lime-600 hover:bg-lime-700',
    description: 'for 580 points',
    agency: 'Department of Energy',
    size: 59
  },
  // West Virginia
  {
    id: 'manchin',
    name: 'Manchin',
    emoji: '🐷',
    value: 1850,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    description: 'for 1,850 points',
    agency: 'Department of Energy',
    size: 47
  },
  {
    id: 'capito',
    name: 'Capito',
    emoji: '🐷',
    value: 650,
    color: 'bg-rose-600 hover:bg-rose-700',
    description: 'for 650 points',
    agency: 'EPA',
    size: 58
  },
  // Wisconsin
  {
    id: 'johnson',
    name: 'Johnson',
    emoji: '🐷',
    value: 1450,
    color: 'bg-amber-600 hover:bg-amber-700',
    description: 'for 1,450 points',
    agency: 'Department of Homeland Security',
    size: 50
  },
  {
    id: 'baldwin',
    name: 'Baldwin',
    emoji: '🐷',
    value: 780,
    color: 'bg-violet-600 hover:bg-violet-700',
    description: 'for 780 points',
    agency: 'Department of Health and Human Services',
    size: 57
  },
  // Wyoming
  {
    id: 'barrasso',
    name: 'Barrasso',
    emoji: '🐷',
    value: 620,
    color: 'bg-fuchsia-600 hover:bg-fuchsia-700',
    description: 'for 620 points',
    agency: 'EPA',
    size: 59
  },
  {
    id: 'lummis',
    name: 'Lummis',
    emoji: '🐷',
    value: 850,
    color: 'bg-sky-600 hover:bg-sky-700',
    description: 'for 850 points',
    agency: 'Ethics Committee',
    size: 56
  },
  // Extra Small Pigs (Hard to catch, high value) - Keep these with simple last names
  {
    id: 'tiny_mcconnell',
    name: 'McConnell Jr.',
    emoji: '🐷',
    value: 2500,
    color: 'bg-pink-700 hover:bg-pink-800',
    description: 'for 2,500 points',
    agency: 'Senate Budget Committee',
    size: 35
  },
  {
    id: 'mini_cruz',
    name: 'Cruz Jr.',
    emoji: '🐷',
    value: 2200,
    color: 'bg-orange-700 hover:bg-orange-800',
    description: 'for 2,200 points',
    agency: 'Department of Energy',
    size: 38
  },
  {
    id: 'small_graham',
    name: 'Graham Jr.',
    emoji: '🐷',
    value: 1950,
    color: 'bg-purple-700 hover:bg-purple-800',
    description: 'for 1,950 points',
    agency: 'State Department',
    size: 40
  },
  {
    id: 'pocket_warren',
    name: 'Warren Jr.',
    emoji: '🐷',
    value: 2800,
    color: 'bg-emerald-700 hover:bg-emerald-800',
    description: 'for 2,800 points',
    agency: 'Ethics Committee',
    size: 36
  },
  {
    id: 'baby_sanders',
    name: 'Sanders Jr.',
    emoji: '🐷',
    value: 3200,
    color: 'bg-red-700 hover:bg-red-800',
    description: 'for 3,200 points',
    agency: 'Department of Health and Human Services',
    size: 42
  },
  // Extra Large Pigs (Easy to catch, lower value) - Keep these with simple last names
  {
    id: 'giant_grassley',
    name: 'Grassley Sr.',
    emoji: '🐷',
    value: 80,
    color: 'bg-stone-700 hover:bg-stone-800',
    description: 'for 80 points',
    agency: 'Department of Justice',
    size: 95
  },
  {
    id: 'huge_schumer',
    name: 'Schumer Sr.',
    emoji: '🐷',
    value: 60,
    color: 'bg-zinc-700 hover:bg-zinc-800',
    description: 'for 60 points',
    agency: 'Senate Majority Leader Fund',
    size: 88
  },
  {
    id: 'massive_feinstein',
    name: 'Feinstein Sr.',
    emoji: '🐷',
    value: 45,
    color: 'bg-slate-700 hover:bg-slate-800',
    description: 'for 45 points',
    agency: 'Senate Intelligence Committee',
    size: 92
  },
  {
    id: 'enormous_leahy',
    name: 'Leahy Sr.',
    emoji: '🐷',
    value: 35,
    color: 'bg-gray-700 hover:bg-gray-800',
    description: 'for 35 points',
    agency: 'Senate Judiciary Committee',
    size: 90
  },
  {
    id: 'colossal_thune',
    name: 'Thune Sr.',
    emoji: '🐷',
    value: 55,
    color: 'bg-neutral-700 hover:bg-neutral-800',
    description: 'for 55 points',
    agency: 'Senate Republican Leadership',
    size: 85
  },
  {
    id: 'behemoth_alexander',
    name: 'Alexander Sr.',
    emoji: '🐷',
    value: 40,
    color: 'bg-indigo-700 hover:bg-indigo-800',
    description: 'for 40 points',
    agency: 'Department of Education',
    size: 82
  }
];

// Functions now imported from causes-constants.ts

// Constants now imported from causes-constants.ts
const GAME_AREA_HEIGHT = 400;
const MAX_SPEED = 4;
const MIN_SPEED = 1;

// Lawsuit configuration - Fixed 20 second interval
const LAWSUIT_TRIGGER_INTERVAL = 20000; // 20 seconds exactly
const INITIAL_LAWSUIT_AMOUNT = 500; // Points instead of dollars
const LAWSUIT_ESCALATION_MULTIPLIER = 2.5;

// Variations of "Stop it" for poke messages - expressions of annoyance at being poked
const STOP_IT_VARIATIONS = [
  "Stop it!",
  "Cut it out!",
  "Knock it off!",
  "Quit it!",
  "Stop that!",
  "Go away!",
  "No more!",
  "Leave me alone!",
  "Stop poking me!",
  "Quit touching me!",
  "Get your hands off me!",
  "Stop bothering me!",
  "That hurts!",
  "Ouch! Stop!",
  "You're annoying me!",
  "Stop pestering me!",
  "Quit bugging me!",
  "I'm trying to work here!",
  "Can't you see I'm busy?",
  "Mind your own business!",
  "Back off!",
  "Personal space!",
  "Stop harassing me!",
  "Give me a break!",
  "I don't have time for this!"
];

// Available pig emoji options for settings
const PIG_EMOJI_OPTIONS = [
  { emoji: "🐷", name: "Classic Pig" },
  { emoji: "🐽", name: "Pig Face" },
  { emoji: "🐖", name: "Pig" },
  { emoji: "🐗", name: "Wild Boar" },
  { emoji: "🐴", name: "Horse" },
  { emoji: "🐮", name: "Cow" },
  { emoji: "🐰", name: "Rabbit" },
  { emoji: "🐭", name: "Mouse" },
  { emoji: "🐹", name: "Hamster" },
  { emoji: "🐸", name: "Frog" },
  { emoji: "🐵", name: "Monkey" },
  { emoji: "🐱", name: "Cat" },
  { emoji: "🐶", name: "Dog" },
  { emoji: "🦆", name: "Duck" },
  { emoji: "🐔", name: "Chicken" },
  { emoji: "🐧", name: "Penguin" },
  { emoji: "🦊", name: "Fox" },
  { emoji: "🐻", name: "Bear" },
  { emoji: "🐼", name: "Panda" },
  { emoji: "🦁", name: "Lion" },
  { emoji: "🐯", name: "Tiger" },
  { emoji: "🐨", name: "Koala" },
  { emoji: "🐘", name: "Elephant" },
  { emoji: "🦏", name: "Rhino" },
  { emoji: "🦛", name: "Hippo" }
];

// Lawsuit claim variations - different "They claim..." statements
const LAWSUIT_CLAIMS = [
  "They claim you're stealing their thunder!",
  "They claim you're using their patented pig-poking technique!",
  "They claim you owe them licensing fees for political commentary!",
  "They claim your fundraising is cutting into their donation money!",
  "They claim you're violating their trademark on the word 'winning'!",
  "They claim you're illegally using the concept of finger pointing!",
  "They claim you stole their revolutionary 'poke and profit' business model!",
  "They claim you're infringing on their exclusive rights to political theatrics!",
  "They claim you're using their copyrighted method of blame deflection!",
  "They claim you owe them for every pig emoji used!",
  "They claim you're profiting from their invented political pig metaphor!",
  "They claim you're stealing their audience of frustrated Americans!",
  "They claim you plagiarized their 'drain the swamp' energy!",
  "They claim you're using their patented outrage monetization system!",
  "They claim you violated their exclusive contract with chaos!",
  "They claim you're illegally using their brand of manufactured controversy!",
  "They claim you stole their secret formula for turning anger into cash!",
  "They claim you're infringing on their monopoly of political circus acts!",
  "They claim you owe them royalties for every democratic institution you fund!",
  "They claim you're using their proprietary method of reality distortion!",
  "They claim you violated their exclusive license to point fingers at everyone!",
  "They claim you're stealing their innovative approach to avoiding responsibility!",
  "They claim you owe them for inspiration from their legal troubles!",
  "They claim you're illegally competing with their victim complex!",
  "They claim you stole their business model of selling grievances!"
];

interface PigGameProps {
  onNavigateToEvents?: (agency: string) => void;
  onNavigateToLeaderboard?: (agency: string) => void;
  selectedAgency?: string;
  onAgencyChange?: (agency: string) => void;
}

export function PigGame({ 
  onNavigateToEvents,
  onNavigateToLeaderboard,
  onNavigateToProfile, 
  selectedAgency: propSelectedAgency,
  onAgencyChange,
  onResetGame
}: PigGameProps) {
  // Game start state - control whether the game auto-starts
  const [gameHasStarted, setGameHasStarted] = useState(false);
  
  const [money, setMoney] = useState(0);
  const [selectedAgency, setSelectedAgency] = useState(DEFAULT_AGENCY);
  const [currentTarget, setCurrentTarget] = useState(DEFAULT_GOP_BILL_TARGET);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [pigs, setPigs] = useState<PigPosition[]>([]);
  const [clickedPig, setClickedPig] = useState<string | null>(null);
  const [pokedPolitician, setPokedPolitician] = useState<PigType | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState(false);
  const [lawsuit, setLawsuit] = useState<LawsuitState>({
    isActive: false,
    amount: INITIAL_LAWSUIT_AMOUNT,
    escalationLevel: 0,
    lastLawsuitTime: 0
  });
  const [defundingAmount, setDefundingAmount] = useState(0);
  const [showAgencyOverlay, setShowAgencyOverlay] = useState(false);
  const [currentStopItMessage, setCurrentStopItMessage] = useState("");
  const [currentLawsuitClaim, setCurrentLawsuitClaim] = useState("");
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
  const [selectedPigEmoji, setSelectedPigEmoji] = useState("🐷");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [difficultyHard, setDifficultyHard] = useState(true); // false = Easy (2D), true = Hard (3D) - Level 6 default is hard mode
  const [lawsuitsEnabled, setLawsuitsEnabled] = useState(true); // true = Lawsuits On (default), false = Lawsuits Off
  const [remainingPigTypes, setRemainingPigTypes] = useState<PigType[]>([]);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [startMessageFading, setStartMessageFading] = useState(false);
  const [speedSetting, setSpeedSetting] = useState(1); // Speed setting from 1 (slowest) to 5 (fastest) - Level 6 = Hard Mode Speed 1
  const [difficultyLevel, setDifficultyLevel] = useState(6); // Difficulty level from 1 to 12
  const [fundedAgencies, setFundedAgencies] = useState<Set<string>>(new Set()); // Track all funded agencies
  const [headerMinimized, setHeaderMinimized] = useState(false); // Track header minimization state - start with header open
  const [showFinalLawsuitScreen, setShowFinalLawsuitScreen] = useState(false); // Final lawsuit dismissal screen

  // Function to get a random "Stop it" variation
  const getStopItVariation = () => {
    return STOP_IT_VARIATIONS[Math.floor(Math.random() * STOP_IT_VARIATIONS.length)];
  };

  // Function to get a random lawsuit claim
  const getLawsuitClaim = () => {
    return LAWSUIT_CLAIMS[Math.floor(Math.random() * LAWSUIT_CLAIMS.length)];
  };

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lawsuitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const defundingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pigSpawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pokeMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startMessageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const headerMinimizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const agencyButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef<boolean>(false);
  const pigPotPanelRef = useRef<HTMLDivElement>(null);

  // Initialize and unlock audio context for mobile with enhanced iPhone support
  const initializeAudio = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      return audioContextRef.current;
    }
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.log('Web Audio API not supported');
        return null;
      }
      
      audioContextRef.current = new AudioContextClass({ 
        sampleRate: 44100,
        latencyHint: 'interactive'
      });
      
      // Enhanced mobile/iOS audio context handling
      if (audioContextRef.current.state === 'suspended' || audioContextRef.current.state === 'interrupted') {
        try {
          await audioContextRef.current.resume();
        } catch (resumeError) {
          console.log('Initial audio context resume failed, will retry on user interaction');
        }
      }
      
      return audioContextRef.current;
    } catch (error) {
      console.log('Audio context initialization failed:', error);
      return null;
    }
  }, []);

  // Enhanced audio unlocking for iPhone/iOS with multiple strategies
  const unlockAudio = useCallback(async () => {
    try {
      // Initialize audio context if not already done
      if (!audioContextRef.current) {
        await initializeAudio();
      }
      
      if (!audioContextRef.current) return false;
      
      // Always try to resume context on user interaction (important for iOS)
      if (audioContextRef.current.state === 'suspended' || audioContextRef.current.state === 'interrupted') {
        await audioContextRef.current.resume();
      }
      
      // For iOS: Always play a silent sound on user interaction to ensure audio is unlocked
      if (!audioUnlockedRef.current || /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        // Use a very brief, silent sound
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        gainNode.gain.setValueAtTime(0.001, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.05);
        
        // Additional iOS-specific unlock attempt
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          try {
            // Create a minimal buffer and play it
            const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
          } catch (bufferError) {
            console.log('Buffer-based unlock failed, continuing with oscillator method');
          }
        }
      }
      
      audioUnlockedRef.current = true;
      return true;
    } catch (error) {
      console.log('Audio unlock failed:', error);
      return false;
    }
  }, [initializeAudio]);

  // Create startup jingle with iPhone compatibility
  const playStartupJingle = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = await initializeAudio();
      if (!audioContext) return;
      
      // Ensure context is running (critical for iPhone)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (resumeError) {
          console.log('Could not resume audio context for startup jingle');
          return;
        }
      }
      
      if (audioContext.state !== 'running') {
        console.log('Audio context not ready for startup jingle, state:', audioContext.state);
        return;
      }
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.15, audioContext.currentTime); // Lower volume for startup

      // Happy jingle melody: C-E-G-C (major chord arpeggio)
      const notes = [
        { freq: 523.25, start: 0, duration: 0.2 },    // C5
        { freq: 659.25, start: 0.15, duration: 0.2 }, // E5
        { freq: 783.99, start: 0.3, duration: 0.2 },  // G5
        { freq: 1046.5, start: 0.45, duration: 0.3 }  // C6
      ];

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        // Add slight vibrato for warmth
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.setValueAtTime(5, audioContext.currentTime); // 5Hz vibrato
        lfoGain.gain.setValueAtTime(2, audioContext.currentTime); // Small pitch variation
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        // Envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.8, audioContext.currentTime + note.start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Gentle low-pass filter for warmth
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(1000, audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
        
        lfo.start(audioContext.currentTime + note.start);
        lfo.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Add a subtle bass note for richness
      const bassOscillator = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bassOscillator.type = 'triangle';
      bassOscillator.frequency.setValueAtTime(130.81, audioContext.currentTime); // C3
      
      bassGain.gain.setValueAtTime(0, audioContext.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      bassOscillator.connect(bassGain);
      bassGain.connect(masterGain);
      
      bassOscillator.start(audioContext.currentTime);
      bassOscillator.stop(audioContext.currentTime + 0.6);

    } catch (error) {
      console.log('Startup jingle audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled]);

  // Create failure sound with iPhone compatibility
  const playFailureSound = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = await initializeAudio();
      if (!audioContext) return;
      
      // Ensure context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      if (audioContext.state !== 'running') return;
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.2, audioContext.currentTime); // Slightly louder for impact

      // Failure melody: descending dissonant notes (C-B♭-A♭-F)
      const notes = [
        { freq: 523.25, start: 0, duration: 0.3 },    // C5
        { freq: 466.16, start: 0.25, duration: 0.3 }, // B♭4
        { freq: 415.30, start: 0.5, duration: 0.3 },  // A♭4
        { freq: 349.23, start: 0.75, duration: 0.4 }  // F4
      ];

      notes.forEach((note, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Use sawtooth for harsher, more dissonant sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        // Add slight detuning for dissonance
        const detune = audioContext.createOscillator();
        const detuneGain = audioContext.createGain();
        detune.frequency.setValueAtTime(note.freq + (index * 3), audioContext.currentTime + note.start); // Slightly detuned
        detune.type = 'square';
        
        // Envelope with slower attack for more dramatic effect
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + note.start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        detuneGain.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        detuneGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + note.start + 0.05);
        detuneGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Low-pass filter that gets progressively darker
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(1000 - (index * 150), audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(400 - (index * 50), audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        detune.connect(filterNode);
        filterNode.connect(gainNode);
        filterNode.connect(detuneGain);
        gainNode.connect(masterGain);
        detuneGain.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
        
        detune.start(audioContext.currentTime + note.start);
        detune.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Add a low, ominous bass drone
      const bassOscillator = audioContext.createOscillator();
      const bassGain = audioContext.createGain();
      bassOscillator.type = 'sawtooth';
      bassOscillator.frequency.setValueAtTime(87.31, audioContext.currentTime); // F2
      
      bassGain.gain.setValueAtTime(0, audioContext.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
      bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
      
      bassOscillator.connect(bassGain);
      bassGain.connect(masterGain);
      
      bassOscillator.start(audioContext.currentTime);
      bassOscillator.stop(audioContext.currentTime + 1.2);

      // Add a harsh noise burst for extra impact
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();
      
      // Create noise using a buffer
      const bufferSize = audioContext.sampleRate * 0.1; // 0.1 second of noise
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5; // White noise
      }
      
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = buffer;
      
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(300, audioContext.currentTime);
      noiseFilter.Q.setValueAtTime(10, audioContext.currentTime);
      
      noiseGain.gain.setValueAtTime(0, audioContext.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      
      noiseSource.start(audioContext.currentTime);

    } catch (error) {
      console.log('Failure sound audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled]);

  // Create success sound with iPhone compatibility
  const playSuccessSound = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = await initializeAudio();
      if (!audioContext) return;
      
      // Ensure context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      if (audioContext.state !== 'running') return;
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.25, audioContext.currentTime); // Celebratory volume

      // Triumphant melody: C-E-G-C-E-G-C (major chord arpeggio going up)
      const mainMelody = [
        { freq: 523.25, start: 0, duration: 0.15 },    // C5
        { freq: 659.25, start: 0.12, duration: 0.15 }, // E5
        { freq: 783.99, start: 0.24, duration: 0.15 }, // G5
        { freq: 1046.5, start: 0.36, duration: 0.2 },  // C6
        { freq: 1318.5, start: 0.52, duration: 0.2 },  // E6
        { freq: 1567.98, start: 0.68, duration: 0.2 }, // G6
        { freq: 2093.0, start: 0.84, duration: 0.3 }   // C7 (grand finale)
      ];

      // Harmony line: lower octave following the melody
      const harmonyMelody = [
        { freq: 261.63, start: 0.06, duration: 0.15 }, // C4
        { freq: 329.63, start: 0.18, duration: 0.15 }, // E4
        { freq: 392.00, start: 0.30, duration: 0.15 }, // G4
        { freq: 523.25, start: 0.42, duration: 0.2 },  // C5
        { freq: 659.25, start: 0.58, duration: 0.2 },  // E5
        { freq: 783.99, start: 0.74, duration: 0.2 },  // G5
        { freq: 1046.5, start: 0.90, duration: 0.3 }   // C6
      ];

      // Play main melody
      mainMelody.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        // Add celebratory vibrato
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        lfo.frequency.setValueAtTime(6, audioContext.currentTime); // 6Hz vibrato for excitement
        lfoGain.gain.setValueAtTime(3, audioContext.currentTime); // More vibrato than startup
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        // Bright envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.9, audioContext.currentTime + note.start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Bright filter for sparkle
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(3000, audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(2000, audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
        
        lfo.start(audioContext.currentTime + note.start);
        lfo.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Play harmony melody
      harmonyMelody.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);

        // Softer envelope for harmony
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + note.start + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Warmer filter for harmony
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(1500, audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Add triumphant bass line
      const bassNotes = [
        { freq: 130.81, start: 0, duration: 0.6 },    // C3
        { freq: 196.00, start: 0.4, duration: 0.8 }   // G3
      ];

      bassNotes.forEach((note) => {
        const bassOscillator = audioContext.createOscillator();
        const bassGain = audioContext.createGain();
        bassOscillator.type = 'square';
        bassOscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);
        
        bassGain.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        bassGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + note.start + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);
        
        bassOscillator.connect(bassGain);
        bassGain.connect(masterGain);
        
        bassOscillator.start(audioContext.currentTime + note.start);
        bassOscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

      // Add celebratory "sparkle" effects
      for (let i = 0; i < 8; i++) {
        const sparkleOscillator = audioContext.createOscillator();
        const sparkleGain = audioContext.createGain();
        const sparkleFilter = audioContext.createBiquadFilter();
        
        // Random high frequencies for sparkle
        const sparkleFreq = 1500 + Math.random() * 1500;
        sparkleOscillator.type = 'sine';
        sparkleOscillator.frequency.setValueAtTime(sparkleFreq, audioContext.currentTime);
        
        const startTime = Math.random() * 1.2;
        const duration = 0.1 + Math.random() * 0.1;
        
        sparkleFilter.type = 'highpass';
        sparkleFilter.frequency.setValueAtTime(1000, audioContext.currentTime + startTime);
        
        sparkleGain.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        sparkleGain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + startTime + 0.01);
        sparkleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
        
        sparkleOscillator.connect(sparkleFilter);
        sparkleFilter.connect(sparkleGain);
        sparkleGain.connect(masterGain);
        
        sparkleOscillator.start(audioContext.currentTime + startTime);
        sparkleOscillator.stop(audioContext.currentTime + startTime + duration);
      }

      // Add a final triumphant chord (C major)
      const finalChord = [
        { freq: 1046.5, duration: 0.8 }, // C6
        { freq: 1318.5, duration: 0.8 }, // E6
        { freq: 1567.98, duration: 0.8 } // G6
      ];

      finalChord.forEach((note) => {
        const chordOscillator = audioContext.createOscillator();
        const chordGain = audioContext.createGain();
        const chordFilter = audioContext.createBiquadFilter();
        
        chordOscillator.type = 'sine';
        chordOscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + 0.9);
        
        // Add rich vibrato to the final chord
        const chordLfo = audioContext.createOscillator();
        const chordLfoGain = audioContext.createGain();
        chordLfo.frequency.setValueAtTime(5, audioContext.currentTime + 0.9);
        chordLfoGain.gain.setValueAtTime(4, audioContext.currentTime + 0.9);
        chordLfo.connect(chordLfoGain);
        chordLfoGain.connect(chordOscillator.frequency);
        
        chordFilter.type = 'lowpass';
        chordFilter.frequency.setValueAtTime(2500, audioContext.currentTime + 0.9);
        chordFilter.frequency.linearRampToValueAtTime(1500, audioContext.currentTime + 1.7);
        
        chordGain.gain.setValueAtTime(0, audioContext.currentTime + 0.9);
        chordGain.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.95);
        chordGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.7);
        
        chordOscillator.connect(chordFilter);
        chordFilter.connect(chordGain);
        chordGain.connect(masterGain);
        
        chordOscillator.start(audioContext.currentTime + 0.9);
        chordOscillator.stop(audioContext.currentTime + 1.7);
        
        chordLfo.start(audioContext.currentTime + 0.9);
        chordLfo.stop(audioContext.currentTime + 1.7);
      });

    } catch (error) {
      console.log('Success sound audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled]);

  // Create simple two-note ascending alert sound with iPhone compatibility
  const playAlarmSound = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = await initializeAudio();
      if (!audioContext) return;
      
      // Ensure context is running
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      if (audioContext.state !== 'running') return;
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.2, audioContext.currentTime); // Moderate volume

      // Two ascending notes: C5 to E5
      const notes = [
        { freq: 523.25, start: 0, duration: 0.4 },    // C5 (lower note)
        { freq: 659.25, start: 0.3, duration: 0.5 }   // E5 (higher note)
      ];

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Use sine wave for clean, pleasant sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime + note.start);

        // Smooth envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.start);
        gainNode.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + note.start + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.start + note.duration);

        // Gentle low-pass filter for warmth
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(2000, audioContext.currentTime + note.start);
        filterNode.frequency.linearRampToValueAtTime(1500, audioContext.currentTime + note.start + note.duration);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });

    } catch (error) {
      console.log('Lawsuit alert sound audio not supported or blocked');
    }
  }, [initializeAudio, soundEnabled]);

  // Initialize audio with enhanced iPhone support
  useEffect(() => {
    // Extract color from pig color class (e.g., "bg-blue-200" -> "blue")
    const extractColorFromClass = (colorClass: string): string => {
      const match = colorClass.match(/bg-(\w+)-/);
      return match ? match[1] : 'default';
    };

    // Create color and size-specific pig squeal sounds using Web Audio API
    const createColoredPigSquealSound = async (colorClass: string, pigSize: number = 56) => {
      if (!soundEnabled) return;
      
      const color = extractColorFromClass(colorClass);
      const audioContext = await initializeAudio();
      if (!audioContext) return;
      
      // Ensure audio context is running (critical for iOS)
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (resumeError) {
          console.log('Could not resume audio context for pig sound');
          return;
        }
      }
      
      if (audioContext.state !== 'running') {
        console.log('Audio context not in running state:', audioContext.state);
        return;
      }
      
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      // Size-based frequency scaling (smaller pigs = higher pitch, larger pigs = lower pitch)
      // Size range: ~46 (smallest) to ~78 (largest)
      // Frequency multiplier: 1.6 for smallest pigs, 0.7 for largest pigs
      const sizeMultiplier = 1.6 - ((pigSize - 46) / (78 - 46)) * 0.9;
      
      // Color-specific audio characteristics (will be modified by size)
      let baseFreq1 = 400, baseFreq2 = 600;
      let peakFreq1 = 800, peakFreq2 = 1200;
      let endFreq1 = 300, endFreq2 = 400;
      let waveType1: OscillatorType = 'sawtooth';
      let waveType2: OscillatorType = 'triangle';
      let filterFreq = 800;
      let duration = 0.3;
      let volume = 0.3;

      switch (color) {
        case 'blue':
          // Higher pitched, more electronic
          baseFreq1 = 500; baseFreq2 = 700;
          peakFreq1 = 1000; peakFreq2 = 1400;
          endFreq1 = 400; endFreq2 = 500;
          waveType1 = 'square'; waveType2 = 'sine';
          filterFreq = 1000;
          break;
        case 'green':
          // Mid-range, earthy and natural
          baseFreq1 = 350; baseFreq2 = 550;
          peakFreq1 = 700; peakFreq2 = 1000;
          endFreq1 = 250; endFreq2 = 350;
          waveType1 = 'sawtooth'; waveType2 = 'triangle';
          filterFreq = 600;
          break;
        case 'pink':
          // Higher pitched, more squeaky
          baseFreq1 = 600; baseFreq2 = 800;
          peakFreq1 = 1200; peakFreq2 = 1600;
          endFreq1 = 450; endFreq2 = 600;
          waveType1 = 'triangle'; waveType2 = 'sine';
          filterFreq = 1200;
          volume = 0.25;
          break;
        case 'purple':
          // Lower pitched, more dramatic
          baseFreq1 = 300; baseFreq2 = 450;
          peakFreq1 = 600; peakFreq2 = 900;
          endFreq1 = 200; endFreq2 = 300;
          waveType1 = 'sawtooth'; waveType2 = 'square';
          filterFreq = 500;
          duration = 0.4;
          break;
        case 'orange':
          // Mid-range, warmer tone
          baseFreq1 = 450; baseFreq2 = 650;
          peakFreq1 = 900; peakFreq2 = 1300;
          endFreq1 = 350; endFreq2 = 450;
          waveType1 = 'triangle'; waveType2 = 'sawtooth';
          filterFreq = 700;
          break;
        case 'yellow':
          // Bright, cheerful, higher pitch
          baseFreq1 = 550; baseFreq2 = 750;
          peakFreq1 = 1100; peakFreq2 = 1500;
          endFreq1 = 400; endFreq2 = 550;
          waveType1 = 'sine'; waveType2 = 'triangle';
          filterFreq = 1100;
          duration = 0.25;
          break;
        case 'red':
          // Aggressive, harsh
          baseFreq1 = 380; baseFreq2 = 580;
          peakFreq1 = 760; peakFreq2 = 1160;
          endFreq1 = 280; endFreq2 = 380;
          waveType1 = 'sawtooth'; waveType2 = 'square';
          filterFreq = 600;
          volume = 0.35;
          break;
        case 'gray':
          // Dull, muted
          baseFreq1 = 320; baseFreq2 = 480;
          peakFreq1 = 640; peakFreq2 = 960;
          endFreq1 = 240; endFreq2 = 320;
          waveType1 = 'triangle'; waveType2 = 'sine';
          filterFreq = 400;
          volume = 0.2;
          break;
        case 'teal':
          // Cool, watery
          baseFreq1 = 420; baseFreq2 = 620;
          peakFreq1 = 840; peakFreq2 = 1240;
          endFreq1 = 320; endFreq2 = 420;
          waveType1 = 'sine'; waveType2 = 'triangle';
          filterFreq = 750;
          break;
        case 'indigo':
          // Deep, mysterious
          baseFreq1 = 280; baseFreq2 = 420;
          peakFreq1 = 560; peakFreq2 = 840;
          endFreq1 = 180; endFreq2 = 280;
          waveType1 = 'square'; waveType2 = 'sawtooth';
          filterFreq = 450;
          duration = 0.35;
          break;
        case 'cyan':
          // Bright, crisp
          baseFreq1 = 480; baseFreq2 = 680;
          peakFreq1 = 960; peakFreq2 = 1360;
          endFreq1 = 360; endFreq2 = 480;
          waveType1 = 'triangle'; waveType2 = 'sine';
          filterFreq = 900;
          break;
        case 'lime':
          // Sharp, zesty
          baseFreq1 = 520; baseFreq2 = 720;
          peakFreq1 = 1040; peakFreq2 = 1440;
          endFreq1 = 390; endFreq2 = 520;
          waveType1 = 'square'; waveType2 = 'triangle';
          filterFreq = 950;
          duration = 0.25;
          break;
        case 'emerald':
          // Rich, deep green
          baseFreq1 = 340; baseFreq2 = 540;
          peakFreq1 = 680; peakFreq2 = 1080;
          endFreq1 = 240; endFreq2 = 340;
          waveType1 = 'sawtooth'; waveType2 = 'triangle';
          filterFreq = 550;
          break;
        case 'rose':
          // Soft, pleasant
          baseFreq1 = 460; baseFreq2 = 660;
          peakFreq1 = 920; peakFreq2 = 1320;
          endFreq1 = 340; endFreq2 = 460;
          waveType1 = 'triangle'; waveType2 = 'sine';
          filterFreq = 800;
          volume = 0.25;
          break;
        case 'amber':
          // Warm, golden
          baseFreq1 = 440; baseFreq2 = 640;
          peakFreq1 = 880; peakFreq2 = 1280;
          endFreq1 = 330; endFreq2 = 440;
          waveType1 = 'triangle'; waveType2 = 'sawtooth';
          filterFreq = 720;
          break;
        case 'violet':
          // Elegant, refined
          baseFreq1 = 360; baseFreq2 = 560;
          peakFreq1 = 720; peakFreq2 = 1120;
          endFreq1 = 260; endFreq2 = 360;
          waveType1 = 'sine'; waveType2 = 'triangle';
          filterFreq = 650;
          break;
        case 'fuchsia':
          // Vibrant, energetic
          baseFreq1 = 580; baseFreq2 = 780;
          peakFreq1 = 1160; peakFreq2 = 1560;
          endFreq1 = 430; endFreq2 = 580;
          waveType1 = 'square'; waveType2 = 'triangle';
          filterFreq = 1000;
          duration = 0.25;
          break;
        case 'sky':
          // Light, airy
          baseFreq1 = 500; baseFreq2 = 700;
          peakFreq1 = 1000; peakFreq2 = 1400;
          endFreq1 = 375; endFreq2 = 500;
          waveType1 = 'sine'; waveType2 = 'triangle';
          filterFreq = 850;
          volume = 0.25;
          break;
        case 'stone':
          // Solid, heavy
          baseFreq1 = 300; baseFreq2 = 450;
          peakFreq1 = 600; peakFreq2 = 900;
          endFreq1 = 200; endFreq2 = 300;
          waveType1 = 'square'; waveType2 = 'sawtooth';
          filterFreq = 400;
          duration = 0.35;
          break;
        case 'neutral':
        case 'zinc':
        case 'slate':
          // Balanced, neutral
          baseFreq1 = 380; baseFreq2 = 580;
          peakFreq1 = 760; peakFreq2 = 1160;
          endFreq1 = 280; endFreq2 = 380;
          waveType1 = 'triangle'; waveType2 = 'sine';
          filterFreq = 600;
          volume = 0.25;
          break;
        default:
          // Default pig sound (original)
          break;
      }
      
      // Apply size-based frequency scaling to all frequencies
      const scaledBaseFreq1 = baseFreq1 * sizeMultiplier;
      const scaledPeakFreq1 = peakFreq1 * sizeMultiplier;
      const scaledEndFreq1 = endFreq1 * sizeMultiplier;
      const scaledBaseFreq2 = baseFreq2 * sizeMultiplier;
      const scaledPeakFreq2 = peakFreq2 * sizeMultiplier;
      const scaledEndFreq2 = endFreq2 * sizeMultiplier;
      const scaledFilterFreq = filterFreq * sizeMultiplier;
      
      // Set frequencies with color and size-specific values
      oscillator1.frequency.setValueAtTime(scaledBaseFreq1, audioContext.currentTime);
      oscillator1.frequency.linearRampToValueAtTime(scaledPeakFreq1, audioContext.currentTime + 0.1);
      oscillator1.frequency.linearRampToValueAtTime(scaledEndFreq1, audioContext.currentTime + duration);
      
      oscillator2.frequency.setValueAtTime(scaledBaseFreq2, audioContext.currentTime);
      oscillator2.frequency.linearRampToValueAtTime(scaledPeakFreq2, audioContext.currentTime + 0.15);
      oscillator2.frequency.linearRampToValueAtTime(scaledEndFreq2, audioContext.currentTime + duration);
      
      // Set wave types
      oscillator1.type = waveType1;
      oscillator2.type = waveType2;
      
      // Add filter with color and size-specific frequency
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(scaledFilterFreq, audioContext.currentTime);
      filterNode.frequency.linearRampToValueAtTime(scaledFilterFreq * 0.5, audioContext.currentTime + duration);
      
      // Envelope for the squeal with color-specific volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      // Connect the nodes
      oscillator1.connect(filterNode);
      oscillator2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start and stop the oscillators
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + duration);
      oscillator2.stop(audioContext.currentTime + duration);
    };

    // Store the sound creation function
    audioRef.current = {
      play: async (colorClass: string = 'bg-default-200', pigSize: number = 56) => {
        try {
          await createColoredPigSquealSound(colorClass, pigSize);
        } catch (error) {
          console.log('Audio not supported or blocked');
        }
      }
    } as any;

    // Initialize audio context immediately (don't wait for startup jingle)
    initializeAudio();
    
    // Don't auto-play startup jingle - only play when user starts game
  }, [playStartupJingle, initializeAudio]);

  // Play failure sound when mission fails
  useEffect(() => {
    if (sessionEnded && !sessionSuccess && !isGameWon) {
      // Small delay to let the UI render first
      const failureTimer = setTimeout(() => {
        playFailureSound();
      }, 200);

      return () => clearTimeout(failureTimer);
    }
  }, [sessionEnded, sessionSuccess, isGameWon, playFailureSound]);

  // Victory sound is now handled by VictorySystem component

  // Play alarm sound when Trump lawsuit appears
  useEffect(() => {
    if (lawsuit.isActive && !isGameWon) {
      // Small delay to let the UI render first
      const alarmTimer = setTimeout(() => {
        playAlarmSound();
      }, 100);

      return () => clearTimeout(alarmTimer);
    }
  }, [lawsuit.isActive, isGameWon, playAlarmSound]);

  // Handle clicks outside overlay to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAgencyOverlay && 
          overlayRef.current && 
          !overlayRef.current.contains(event.target as Node) &&
          agencyButtonRef.current &&
          !agencyButtonRef.current.contains(event.target as Node)) {
        setShowAgencyOverlay(false);
      }
      
      // Close settings overlay when clicking outside
      if (showSettingsOverlay) {
        const gearIcon = document.querySelector('[data-gear-icon]');
        if (gearIcon && !gearIcon.contains(event.target as Node)) {
          const settingsOverlay = document.querySelector('[data-settings-overlay]');
          if (settingsOverlay && !settingsOverlay.contains(event.target as Node)) {
            setShowSettingsOverlay(false);
          }
        }
      }
    };

    if (showAgencyOverlay || showSettingsOverlay) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAgencyOverlay, showSettingsOverlay]);



  // Load saved progress
  useEffect(() => {
    const savedMoney = localStorage.getItem('pig-n-poke-money');
    const savedAgency = localStorage.getItem('pig-n-poke-agency');
    const savedPigEmoji = localStorage.getItem('pig-n-poke-emoji');
    const savedSoundEnabled = localStorage.getItem('pig-n-poke-sound-enabled');
    const savedDifficulty = localStorage.getItem('pig-n-poke-difficulty');
    const savedLawsuitsEnabled = localStorage.getItem('pig-n-poke-lawsuits-enabled');
    const savedSpeedSetting = localStorage.getItem('pig-n-poke-speed-setting');
    const savedDifficultyLevel = localStorage.getItem('pig-n-poke-difficulty-level');
    const savedFundedAgencies = localStorage.getItem('pig-n-poke-funded-agencies');
    
    if (savedMoney) {
      setMoney(parseInt(savedMoney));
    }
    if (savedAgency && AVAILABLE_AGENCIES.includes(savedAgency)) {
      setSelectedAgency(savedAgency);
      setCurrentTarget(AGENCY_FUNDING_TARGETS[savedAgency] || DEFAULT_GOP_BILL_TARGET);
    }
    if (savedPigEmoji && PIG_EMOJI_OPTIONS.some(option => option.emoji === savedPigEmoji)) {
      setSelectedPigEmoji(savedPigEmoji);
    }
    if (savedSoundEnabled !== null) {
      setSoundEnabled(savedSoundEnabled === 'true');
    }
    if (savedDifficulty !== null) {
      setDifficultyHard(savedDifficulty === 'true');
    }
    if (savedLawsuitsEnabled !== null) {
      setLawsuitsEnabled(savedLawsuitsEnabled === 'true');
    }
    if (savedSpeedSetting !== null) {
      const speed = parseInt(savedSpeedSetting);
      if (speed >= 1 && speed <= 5) {
        setSpeedSetting(speed);
      }
    }
    if (savedDifficultyLevel !== null) {
      const level = parseInt(savedDifficultyLevel);
      if (level >= 1 && level <= 12) {
        setDifficultyLevel(level);
        
        // Apply difficulty mode and speed based on level
        if (level <= 5) {
          // Levels 1-5: Easy mode with speeds 1-5
          setDifficultyHard(false);
          setSpeedSetting(level);
          localStorage.setItem('pig-n-poke-difficulty', 'false');
          localStorage.setItem('pig-n-poke-speed-setting', level.toString());
        } else {
          // Levels 6+: Hard mode with speeds starting from 1
          setDifficultyHard(true);
          const hardModeSpeed = Math.min(level - 5, 5); // Level 6=Speed 1, Level 7=Speed 2, etc., capped at 5
          setSpeedSetting(hardModeSpeed);
          localStorage.setItem('pig-n-poke-difficulty', 'true');
          localStorage.setItem('pig-n-poke-speed-setting', hardModeSpeed.toString());
        }
      }
    }
    if (savedFundedAgencies) {
      try {
        const fundedList = JSON.parse(savedFundedAgencies);
        if (Array.isArray(fundedList)) {
          setFundedAgencies(new Set(fundedList));
        }
      } catch (error) {
        console.log('Error parsing funded agencies from localStorage');
      }
    }
  }, []);

  // Handle agency selection change
  const handleAgencyChange = async (agency: string) => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    setSelectedAgency(agency);
    const baseTarget = AGENCY_FUNDING_TARGETS[agency] || DEFAULT_GOP_BILL_TARGET;
    const levelMultiplier = getLevelMultiplier(difficultyLevel);
    const adjustedTarget = Math.round(baseTarget * levelMultiplier);
    setCurrentTarget(adjustedTarget);
    // Reset defunding amount when changing agency
    setDefundingAmount(0);
    // Close overlay
    setShowAgencyOverlay(false);
    // Minimize header after cause selection to provide more game space
    setHeaderMinimized(true);
    
    // Call parent component's onAgencyChange if provided
    if (onAgencyChange) {
      onAgencyChange(agency);
    }
    
    // Scroll to pig pot panel at the top of the screen
    setTimeout(() => {
      if (pigPotPanelRef.current) {
        pigPotPanelRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure overlay closes first
  };

  // Handle pig emoji selection change
  const handlePigEmojiChange = async (emoji: string) => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    setSelectedPigEmoji(emoji);
    localStorage.setItem('pig-n-poke-emoji', emoji);
    // Close settings overlay
    setShowSettingsOverlay(false);
  };

  // Handle sound toggle
  const handleSoundToggle = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('pig-n-poke-sound-enabled', newSoundEnabled.toString());
    
    // Play a test sound if enabling
    if (newSoundEnabled) {
      // Play a brief test sound with iPhone compatibility
      try {
        const audioContext = await initializeAudio();
        if (audioContext) {
          // Ensure context is running
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          if (audioContext.state === 'running') {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
          }
        }
      } catch (error) {
        console.log('Test sound failed:', error);
      }
    }
  };

  // Handle lawsuit toggle
  const handleLawsuitToggle = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    const newLawsuitsEnabled = !lawsuitsEnabled;
    setLawsuitsEnabled(newLawsuitsEnabled);
    localStorage.setItem('pig-n-poke-lawsuits-enabled', newLawsuitsEnabled.toString());
    
    // If disabling lawsuits while one is active, dismiss it
    if (!newLawsuitsEnabled && lawsuit.isActive) {
      setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));
    }
  };

  // Handle difficulty level change
  const handleDifficultyLevelChange = async (newLevel: number) => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    setDifficultyLevel(newLevel);
    localStorage.setItem('pig-n-poke-difficulty-level', newLevel.toString());
    
    // Determine difficulty mode and speed based on level
    if (newLevel <= 5) {
      // Levels 1-5: Easy mode with speeds 1-5
      setDifficultyHard(false);
      setSpeedSetting(newLevel);
      localStorage.setItem('pig-n-poke-difficulty', 'false');
      localStorage.setItem('pig-n-poke-speed-setting', newLevel.toString());
    } else {
      // Levels 6+: Hard mode with speeds starting from 1
      setDifficultyHard(true);
      const hardModeSpeed = Math.min(newLevel - 5, 5); // Level 6=Speed 1, Level 7=Speed 2, etc., capped at 5
      setSpeedSetting(hardModeSpeed);
      localStorage.setItem('pig-n-poke-difficulty', 'true');
      localStorage.setItem('pig-n-poke-speed-setting', hardModeSpeed.toString());
    }
  };

  // Handle gear icon click
  const handleGearClick = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    setShowSettingsOverlay(!showSettingsOverlay);
  };

  // Handle header toggle
  const handleHeaderToggle = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    setHeaderMinimized(!headerMinimized);
  };



  // Check if all agencies have been funded
  const allAgenciesFunded = fundedAgencies.size >= AVAILABLE_AGENCIES.length;

  // Handle navigate to events
  const handleNavigateToEvents = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    if (onNavigateToEvents) {
      onNavigateToEvents(selectedAgency);
    }
  };

  // Handle navigate to leaderboard
  const handleNavigateToLeaderboard = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    if (onNavigateToLeaderboard) {
      onNavigateToLeaderboard(selectedAgency);
    }
  };

  // Handle navigate to profile
  const handleNavigateToProfile = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  // Handle share success
  const handleShare = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    const shareText = allAgenciesFunded 
      ? `I've supported all causes! Just completed ${selectedAgency} by scoring ${money.toLocaleString()} points in Pig-n-Poke! 🐷💰 (Level ${difficultyLevel}) Can you beat my score?`
      : `I just successfully supported ${selectedAgency} by scoring ${money.toLocaleString()} points in Pig-n-Poke! 🐷💰 (Level ${difficultyLevel}) Can you beat my score?`;
    
    const shareData = {
      title: 'Pig-n-Poke Victory! 🎉',
      text: shareText,
      url: window.location.href
    };
    
    try {
      // Use Web Share API (native share on mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return; // Successfully shared using native share
      } else if (navigator.share) {
        // Fallback for browsers that support share but not canShare
        await navigator.share(shareData);
        return; // Successfully shared using native share
      }
      
      // Desktop fallback - copy to clipboard
      const shareText = `${shareData.text}\n\nPlay here: ${shareData.url}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert('Victory message copied to clipboard! Share it with your friends!');
      } else {
        // Final fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            alert('Victory message copied to clipboard! Share it with your friends!');
          } else {
            throw new Error('Copy command failed');
          }
        } catch (err) {
          alert('Unable to copy to clipboard. Please manually share your victory!');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      // Handle share cancellation or errors gracefully
      if (error.name === 'AbortError') {
        // User cancelled the share - this is normal, don't show an error
        return;
      }
      
      console.log('Native share failed, trying clipboard fallback:', error);
      
      // Last resort fallback
      const shareText = `${shareData.text}\n\nPlay here: ${shareData.url}`;
      
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText);
          alert('Victory message copied to clipboard! Share it with your friends!');
        } else {
          throw new Error('Clipboard not available');
        }
      } catch (clipboardError) {
        alert('Unable to share or copy. Please manually share your victory!');
      }
    }
  };



  // Update target when selected agency or difficulty level changes
  useEffect(() => {
    const baseTarget = AGENCY_FUNDING_TARGETS[selectedAgency] || DEFAULT_GOP_BILL_TARGET;
    const levelMultiplier = getLevelMultiplier(difficultyLevel);
    const adjustedTarget = Math.round(baseTarget * levelMultiplier);
    setCurrentTarget(adjustedTarget);
  }, [selectedAgency, difficultyLevel]);

  // Save progress - victory logic now handled by VictorySystem
  useEffect(() => {
    localStorage.setItem('pig-n-poke-money', money.toString());
    localStorage.setItem('pig-n-poke-agency', selectedAgency);
    localStorage.setItem('pig-n-poke-emoji', selectedPigEmoji);
    localStorage.setItem('pig-n-poke-sound-enabled', soundEnabled.toString());
    localStorage.setItem('pig-n-poke-difficulty', difficultyHard.toString());
    localStorage.setItem('pig-n-poke-lawsuits-enabled', lawsuitsEnabled.toString());
    localStorage.setItem('pig-n-poke-speed-setting', speedSetting.toString());
    localStorage.setItem('pig-n-poke-difficulty-level', difficultyLevel.toString());
  }, [money, selectedAgency, selectedPigEmoji, soundEnabled, difficultyHard, lawsuitsEnabled, speedSetting, difficultyLevel]);

  // Defunding timer management
  const startDefundingTimer = useCallback(() => {
    if (defundingTimerRef.current) {
      clearTimeout(defundingTimerRef.current);
    }
    
    const defundingInterval = 3000; // Defund 1000 points every 3 seconds
    
    defundingTimerRef.current = setTimeout(() => {
      if (isGameActive && !isGameWon && defundingAmount < currentTarget) {
        setDefundingAmount(prev => {
          const newDefunding = Math.min(prev + 1000, currentTarget);
          return newDefunding;
        });
        
        // Subtract 1000 points from current money
        setMoney(prev => prev - 1000);
        
        // Continue the defunding timer
        if (defundingAmount + 1000 < currentTarget) {
          startDefundingTimer();
        }
      }
    }, defundingInterval);
  }, [isGameActive, isGameWon, defundingAmount]);

  // Lawsuit timer management - Fixed 20 second intervals for initial, 30 seconds after settlement
  const scheduleLawsuit = useCallback(() => {
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
    }
    
    // Only schedule lawsuits if they are enabled
    if (!lawsuitsEnabled) {
      return;
    }
    
    // Fixed 20 second delay for initial lawsuit
    const delay = LAWSUIT_TRIGGER_INTERVAL;
    
    lawsuitTimerRef.current = setTimeout(() => {
      setLawsuit(prev => {
        // Only show lawsuit if game is active, no lawsuit is currently active, game not won, and lawsuits enabled
        if (isGameActive && !prev.isActive && !isGameWon && lawsuitsEnabled) {
          // Set new lawsuit claim when lawsuit appears
          setCurrentLawsuitClaim(getLawsuitClaim());
          return {
            ...prev,
            isActive: true,
            amount: Math.ceil(INITIAL_LAWSUIT_AMOUNT * Math.pow(LAWSUIT_ESCALATION_MULTIPLIER, prev.escalationLevel)),
            lastLawsuitTime: Date.now()
          };
        }
        return prev;
      });
    }, delay);
  }, [isGameActive, isGameWon, lawsuitsEnabled]);

  // Start defunding timer when game becomes active
  useEffect(() => {
    if (isGameActive && !isGameWon && defundingAmount < currentTarget) {
      startDefundingTimer();
    } else if (!isGameActive || isGameWon) {
      if (defundingTimerRef.current) {
        clearTimeout(defundingTimerRef.current);
        defundingTimerRef.current = null;
      }
    }

    return () => {
      if (defundingTimerRef.current) {
        clearTimeout(defundingTimerRef.current);
        defundingTimerRef.current = null;
      }
    };
  }, [isGameActive, isGameWon, defundingAmount, currentTarget, startDefundingTimer]);



  // Start lawsuit timer when game becomes active
  useEffect(() => {
    if (isGameActive && !isGameWon && lawsuitsEnabled) {
      // Only schedule if there's no active lawsuit and no timer already running
      if (!lawsuit.isActive && !lawsuitTimerRef.current) {
        scheduleLawsuit();
      }
    } else if (!isGameActive || isGameWon || !lawsuitsEnabled) {
      // Clear timer when game becomes inactive or lawsuits are disabled
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
    }

    return () => {
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
    };
  }, [isGameActive, isGameWon, lawsuitsEnabled, scheduleLawsuit]);

  // Pig spawning timer - Add one pig every second, but stop at 20 pigs max
  const startPigSpawning = useCallback(() => {
    if (pigSpawnTimerRef.current) {
      clearTimeout(pigSpawnTimerRef.current);
    }
    
    const spawnNextPig = () => {
      if (!gameAreaRef.current || !isGameActive || isGameWon) return;
      
      // Check current pig count and stop spawning if at 20 pigs
      setPigs(currentPigs => {
        if (currentPigs.length >= 20) {
          // Don't spawn new pig, but continue checking in 1 second
          pigSpawnTimerRef.current = setTimeout(spawnNextPig, 1000);
          return currentPigs;
        }
        
        // Spawn new pig since we're under the limit
        setRemainingPigTypes(prevRemaining => {
          let nextPig: PigType;
          let remainingAfter: PigType[];
          
          if (prevRemaining.length === 0) {
            // If we've run out of pig types, restart with the full list
            const shuffledPigTypes = [...pigTypes].sort(() => Math.random() - 0.5);
            nextPig = shuffledPigTypes[0];
            remainingAfter = shuffledPigTypes.slice(1);
          } else {
            // Use the next pig from the remaining list
            nextPig = prevRemaining[0];
            remainingAfter = prevRemaining.slice(1);
          }
          
          // Add the next pig to the game
          const containerWidth = gameAreaRef.current?.offsetWidth || 0;
          const { vx, vy } = generateRandomVelocity();
          const newPig: PigPosition = {
            id: `${nextPig.id}-${Date.now()}-${Math.random()}`,
            x: Math.random() * (containerWidth - nextPig.size),
            y: Math.random() * (GAME_AREA_HEIGHT - nextPig.size),
            vx,
            vy,
            pig: nextPig,
            lastDirectionChange: Date.now(),
            rotation: Math.random() * 360,
            rotationX: Math.random() * 360,
            rotationY: Math.random() * 360,
            rotationZ: Math.random() * 360
          };
          
          setPigs(prevPigs => [...prevPigs, newPig]);
          
          return remainingAfter;
        });
        
        // Continue spawning after 1 second
        pigSpawnTimerRef.current = setTimeout(spawnNextPig, 1000);
        return currentPigs;
      });
    };
    
    // Start spawning after 1 second
    pigSpawnTimerRef.current = setTimeout(spawnNextPig, 1000);
  }, [isGameActive, isGameWon]);

  // Start pig spawning when game becomes active
  useEffect(() => {
    if (isGameActive && !isGameWon) {
      startPigSpawning();
    } else if (!isGameActive || isGameWon) {
      if (pigSpawnTimerRef.current) {
        clearTimeout(pigSpawnTimerRef.current);
        pigSpawnTimerRef.current = null;
      }
    }

    return () => {
      if (pigSpawnTimerRef.current) {
        clearTimeout(pigSpawnTimerRef.current);
        pigSpawnTimerRef.current = null;
      }
    };
  }, [isGameActive, isGameWon, startPigSpawning]);

  // Lawsuit decision handlers
  const handleLawsuitSettle = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    const settlementAmount = lawsuit.amount;
    setMoney(prev => prev - settlementAmount);
    
    setLawsuit(prev => ({
      ...prev,
      isActive: false,
      escalationLevel: 0, // Reset escalation after settlement
      amount: INITIAL_LAWSUIT_AMOUNT
    }));

    // Clear any existing lawsuit timer
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
      lawsuitTimerRef.current = null;
    }

    // Schedule next lawsuit after exactly 30 seconds (only if lawsuits are enabled)
    lawsuitTimerRef.current = setTimeout(() => {
      if (isGameActive && !isGameWon && lawsuitsEnabled) {
        // Set new lawsuit claim when lawsuit appears
        setCurrentLawsuitClaim(getLawsuitClaim());
        setLawsuit(prev => ({
          ...prev,
          isActive: true,
          amount: Math.ceil(INITIAL_LAWSUIT_AMOUNT * Math.pow(LAWSUIT_ESCALATION_MULTIPLIER, prev.escalationLevel)),
          lastLawsuitTime: Date.now()
        }));
      }
    }, 30000); // Fixed 30 seconds after settlement
  };

  const handleLawsuitRefuse = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    const newEscalationLevel = lawsuit.escalationLevel + 1;
    
    // After 5 refuse clicks, show the final lawsuit screen
    if (newEscalationLevel >= 5) {
      setLawsuit(prev => ({
        ...prev,
        isActive: false, // Turn off current lawsuit
        escalationLevel: 0,
        amount: INITIAL_LAWSUIT_AMOUNT
      }));
      
      // Show the final lawsuit dismissal screen
      setShowFinalLawsuitScreen(true);
      
      return; // Exit early, final screen will handle the rest
    }
    
    const escalatedAmount = Math.ceil(lawsuit.amount * LAWSUIT_ESCALATION_MULTIPLIER);
    
    // Set new lawsuit claim when lawsuit escalates
    setCurrentLawsuitClaim(getLawsuitClaim());

    // Keep the lawsuit active but escalate it immediately - NO MONEY DEDUCTION
    setLawsuit(prev => ({
      ...prev,
      isActive: true, // Keep lawsuit active
      escalationLevel: newEscalationLevel,
      amount: escalatedAmount // Set the new higher amount
    }));

    // Lawsuit stays active and redisplays immediately with higher amount
  };

  // Handle final lawsuit screen dismissal
  const handleFinalLawsuitOkay = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    // Hide the final screen
    setShowFinalLawsuitScreen(false);
    
    // Disable the lawsuit system completely
    setLawsuitsEnabled(false);
    localStorage.setItem('pig-n-poke-lawsuits-enabled', 'false');
  };

  // Get lawsuit message based on escalation level
  const getLawsuitMessage = () => {
    if (lawsuit.escalationLevel === 0) {
      return "Breaking News: The great and all powerful orange one is suing you!";
    } else {
      return "The great and all powerful orange one is STILL suing you!";
    }
  };

  const getLawsuitDescription = () => {
    if (lawsuit.escalationLevel === 0) {
      return currentLawsuitClaim;
    } else {
      const escalationMessages = [
        "Now they're REALLY mad! The settlement has increased!",
        "Their lawyers are working overtime! More money demanded!",
        "This is getting expensive! They're not backing down!",
        "Final warning! Pay up or lose everything!"
      ];
      
      return escalationMessages[Math.min(lawsuit.escalationLevel - 1, escalationMessages.length - 1)];
    }
  };



  // End session function (called when all pigs are poked)
  const endSession = useCallback(() => {
    setIsGameActive(false);
    setPigs([]);
    setRemainingPigTypes([]);
    setPokedPolitician(null);
    setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));
    
    // Clear all timers
    if (defundingTimerRef.current) {
      clearTimeout(defundingTimerRef.current);
      defundingTimerRef.current = null;
    }
    if (pigSpawnTimerRef.current) {
      clearTimeout(pigSpawnTimerRef.current);
      pigSpawnTimerRef.current = null;
    }
    if (pokeMessageTimerRef.current) {
      clearTimeout(pokeMessageTimerRef.current);
      pokeMessageTimerRef.current = null;
    }
    
    // Check if session was successful based on money amount
    if (money >= currentTarget) {
      setSessionSuccess(true);
      setIsGameWon(true);
    } else {
      setSessionSuccess(false);
      setSessionEnded(true);
    }
  }, [money, currentTarget]);

  // Generate random velocity within speed limits based on speed setting
  const generateRandomVelocity = () => {
    // Map speed setting (1-5) to actual speed multipliers
    // 1 = 0.5x, 2 = 0.75x, 3 = 1.0x, 4 = 1.25x, 5 = 1.5x
    const speedMultiplier = 0.25 + (speedSetting * 0.25);
    const adjustedMinSpeed = MIN_SPEED * speedMultiplier;
    const adjustedMaxSpeed = MAX_SPEED * speedMultiplier;
    
    const speed = adjustedMinSpeed + Math.random() * (adjustedMaxSpeed - adjustedMinSpeed);
    const angle = Math.random() * 2 * Math.PI;
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };
  };

  // Initialize pig positions - Start with just one pig
  const initializePigs = useCallback(() => {
    if (!gameAreaRef.current) return;
    
    const containerWidth = gameAreaRef.current.offsetWidth;
    
    // Shuffle pig types and take the first one
    const shuffledPigTypes = [...pigTypes].sort(() => Math.random() - 0.5);
    const firstPig = shuffledPigTypes[0];
    const remainingPigs = shuffledPigTypes.slice(1);
    
    // Set remaining pigs for gradual spawning
    setRemainingPigTypes(remainingPigs);
    
    // Create the first pig
    const { vx, vy } = generateRandomVelocity();
    const newPig: PigPosition = {
      id: `${firstPig.id}-${Date.now()}-0`,
      x: Math.random() * (containerWidth - firstPig.size),
      y: Math.random() * (GAME_AREA_HEIGHT - firstPig.size),
      vx,
      vy,
      pig: firstPig,
      lastDirectionChange: Date.now(),
      rotation: Math.random() * 360,
      rotationX: Math.random() * 360,
      rotationY: Math.random() * 360,
      rotationZ: Math.random() * 360
    };
    
    setPigs([newPig]);
  }, []);

  // Animation loop for moving pigs
  const updatePigPositions = useCallback((currentTime: number) => {
    if (!gameAreaRef.current || !isGameActive) return;

    const containerWidth = gameAreaRef.current.offsetWidth;
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Don't update if deltaTime is too large (prevents jumps when tab is inactive)
    if (deltaTime > 100) {
      animationRef.current = requestAnimationFrame(updatePigPositions);
      return;
    }

    const now = Date.now();
    const timeMultiplier = deltaTime / 16; // Normalize to 60fps

    setPigs(prevPigs => 
      prevPigs.map(pig => {
        let { x, y, vx, vy, rotation, rotationX, rotationY, rotationZ } = pig;

        // Change direction randomly every 1-3 seconds
        if (now - pig.lastDirectionChange > 1000 + Math.random() * 2000) {
          const newVelocity = generateRandomVelocity();
          vx = newVelocity.vx;
          vy = newVelocity.vy;
          pig.lastDirectionChange = now;
        }

        // Update position with time-based movement
        x += vx * timeMultiplier;
        y += vy * timeMultiplier;

        // Update rotations based on movement and difficulty setting
        const movementSpeed = Math.abs(vx) + Math.abs(vy);
        if (difficultyHard) {
          // Hard mode: Fast 3D rotation effect for increased challenge
          rotationX += (vx * 2.8 + movementSpeed * 2.0) * timeMultiplier;
          rotationY += (vy * 2.8 + movementSpeed * 2.4) * timeMultiplier;
          rotationZ += (movementSpeed * 3.2 + (vx + vy) * 0.9) * timeMultiplier;
        } else {
          // Easy mode: simple 2D rotation
          rotation += movementSpeed * timeMultiplier;
        }

        // Bounce off walls with some randomness
        const pigSize = pig.pig.size;
        if (x <= 0 || x >= containerWidth - pigSize) {
          vx = -vx * (0.8 + Math.random() * 0.4); // Add some randomness to bounce
          x = Math.max(0, Math.min(containerWidth - pigSize, x));
          // Add some vertical component when bouncing horizontally
          vy += (Math.random() - 0.5) * 2;
        }
        if (y <= 0 || y >= GAME_AREA_HEIGHT - pigSize) {
          vy = -vy * (0.8 + Math.random() * 0.4); // Add some randomness to bounce
          y = Math.max(0, Math.min(GAME_AREA_HEIGHT - pigSize, y));
          // Add some horizontal component when bouncing vertically
          vx += (Math.random() - 0.5) * 2;
        }

        // Keep velocities within bounds based on speed setting
        const speedMultiplier = 0.25 + (speedSetting * 0.25);
        const adjustedMinSpeed = MIN_SPEED * speedMultiplier;
        const adjustedMaxSpeed = MAX_SPEED * speedMultiplier;
        
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);
        if (currentSpeed > adjustedMaxSpeed) {
          vx = (vx / currentSpeed) * adjustedMaxSpeed;
          vy = (vy / currentSpeed) * adjustedMaxSpeed;
        } else if (currentSpeed < adjustedMinSpeed) {
          vx = (vx / currentSpeed) * adjustedMinSpeed;
          vy = (vy / currentSpeed) * adjustedMinSpeed;
        }

        return { ...pig, x, y, vx, vy, rotation, rotationX, rotationY, rotationZ };
      })
    );

    animationRef.current = requestAnimationFrame(updatePigPositions);
  }, [isGameActive, difficultyHard, speedSetting]);

  // Start/stop game
  useEffect(() => {
    if (isGameActive && pigs.length > 0) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(updatePigPositions);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGameActive, pigs.length, updatePigPositions]);

  // Check if defunding is complete (removed check for all pigs poked since we now spawn continuously)
  useEffect(() => {
    if (isGameActive && defundingAmount >= currentTarget && !isGameWon) {
      // Defunding complete - end session as failure (only if not already won)
      setSessionSuccess(false);
      setSessionEnded(true);
      setIsGameActive(false);
      setPigs([]);
      setPokedPolitician(null);
      setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));
      
      // Clear all timers
      if (defundingTimerRef.current) {
        clearTimeout(defundingTimerRef.current);
        defundingTimerRef.current = null;
      }
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
      if (pigSpawnTimerRef.current) {
        clearTimeout(pigSpawnTimerRef.current);
        pigSpawnTimerRef.current = null;
      }
    }
  }, [isGameActive, defundingAmount, isGameWon, currentTarget]);

  const handlePigClick = async (pigPosition: PigPosition, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Don't allow clicks if game is already won
    if (isGameWon) return;
    
    // Unlock audio on first interaction (for mobile)
    await unlockAudio();
    
    // Play color and size-specific pig squeal sound
    if (audioRef.current) {
      await audioRef.current.play(pigPosition.pig.color, pigPosition.pig.size);
    }
    
    // Use the same level multiplier system as cause values for balanced gameplay
    const levelMultiplier = getLevelMultiplier(difficultyLevel);
    const levelMultipliedValue = Math.round(pigPosition.pig.value * levelMultiplier);
    const newMoney = money + levelMultipliedValue;
    setMoney(newMoney);
    setClickedPig(pigPosition.id);
    setPokedPolitician({...pigPosition.pig, value: levelMultipliedValue});
    
    // Set the "Stop it" variation for this poke
    setCurrentStopItMessage(getStopItVariation());
    
    // Remove the clicked pig permanently after animation
    setTimeout(() => {
      setClickedPig(null);
      setPigs(prev => prev.filter(p => p.id !== pigPosition.id));
    }, 500);

    // Clear any existing poke message timer
    if (pokeMessageTimerRef.current) {
      clearTimeout(pokeMessageTimerRef.current);
      pokeMessageTimerRef.current = null;
    }

    // Set new timer to clear politician name after 5 seconds
    pokeMessageTimerRef.current = setTimeout(() => {
      setPokedPolitician(null);
      setCurrentStopItMessage("");
      pokeMessageTimerRef.current = null;
    }, 5000);
  };

  const startNewSession = useCallback(async () => {
    if (!isGameWon) { // Only allow new sessions if game isn't won
      // Unlock audio on user interaction (for mobile)
      await unlockAudio();
      
      // Close header if it's open when game starts
      if (!headerMinimized) {
        setHeaderMinimized(true);
      }
      
      // Always play startup jingle when user starts the game
      playStartupJingle();
      
      setGameHasStarted(true); // Mark that the game has been manually started
      setMoney(0); // Reset money to 0 for fresh start
      setIsGameActive(true);
      setSessionEnded(false);
      setSessionSuccess(false);
      setPokedPolitician(null);
      setDefundingAmount(0); // Reset defunding progress for new session
      setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));

      
      // Clear any existing timers
      if (defundingTimerRef.current) {
        clearTimeout(defundingTimerRef.current);
        defundingTimerRef.current = null;
      }
      if (lawsuitTimerRef.current) {
        clearTimeout(lawsuitTimerRef.current);
        lawsuitTimerRef.current = null;
      }
      if (pigSpawnTimerRef.current) {
        clearTimeout(pigSpawnTimerRef.current);
        pigSpawnTimerRef.current = null;
      }
      if (startMessageTimerRef.current) {
        clearTimeout(startMessageTimerRef.current);
        startMessageTimerRef.current = null;
      }
      
      // Show "Start Poking!" message for 2 seconds with fade out
      setShowStartMessage(true);
      setStartMessageFading(false);
      
      // Start fade out after 1.5 seconds
      setTimeout(() => {
        setStartMessageFading(true);
      }, 1500);
      
      // Completely hide after 2 seconds (500ms fade duration)
      startMessageTimerRef.current = setTimeout(() => {
        setShowStartMessage(false);
        setStartMessageFading(false);
        startMessageTimerRef.current = null;
      }, 2000);
      
      initializePigs();
    }
  }, [initializePigs, isGameWon, unlockAudio, gameHasStarted, playStartupJingle]);

  // Handle pause/resume events from navigation
  useEffect(() => {
    const handleGamePause = (event: CustomEvent) => {
      console.log('PigGame: Received pause event', event.detail);
      if (isGameActive) {
        setIsGameActive(false);
        
        // Clear all timers
        if (defundingTimerRef.current) {
          clearInterval(defundingTimerRef.current);
          defundingTimerRef.current = null;
        }
        if (lawsuitTimerRef.current) {
          clearTimeout(lawsuitTimerRef.current);
          lawsuitTimerRef.current = null;
        }
        if (pigSpawnTimerRef.current) {
          clearTimeout(pigSpawnTimerRef.current);
          pigSpawnTimerRef.current = null;
        }
        if (startMessageTimerRef.current) {
          clearTimeout(startMessageTimerRef.current);
          startMessageTimerRef.current = null;
        }
      }
    };

    const handleGameResume = (event: CustomEvent) => {
      console.log('PigGame: Received resume event', event.detail);
      if (!isGameWon && !sessionEnded && !isGameActive && pigs.length > 0) {
        setIsGameActive(true);
        
        // Restart defunding timer
        startDefundingTimer();
        
        // Restart pig spawning since it runs continuously during active gameplay
        startPigSpawning();
      }
    };

    // Add event listeners
    window.addEventListener('gamePause', handleGamePause as EventListener);
    window.addEventListener('gameResume', handleGameResume as EventListener);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('gamePause', handleGamePause as EventListener);
      window.removeEventListener('gameResume', handleGameResume as EventListener);
    };
  }, [isGameActive, isGameWon, sessionEnded, pigs.length, startDefundingTimer, startPigSpawning]);

  // Initialize audio and event listeners, but don't auto-start the game
  useEffect(() => {
    if (!isGameWon) {
      // Initialize audio context first
      initializeAudio();
      
      // Add comprehensive event listeners for iPhone audio unlocking
      const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
      const handleUnlockEvent = () => {
        unlockAudio();
      };
      
      // Add listeners to document to catch any user interaction
      unlockEvents.forEach(event => {
        document.addEventListener(event, handleUnlockEvent, { once: false, passive: true });
      });

      return () => {
        // Clean up event listeners
        unlockEvents.forEach(event => {
          document.removeEventListener(event, handleUnlockEvent);
        });
      };
    }
  }, [isGameWon, initializeAudio, unlockAudio]);



  const pauseGame = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    setIsGameActive(false);
    // Clear timers when pausing
    if (defundingTimerRef.current) {
      clearTimeout(defundingTimerRef.current);
      defundingTimerRef.current = null;
    }
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
      lawsuitTimerRef.current = null;
    }
    if (pigSpawnTimerRef.current) {
      clearTimeout(pigSpawnTimerRef.current);
      pigSpawnTimerRef.current = null;
    }
    if (startMessageTimerRef.current) {
      clearTimeout(startMessageTimerRef.current);
      startMessageTimerRef.current = null;
    }
  };

  const resumeGame = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    // Play startup jingle when resuming the game
    playStartupJingle();
    
    if (pigs.length > 0) {
      setIsGameActive(true);
    }
  };

  const resetGameKeepDifficulty = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    
    // Play startup jingle when resetting for play again
    playStartupJingle();
    
    setGameHasStarted(false); // Reset game start state
    setMoney(0);
    setDefundingAmount(0);
    setIsGameWon(false);
    setIsGameActive(false);
    setPigs([]);
    setRemainingPigTypes([]);
    setPokedPolitician(null);
    setSessionEnded(false);
    setSessionSuccess(false);
    setLawsuit({ isActive: false, amount: INITIAL_LAWSUIT_AMOUNT, escalationLevel: 0, lastLawsuitTime: 0 });
    setShowAgencyOverlay(false);

    // Only reset money and agency in localStorage, keep other settings
    localStorage.removeItem('pig-n-poke-money');
    // Keep agency, emoji, sound, difficulty, lawsuits, speed, and difficulty level settings
    
    // Clear all timers
    if (defundingTimerRef.current) {
      clearTimeout(defundingTimerRef.current);
      defundingTimerRef.current = null;
    }
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
      lawsuitTimerRef.current = null;
    }
    if (pigSpawnTimerRef.current) {
      clearTimeout(pigSpawnTimerRef.current);
      pigSpawnTimerRef.current = null;
    }
    if (pokeMessageTimerRef.current) {
      clearTimeout(pokeMessageTimerRef.current);
      pokeMessageTimerRef.current = null;
    }
    if (startMessageTimerRef.current) {
      clearTimeout(startMessageTimerRef.current);
      startMessageTimerRef.current = null;
    }
    
    // Auto-start a new session immediately for Play Again functionality
    startNewSession();
  };

  // Play Again handler for VictorySystem
  const handlePlayAgain = async () => {
    await resetGameKeepDifficulty();
  };

  const resetGame = async () => {
    // Unlock audio on user interaction (for mobile)
    await unlockAudio();
    setGameHasStarted(false); // Reset game start state
    setMoney(0);
    setDefundingAmount(0);
    setIsGameWon(false);
    setIsGameActive(false);
    setPigs([]);
    setRemainingPigTypes([]);
    setPokedPolitician(null);
    setSessionEnded(false);
    setSessionSuccess(false);
    setLawsuit({ isActive: false, amount: INITIAL_LAWSUIT_AMOUNT, escalationLevel: 0, lastLawsuitTime: 0 });
    setSelectedAgency('Ethics Committee');
    setCurrentTarget(AGENCY_FUNDING_TARGETS['Ethics Committee'] || 10000);
    setShowAgencyOverlay(false);

    localStorage.removeItem('pig-n-poke-money');
    localStorage.removeItem('pig-n-poke-agency');
    localStorage.removeItem('pig-n-poke-emoji');
    localStorage.removeItem('pig-n-poke-sound-enabled');
    localStorage.removeItem('pig-n-poke-difficulty');
    localStorage.removeItem('pig-n-poke-lawsuits-enabled');
    localStorage.removeItem('pig-n-poke-speed-setting');
    localStorage.removeItem('pig-n-poke-difficulty-level');
    localStorage.removeItem('pig-n-poke-funded-agencies');
    setSelectedPigEmoji("🐷"); // Reset to default pig emoji
    setSoundEnabled(true); // Reset to sound enabled
    setLawsuitsEnabled(true); // Reset to lawsuits enabled
    setDifficultyLevel(6); // Reset to default difficulty level
    setDifficultyHard(true); // Reset to hard mode (level 6 is hard mode)
    setSpeedSetting(1); // Reset to default speed (matches difficulty level 6 = hard mode speed 1)
    setFundedAgencies(new Set()); // Reset funded agencies
    
    // Call parent's reset callback if provided
    if (onResetGame) {
      onResetGame();
    }
    
    // Clear all timers
    if (defundingTimerRef.current) {
      clearTimeout(defundingTimerRef.current);
      defundingTimerRef.current = null;
    }
    if (lawsuitTimerRef.current) {
      clearTimeout(lawsuitTimerRef.current);
      lawsuitTimerRef.current = null;
    }
    if (pigSpawnTimerRef.current) {
      clearTimeout(pigSpawnTimerRef.current);
      pigSpawnTimerRef.current = null;
    }
    if (pokeMessageTimerRef.current) {
      clearTimeout(pokeMessageTimerRef.current);
      pokeMessageTimerRef.current = null;
    }
    if (startMessageTimerRef.current) {
      clearTimeout(startMessageTimerRef.current);
      startMessageTimerRef.current = null;
    }
    
    // Play startup jingle on reset
    setTimeout(() => {
      playStartupJingle();
    }, 300);
    
    // Auto-start a new session after reset
    setTimeout(() => {
      startNewSession();
    }, 100);
  };

  const progressPercentage = Math.min((money / currentTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 pt-8">
      {/* Show Header Overlay - Top Layer */}
      <ShowHeader 
        onHeaderToggle={handleHeaderToggle} 
        headerMinimized={headerMinimized} 
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Always Visible Pig Head */}
        <div className="text-center mb-4">
          <div className="relative">
            <span className="inline-block animate-rock text-8xl">🐷</span>
          </div>
        </div>

        {/* Header */}
        {headerMinimized ? (
          /* Minimized Header - Just a down arrow */
          <div className="text-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              onClick={handleHeaderToggle}
            >
              <ChevronDown className="w-6 h-6" />
            </Button>
          </div>
        ) : (
          /* Full Header */
          <div className="text-center mb-4">
            <h1 className="text-5xl font-bold text-green-800 mb-2 font-boogaloo">
              Poke-n-Pork
            </h1>
            <p className="text-lg text-gray-600 mb-4">Where one person's pork is another person's cause</p>
            
            {/* Fund a Cause Controls */}
            <Card className="px-6 pt-3 pb-4 mb-4 w-full">
              <p className="text-xl text-gray-700 mb-1 font-bold text-center font-boogaloo">Save Your Cause from Defunding</p>
              
              {/* Agency Selection Button with Leaderboard Button */}
              <div className="flex items-center justify-center gap-2 min-w-0 relative">
                <Button
                  ref={agencyButtonRef}
                  variant="outline"
                  className="justify-between w-64 h-8 text-sm hover:bg-gray-50 cursor-pointer"
                  onClick={() => setShowAgencyOverlay(!showAgencyOverlay)}
                >
                  <span className="truncate">{selectedAgency}</span>
                  <ChevronDown className="w-3 h-3 ml-2 flex-shrink-0" />
                </Button>
                
                {/* Leaderboard Button */}
                <Button
                  onClick={handleNavigateToLeaderboard}
                  onTouchStart={unlockAudio}
                  variant="outline"
                  className="h-8 px-3 hover:bg-blue-50 border-blue-200 flex items-center gap-1 font-boogaloo"
                  title="View Global Leaderboard"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Leaderboard</span>
                </Button>
                
                {/* Agency Selection Overlay */}
                {showAgencyOverlay && (
                  <div
                    ref={overlayRef}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-80 max-h-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
                  >
                    <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-900">Select Your Cause</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowAgencyOverlay(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {AVAILABLE_AGENCIES.map((agency) => {
                        // Calculate level-adjusted target value for this agency
                        const baseValue = getCauseBaseValue(agency);
                        const levelMultiplier = getLevelMultiplier(difficultyLevel);
                        const adjustedTarget = Math.round(baseValue * levelMultiplier);
                        
                        return (
                          <div
                            key={agency}
                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              selectedAgency === agency ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                            }`}
                            onClick={() => handleAgencyChange(agency)}
                          >
                            <div className="flex items-center w-full">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium truncate ${
                                    selectedAgency === agency ? 'text-green-700' : 'text-gray-900'
                                  }`}>{agency}</span>
                                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                    {adjustedTarget.toLocaleString()} points
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>


            
            {/* Minimize button */}
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={handleHeaderToggle}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Current Defunding Panel */}
        <Card className="p-4 mb-4">
          <div className="relative h-3 bg-green-200 rounded-full overflow-hidden mb-1">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000 ease-out"
              style={{ 
                width: `${(defundingAmount / currentTarget * 100)}%` 
              }}
            />
            {defundingAmount >= currentTarget && (
              <div className="absolute inset-0 bg-red-600 animate-pulse" />
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-lg text-red-700 font-medium font-boogaloo">Beat the</span>
              <CockroachIcon size={20} color="#b91c1c" />
              <span className="text-lg text-red-700 font-medium font-boogaloo">DOGIE Virtual defunding bug</span>
            </div>
            <span className="text-base text-red-600 font-boogaloo">-{defundingAmount.toLocaleString()} points defunded</span>
          </div>
          {defundingAmount >= currentTarget && (
            <p className="text-xs text-red-600 mt-1 font-medium animate-pulse">⚠️ Your cause has been completely defunded!</p>
          )}
        </Card>

        {/* Money Counter */}
        <div ref={pigPotPanelRef}>
          <Card className="p-4 mb-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 font-boogaloo">
                {selectedAgency} Funding Goal: {currentTarget.toLocaleString()} points
              </h2>
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg text-gray-600 font-medium font-boogaloo">
                  Poke a Pork Piece for Points
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold font-boogaloo ${money < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {money < 0 
                      ? `-${Math.abs(money).toLocaleString()}`
                      : money.toLocaleString()
                    }
                  </span>
                  <span className="text-sm text-gray-600 font-medium font-boogaloo">
                    poke points
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="p-4 mb-4">
          <div 
            ref={gameAreaRef}
            className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden cursor-crosshair border-2 border-green-200"
            style={{ 
              height: GAME_AREA_HEIGHT,
              perspective: difficultyHard ? '1000px' : 'none',
              perspectiveOrigin: '50% 50%'
            }}
            onTouchStart={unlockAudio}
            onTouchEnd={unlockAudio}
            onMouseDown={unlockAudio}
            onClick={unlockAudio}
            onContextMenu={unlockAudio}
          >
            {/* Always-visible Gear Icon in Upper Right */}
            <div 
              className="absolute top-3 right-3 z-[9999] bg-white rounded-full p-2 shadow-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer select-none"
              onClick={handleGearClick}
              onTouchStart={unlockAudio}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleGearClick();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              data-gear-icon
              style={{ pointerEvents: 'auto' }}
            >
              <Settings className="w-5 h-5 text-gray-600 pointer-events-none" />
            </div>

            {/* Settings Overlay */}
            {showSettingsOverlay && (
              <div
                data-settings-overlay
                className="absolute top-3 right-3 w-80 max-h-[32rem] bg-white border-2 border-gray-300 rounded-lg shadow-xl z-[9998] overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  <h3 className="text-lg font-bold text-gray-900 font-boogaloo">Game Settings</h3>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1">


                  {/* Profile Section */}
                  <div className="mb-6">
                    <h4 className="text-xl font-medium text-gray-900 mb-3 font-boogaloo">Player Profile:</h4>
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-blue-200 hover:bg-blue-50 cursor-pointer transition-all"
                      onClick={handleNavigateToProfile}
                      onTouchStart={unlockAudio}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Edit Profile</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl animate-rock">
                              {(() => {
                                try {
                                  return localStorage.getItem('poke-n-pork-player-image') || '👤';
                                } catch {
                                  return '👤';
                                }
                              })()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(() => {
                                try {
                                  return localStorage.getItem('poke-n-pork-player-name') || 'Anonymous';
                                } catch {
                                  return 'Anonymous';
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-blue-600">
                        <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                      </div>
                    </div>
                  </div>

                  {/* Sound Toggle Section */}
                  <div className="mb-6">
                    <h4 className="text-xl font-medium text-gray-900 mb-3 font-boogaloo">Audio Settings:</h4>
                    <div 
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                      onClick={handleSoundToggle}
                      onTouchStart={unlockAudio}
                    >
                      <div className="flex items-center gap-3">
                        {soundEnabled ? (
                          <Volume2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <span className="font-medium text-gray-900">Game Sounds</span>
                          <p className="text-xs text-gray-500">
                            {soundEnabled ? 'All sounds enabled' : 'All sounds muted'}
                          </p>
                        </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors ${
                        soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </div>
                  </div>





                  {/* Pig Emoji Selection Section */}
                  <div className="mb-4">
                    <h4 className="text-xl font-medium text-gray-900 mb-3 font-boogaloo">Choose Your Target:</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {PIG_EMOJI_OPTIONS.map((option) => (
                        <div
                          key={option.emoji}
                          className={`flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50 transition-all ${
                            selectedPigEmoji === option.emoji 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200'
                          }`}
                          onClick={() => handlePigEmojiChange(option.emoji)}
                          onTouchStart={unlockAudio}
                        >
                          <span className="text-2xl mb-1">{option.emoji}</span>
                          <span className="text-xs text-gray-600 text-center leading-tight">{option.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Current: <span className="text-lg">{selectedPigEmoji}</span> {PIG_EMOJI_OPTIONS.find(o => o.emoji === selectedPigEmoji)?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Universal Victory System - Enhanced victory features */}
            <UniversalVictorySystem
              isGameActive={isGameActive}
              isGameWon={isGameWon}
              money={money}
              currentTarget={currentTarget}
              difficultyLevel={difficultyLevel}
              selectedAgency={selectedAgency}
              soundEnabled={soundEnabled}
              onSessionEnd={(success) => {
                if (success) {
                  setSessionSuccess(true);
                  setIsGameWon(true);
                  
                  // Save personal best score
                  try {
                    const savedPersonalBests = localStorage.getItem('poke-n-pork-personal-bests');
                    let personalBests = [];
                    
                    if (savedPersonalBests) {
                      personalBests = JSON.parse(savedPersonalBests);
                    }
                    
                    // Add new score
                    const newScore = {
                      score: money,
                      agency: selectedAgency,
                      level: difficultyLevel,
                      date: new Date().toISOString()
                    };
                    
                    personalBests.push(newScore);
                    
                    // Sort by score (highest first) and keep all scores
                    personalBests.sort((a, b) => b.score - a.score);
                    
                    // Save updated personal bests
                    localStorage.setItem('poke-n-pork-personal-bests', JSON.stringify(personalBests));
                  } catch (error) {
                    console.warn('Failed to save personal best score:', error);
                  }
                } else {
                  setSessionSuccess(false);
                  setSessionEnded(true);
                }
                setIsGameActive(false);
                setPigs([]);
                setPokedPolitician(null);
                setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));
                
                // Add the current agency to funded agencies if successful
                if (success) {
                  const newFundedAgencies = new Set(fundedAgencies);
                  newFundedAgencies.add(selectedAgency);
                  setFundedAgencies(newFundedAgencies);
                  localStorage.setItem('pig-n-poke-funded-agencies', JSON.stringify(Array.from(newFundedAgencies)));
                }
                
                // Clear all timers
                if (defundingTimerRef.current) {
                  clearTimeout(defundingTimerRef.current);
                  defundingTimerRef.current = null;
                }
                if (lawsuitTimerRef.current) {
                  clearTimeout(lawsuitTimerRef.current);
                  lawsuitTimerRef.current = null;
                }
              }}
              onNavigateToLeaderboard={onNavigateToLeaderboard}
              onNavigateToEvents={onNavigateToEvents}
              onShare={handleShare}
              audioContextRef={audioContextRef}
              initializeAudio={initializeAudio}
              showPlayerProfile={true}
              showShareButton={true}
              showLeaderboardButton={true}
              showEventsButton={true}
              enableConfetti={true}
            />

            {/* Universal Failure System */}
            <UniversalFailureSystem
              isGameActive={isGameActive}
              isGameWon={isGameWon}
              defundingAmount={defundingAmount}
              currentTarget={currentTarget}
              money={money}
              difficultyLevel={difficultyLevel}
              soundEnabled={soundEnabled}
              onSessionEnd={(success) => {
                if (!success) {
                  setSessionSuccess(false);
                  setSessionEnded(true);
                  setIsGameActive(false);
                  setPigs([]);
                  setPokedPolitician(null);
                  setLawsuit(prev => ({ ...prev, isActive: false, escalationLevel: 0, amount: INITIAL_LAWSUIT_AMOUNT }));
                  
                  // Clear all timers
                  if (defundingTimerRef.current) {
                    clearTimeout(defundingTimerRef.current);
                    defundingTimerRef.current = null;
                  }
                  if (lawsuitTimerRef.current) {
                    clearTimeout(lawsuitTimerRef.current);
                    lawsuitTimerRef.current = null;
                  }
                  if (pigSpawnTimerRef.current) {
                    clearTimeout(pigSpawnTimerRef.current);
                    pigSpawnTimerRef.current = null;
                  }
                }
              }}
              audioContextRef={audioContextRef}
              initializeAudio={initializeAudio}
            />







            {!isGameWon && !isGameActive && pigs.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="text-center">
                  <div
                    onClick={resumeGame}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      unlockAudio();
                      resumeGame();
                    }}
                    className="cursor-pointer transform hover:scale-110 transition-transform duration-200 p-4"
                    role="button"
                    tabIndex={0}
                  >
                    <Pause 
                      className="w-12 h-12 text-white pointer-events-none" 
                    />
                  </div>
                </div>
              </div>
            )}



            {/* Politician Name and Value Display */}
            {pokedPolitician && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="relative bg-gradient-to-r from-red-50 to-orange-50 text-red-700 px-4 py-2 rounded-lg shadow-lg animate-bounce overflow-visible">
                  <div className="text-center">
                    <p className="text-3xl text-red-600 font-boogaloo">{currentStopItMessage}</p>
                    <p className="text-base font-boogaloo">said {pokedPolitician.name}</p>
                    <p className="text-xl text-red-600 font-boogaloo">+{pokedPolitician.value.toLocaleString()} points</p>
                  </div>
                </div>
              </div>
            )}

            {pigs.map((pigPosition) => (
              <div
                key={pigPosition.id}
                className={`absolute cursor-pointer transition-all duration-100 transform hover:scale-110 rounded-full flex items-center justify-center select-none ${
                  clickedPig === pigPosition.id ? 'scale-150 animate-pulse' : ''
                }`}
                style={{
                  left: pigPosition.x,
                  top: pigPosition.y,
                  width: pigPosition.pig.size,
                  height: pigPosition.pig.size,
                  transform: difficultyHard 
                    ? `scale(${clickedPig === pigPosition.id ? 1.5 : 1}) rotateX(${pigPosition.rotationX * 0.8}deg) rotateY(${pigPosition.rotationY * 0.8}deg) rotateZ(${pigPosition.rotationZ * 0.6}deg)`
                    : `scale(${clickedPig === pigPosition.id ? 1.5 : 1}) rotate(${pigPosition.rotation * 0.1}deg)`,
                  transition: clickedPig === pigPosition.id ? 'all 0.3s ease' : 'none',
                  transformStyle: difficultyHard ? 'preserve-3d' as const : 'flat' as const,
                }}
                onClick={(e) => handlePigClick(pigPosition, e)}
              >
                <div className={`w-full h-full rounded-full ${pigPosition.pig.color} border-2 border-white flex items-center justify-center relative overflow-hidden ${
                  difficultyHard ? 'shadow-2xl' : 'shadow-lg'
                }`}
                     style={{ 
                       transformStyle: difficultyHard ? 'preserve-3d' as const : 'flat' as const,
                       transform: difficultyHard ? `rotateX(${pigPosition.rotationX * 0.2}deg) rotateY(${pigPosition.rotationY * 0.2}deg)` : 'none'
                     }}>
                  {/* Movement trail effect - enhanced for 3D */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent ${
                    difficultyHard ? 'opacity-30 animate-pulse' : 'opacity-20 animate-pulse'
                  }`}></div>
                  {difficultyHard && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
                  )}
                  <span className="text-2xl relative z-10" style={{ 
                    transformStyle: difficultyHard ? 'preserve-3d' as const : 'flat' as const,
                    transform: difficultyHard ? `translateZ(${Math.sin(pigPosition.rotationX * 0.01) * 5}px)` : 'none'
                  }}>{selectedPigEmoji}</span>
                </div>
              </div>
            ))}

            {/* Play Button Overlay - Shows when game hasn't started yet */}
            {!gameHasStarted && !isGameWon && !isGameActive && (
              <div className="absolute inset-0 flex items-center justify-center z-39">
                <div className="text-center">
                  <div
                    onClick={startNewSession}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      unlockAudio();
                      startNewSession();
                    }}
                    className="cursor-pointer transform hover:scale-110 transition-all duration-200 p-4"
                    role="button"
                    tabIndex={0}
                  >
                    <Play
                      className="w-24 h-24 text-white stroke-2 stroke-white fill-transparent drop-shadow-2xl pointer-events-none"
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Start Poking Message Overlay */}
            {showStartMessage && !isGameWon && gameHasStarted && (
              <div className={`absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-500 ease-in-out ${
                startMessageFading ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-green-700 font-boogaloo">Start Poking!</h2>
                </div>
              </div>
            )}



            {/* Trump Lawsuit Panel Overlay */}
            {lawsuit.isActive && !isGameWon && lawsuitsEnabled && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-600 rounded-xl shadow-2xl max-w-md mx-4 p-4">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-red-700 mb-1 font-boogaloo">{getLawsuitMessage()}</h2>
                    <p className="text-xl text-red-600 mb-2 font-boogaloo">{getLawsuitDescription()}</p>
                    
                    <p className="text-3xl font-bold text-red-800 mb-2 font-boogaloo">
                      Settlement Demand: {lawsuit.amount.toLocaleString()} points
                    </p>
                    {lawsuit.amount > money && money >= 0 && (
                      <p className="text-sm text-red-600 mb-4 font-boogaloo">
                        This will put you in debt!
                      </p>
                    )}
                    
                    {/* Buttons side by side */}
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={handleLawsuitSettle}
                        onTouchStart={unlockAudio}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                      >
                        SETTLE
                      </Button>
                      <Button 
                        onClick={handleLawsuitRefuse}
                        onTouchStart={unlockAudio}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2"
                      >
                        REFUSE TO PAY
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Lawsuit Dismissal Screen */}
            {showFinalLawsuitScreen && !isGameWon && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-4 border-orange-600 rounded-xl shadow-2xl max-w-md mx-4 p-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-orange-700 mb-3 font-boogaloo">
                      The great and all powerful orange one says "What Lawsuit?"
                    </h2>
                    <p className="text-lg text-orange-600 mb-4 font-boogaloo">
                      "I've never heard of that lawsuit."
                    </p>
                    
                    {/* Single Okay button */}
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleFinalLawsuitOkay}
                        onTouchStart={unlockAudio}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2"
                      >
                        OKAY
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>



        {/* Difficulty Level and Game Controls Panel */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            {/* Left - Difficulty Level */}
            <div className="flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <span className="text-lg font-medium text-gray-600 mr-1 font-boogaloo">Level</span>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 text-base"
                onClick={() => difficultyLevel > 1 && handleDifficultyLevelChange(difficultyLevel - 1)}
                onTouchStart={unlockAudio}
                disabled={difficultyLevel <= 1}
              >
                -
              </Button>
              <span className="text-2xl font-bold text-blue-600 min-w-[2rem] text-center font-boogaloo">
                {difficultyLevel}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 text-base"
                onClick={() => difficultyLevel < 12 && handleDifficultyLevelChange(difficultyLevel + 1)}
                onTouchStart={unlockAudio}
                disabled={difficultyLevel >= 12}
              >
                +
              </Button>
            </div>
            
            {/* Right - Game Controls */}
            <div className="flex gap-2 flex-row">
              {isGameWon ? (
                <Button 
                  onClick={resetGameKeepDifficulty}
                  onTouchStart={unlockAudio}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 font-boogaloo"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Play Again
                </Button>
              ) : (!gameHasStarted && !isGameActive && pigs.length === 0) ? (
                <Button 
                  onClick={startNewSession}
                  onTouchStart={unlockAudio}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 font-boogaloo"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start Game
                </Button>
              ) : (!isGameActive && pigs.length === 0) ? (
                <Button 
                  onClick={startNewSession}
                  onTouchStart={unlockAudio}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 font-boogaloo"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {sessionEnded ? 'Try Again' : 'Start Session'}
                </Button>
              ) : isGameActive ? (
                <Button 
                  onClick={pauseGame}
                  onTouchStart={unlockAudio}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 font-boogaloo"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              ) : (
                <Button 
                  onClick={resumeGame}
                  onTouchStart={unlockAudio}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 font-boogaloo"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </Button>
              )}

            </div>
          </div>
        </Card>

        {/* Events Panel - Now positioned after level controls */}
        <EventsPanel
          selectedAgency={propSelectedAgency || selectedAgency}
          onNavigateToEvents={onNavigateToEvents}
          onNavigateToLeaderboard={onNavigateToLeaderboard}
          onUnlockAudio={unlockAudio}
          className="mb-4"
        />

      </div>
    </div>
  );
}