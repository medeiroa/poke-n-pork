// Example player profiles for starting data
export const examplePlayerProfiles = [
  { name: 'GameMaster_TX', image: '🎮' },
  { name: 'PokeChamp_CA', image: '🏆' },
  { name: 'PigHunter_NY', image: '🎯' },
  { name: 'DefundPro_FL', image: '💰' },
  { name: 'ClickMaster_WA', image: '⚡' },
  { name: 'PorkSlayer_IL', image: '🗡️' },
  { name: 'CauseWarrior_OH', image: '⚔️' },
  { name: 'PigCatcher_MI', image: '🎪' },
  { name: 'FundSaver_PA', image: '🛡️' },
  { name: 'ClickLegend_GA', image: '👑' },
  { name: 'PokeElite_AZ', image: '🎊' },
  { name: 'MasterPig_CO', image: '🌟' },
  { name: 'ProPoker_OR', image: '🔥' },
  { name: 'CauseCrusher_NV', image: '💎' },
  { name: 'PigPro_UT', image: '🚀' }
];

import { HUMANITARIAN_CAUSES } from './causes-constants';

// Humanitarian causes that appear in the game (using shared constants)
export const AVAILABLE_AGENCIES_FROM_GAME = HUMANITARIAN_CAUSES.map(cause => cause.name);