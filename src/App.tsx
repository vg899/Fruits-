/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Store, 
  Layers, 
  Settings, 
  Coins, 
  Trophy, 
  Home, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Music, 
  Vibrate, 
  ChevronLeft,
  Zap,
  Flame,
  Snowflake,
  Star,
  Skull
} from 'lucide-react';

// --- Constants & Types ---

enum GameState {
  HOME = 'HOME',
  GAMEPLAY = 'GAMEPLAY',
  LEVELS = 'LEVELS',
  SHOP = 'SHOP',
  SETTINGS = 'SETTINGS',
  GAMEOVER = 'GAMEOVER'
}

type Language = 'en' | 'hi';

const TRANSLATIONS = {
  en: {
    play: 'PLAY',
    store: 'STORE',
    levels: 'LEVELS',
    settings: 'SETTINGS',
    gameOver: 'GAME OVER',
    retry: 'RETRY',
    coins: 'COINS',
    win: 'YOU WIN',
    nextLevel: 'NEXT LEVEL',
    best: 'BEST',
    score: 'SCORE',
    shop_title: 'ITEM SHOP',
    locked: 'LOCKED',
    buy: 'BUY',
    select: 'SELECT',
    selected: 'SELECTED',
    tabs: {
      blades: 'BLADES',
      backgrounds: 'BG',
      effects: 'FX'
    },
    settings_title: 'SETTINGS',
    music: 'MUSIC',
    sound: 'SOUND',
    vibration: 'VIBRATION',
    language: 'LANGUAGE',
    reset: 'RESET PROGRESS',
    home: 'HOME'
  },
  hi: {
    play: 'खेलें',
    store: 'स्टोर',
    levels: 'लेवल्स',
    settings: 'सेटिंग्स',
    gameOver: 'गेम ओवर',
    retry: 'पुनः खेलें',
    coins: 'सिक्के',
    win: 'जीत गए',
    nextLevel: 'अगला लेवल',
    best: 'सर्वश्रेष्ठ',
    score: 'स्कोर',
    shop_title: 'आइटम स्टोर',
    locked: 'लॉक',
    buy: 'खरीदें',
    select: 'चुनें',
    selected: 'चुना हुआ',
    tabs: {
      blades: 'तलवारें',
      backgrounds: 'बैकग्राउंड',
      effects: 'इफेक्ट्स'
    },
    settings_title: 'सेटिंग्स',
    music: 'संगीत',
    sound: 'आवाज़',
    vibration: 'वाइब्रेशन',
    language: 'भाषा',
    reset: 'प्रगति रीसेट करें',
    home: 'होम'
  }
};

const FRUITS = [
  { id: 'apple', icon: '🍎', color: '#ff4d4d', juice: '#ff0000' },
  { id: 'watermelon', icon: '🍉', color: '#4caf50', juice: '#e91e63' },
  { id: 'banana', icon: '🍌', color: '#ffeb3b', juice: '#fff176' },
  { id: 'orange', icon: '🍊', color: '#ff9800', juice: '#ff6d00' },
  { id: 'pineapple', icon: '🍍', color: '#fbc02d', juice: '#fff59d' },
  { id: 'mango', icon: '🥭', color: '#ffc107', juice: '#ffd54f' },
  { id: 'grapes', icon: '🍇', color: '#9c27b0', juice: '#ba68c8' }
];

const BLADES = [
  { id: 'basic', name: 'Basic Blade', price: 0, color: '#ffffff', effect: 'default' },
  { id: 'fire', name: 'Fire Blade', price: 500, color: '#ff5722', effect: 'flame' },
  { id: 'ice', name: 'Ice Blade', price: 750, color: '#03a9f4', effect: 'ice' },
  { id: 'thunder', name: 'Thunder Blade', price: 1000, color: '#ffeb3b', effect: 'spark' },
  { id: 'gold', name: 'Golden Blade', price: 2000, color: '#ffd700', effect: 'glitter' }
];

const BACKGROUNDS = [
  { id: 'default', name: 'Classic Dark', price: 0, url: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?q=80&w=2070&auto=format&fit=crop' },
  { id: 'forest', name: 'Deep Forest', price: 500, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop' },
  { id: 'desert', name: 'Golden Sands', price: 1000, url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070&auto=format&fit=crop' },
  { id: 'ocean', name: 'Deep Blue', price: 1500, url: 'https://images.unsplash.com/photo-1518837691465-381481d1e9e5?q=80&w=2070&auto=format&fit=crop' },
  { id: 'night', name: 'Midnight', price: 2000, url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop' }
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  icon: string;
  rotation: number;
  rotationSpeed: number;
  side: 'left' | 'right';
  life: number;
}

interface GameObject {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'fruit' | 'bomb';
  fruitData?: typeof FRUITS[0];
  rotation: number;
  rotationSpeed: number;
  isSliced: boolean;
}

// --- Utils ---

const saveToLocal = (key: string, value: any) => {
  localStorage.setItem(`fruit_slice_${key}`, JSON.stringify(value));
};

const getFromLocal = (key: string, defaultValue: any) => {
  const saved = localStorage.getItem(`fruit_slice_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};

// --- Main Component ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.HOME);
  const [coins, setCoins] = useState<number>(() => getFromLocal('coins', 0));
  const [lang, setLang] = useState<Language>(() => getFromLocal('lang', 'en'));
  const [highScore, setHighScore] = useState<number>(() => getFromLocal('highScore', 0));
  const [unlockedLevels, setUnlockedLevels] = useState<number>(() => getFromLocal('unlockedLevels', 1));
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [unlockedBlades, setUnlockedBlades] = useState<string[]>(() => getFromLocal('unlockedBlades', ['basic']));
  const [selectedBlade, setSelectedBlade] = useState<string>(() => getFromLocal('selectedBlade', 'basic'));
  const [unlockedBackgrounds, setUnlockedBackgrounds] = useState<string[]>(() => getFromLocal('unlockedBackgrounds', ['default']));
  const [selectedBackground, setSelectedBackground] = useState<string>(() => getFromLocal('selectedBackground', 'default'));
  const [gameResult, setGameResult] = useState<{ isWin: boolean, score: number } | null>(null);
  const [settings, setSettings] = useState(() => getFromLocal('settings', {
    music: true,
    sound: true,
    vibration: true
  }));

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    saveToLocal('coins', coins);
    saveToLocal('lang', lang);
    saveToLocal('highScore', highScore);
    saveToLocal('unlockedLevels', unlockedLevels);
    saveToLocal('unlockedBlades', unlockedBlades);
    saveToLocal('selectedBlade', selectedBlade);
    saveToLocal('unlockedBackgrounds', unlockedBackgrounds);
    saveToLocal('selectedBackground', selectedBackground);
    saveToLocal('settings', settings);
  }, [coins, lang, highScore, unlockedLevels, unlockedBlades, selectedBlade, unlockedBackgrounds, selectedBackground, settings]);

  const handlePlayLevel = (level: number) => {
    setCurrentLevel(level);
    setGameState(GameState.GAMEPLAY);
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure? This will reset all your progress.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-sans select-none touch-none" style={{ background: 'radial-gradient(circle, #2c1a0e 0%, #0d0603 100%)' }}>
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-[2px] scale-110" 
          style={{ backgroundImage: `url('${BACKGROUNDS.find(b => b.id === selectedBackground)?.url}')` }}
        />
        
        {/* Background Decor Fruits */}
        <div className="absolute top-20 left-20 text-[120px] opacity-10 blur-md rotate-12 select-none pointer-events-none">🍉</div>
        <div className="absolute bottom-40 right-10 text-[100px] -rotate-12 opacity-10 blur-sm select-none pointer-events-none">🍍</div>
        <div className="absolute top-1/2 right-1/4 text-[80px] rotate-45 opacity-5 blur-xl select-none pointer-events-none">🍎</div>
        <div className="absolute bottom-10 left-1/4 text-[70px] -rotate-45 opacity-10 blur-md select-none pointer-events-none">🍌</div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === GameState.HOME && (
          <HomeView key="home" t={t} lang={lang} setGameState={setGameState} />
        )}
        {gameState === GameState.GAMEPLAY && (
          <GamePlayView 
            key="gameplay" 
            t={t} 
            level={currentLevel} 
            selectedBlade={selectedBlade}
            settings={settings}
            onGameOver={(score, earnedCoins) => {
              setHighScore(prev => Math.max(prev, score));
              setCoins(prev => prev + earnedCoins);
              setGameResult({ isWin: false, score });
              setGameState(GameState.GAMEOVER);
            }} 
            onLevelWin={(score, earnedCoins) => {
              setHighScore(prev => Math.max(prev, score));
              setCoins(prev => prev + earnedCoins);
              setGameResult({ isWin: true, score });
              if (currentLevel === unlockedLevels) {
                setUnlockedLevels(prev => Math.min(prev + 1, 100));
              }
              setGameState(GameState.GAMEOVER);
            }}
            setGameState={setGameState}
          />
        )}
        {gameState === GameState.LEVELS && (
          <LevelsView 
            key="levels" 
            t={t} 
            unlockedLevels={unlockedLevels} 
            onPlay={handlePlayLevel} 
            onBack={() => setGameState(GameState.HOME)} 
          />
        )}
        {gameState === GameState.SHOP && (
          <ShopView 
            key="shop" 
            t={t} 
            coins={coins} 
            setCoins={setCoins}
            unlockedBlades={unlockedBlades}
            setUnlockedBlades={setUnlockedBlades}
            selectedBlade={selectedBlade}
            setSelectedBlade={setSelectedBlade}
            unlockedBackgrounds={unlockedBackgrounds}
            setUnlockedBackgrounds={setUnlockedBackgrounds}
            selectedBackground={selectedBackground}
            setSelectedBackground={setSelectedBackground}
            onBack={() => setGameState(GameState.HOME)} 
          />
        )}
        {gameState === GameState.SETTINGS && (
          <SettingsView 
            key="settings" 
            t={t} 
            lang={lang} 
            setLang={setLang} 
            settings={settings}
            setSettings={setSettings}
            onReset={resetProgress}
            onBack={() => setGameState(GameState.HOME)} 
          />
        )}
        {gameState === GameState.GAMEOVER && (
          <GameOverView 
            key="gameover" 
            t={t} 
            highScore={highScore}
            result={gameResult}
            onRetry={() => setGameState(GameState.GAMEPLAY)}
            onNextLevel={() => {
              setCurrentLevel(prev => Math.min(prev + 1, 100));
              setGameState(GameState.GAMEPLAY);
            }}
            onHome={() => setGameState(GameState.HOME)}
          />
        )}
      </AnimatePresence>

      {/* Global Top UI (Coins) - Hidden in gameplay */}
      <AnimatePresence>
        {gameState !== GameState.GAMEPLAY && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border-2 border-yellow-500/50 flex items-center gap-3 pointer-events-auto shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
              <span className="text-2xl drop-shadow-md">🪙</span>
              <span className="text-white font-black text-2xl italic tracking-tighter tabular-nums">{coins.toLocaleString()}</span>
              {lang === 'hi' && <span className="text-[#ffd700] text-sm font-bold ml-1">{t.coins}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Home Components ---

function HomeView({ t, lang, setGameState }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6"
    >
      <motion.div 
        initial={{ y: -100, scale: 0.8 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="relative mb-16 floating"
      >
        <div 
          className=" wood-board text-center z-10 border-[6px] border-[#3d2611] px-16 py-10 rounded-2xl shadow-[0_15px_0_#2a1a0c,0_20px_30px_rgba(0,0,0,0.5)] relative overflow-visible"
          style={{ background: 'linear-gradient(45deg, #5d3a1a, #8b5a2b, #5d3a1a)' }}
        >
          <div className="absolute -top-10 -left-12 text-8xl drop-shadow-2xl brightness-125">🔪</div>
          <h1 className="text-7xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_6px_0_rgba(0,0,0,0.8)] flex flex-col items-center leading-none">
            <span className="mb-1">FRUIT</span>
            <span>SLICE</span>
          </h1>
          <p className="text-[#ffd700] text-sm font-bold tracking-[0.3em] mt-3 uppercase opacity-90 drop-shadow-md">Master Slicer 2026</p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6 w-full max-w-sm px-4">
        <GlossyButton 
          variant="green"
          onClick={() => setGameState(GameState.GAMEPLAY)}
        >
          <span className="mr-3 text-3xl">▶</span> {lang === 'hi' ? 'खेलें' : 'PLAY'}
        </GlossyButton>
        
        <div className="grid grid-cols-2 gap-5">
          <GlossyButton 
            variant="orange"
            size="small"
            onClick={() => setGameState(GameState.SHOP)}
          >
            <span className="mr-2 text-2xl">🛒</span> {lang === 'hi' ? 'स्टोर' : 'STORE'}
          </GlossyButton>

          <GlossyButton 
            variant="blue"
            size="small"
            onClick={() => setGameState(GameState.LEVELS)}
          >
            <span className="mr-2 text-2xl">🗺️</span> {lang === 'hi' ? 'लेवल्स' : 'LEVELS'}
          </GlossyButton>
        </div>

        <GlossyButton 
          variant="purple"
          onClick={() => setGameState(GameState.SETTINGS)}
        >
          <span className="mr-3 text-2xl">⚙️</span> {lang === 'hi' ? 'सेटिंग्स' : 'SETTINGS'}
        </GlossyButton>
      </div>
      
      {/* Floating UI Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw`, rotate: 0 }}
            animate={{ 
              y: '-20vh', 
              rotate: 720,
              x: `${(Math.random() - 0.5) * 40 + 50}vw` 
            }}
            transition={{ 
              duration: 8 + Math.random() * 7, 
              repeat: Infinity, 
              delay: i * 2,
              ease: 'linear'
            }}
            className="text-5xl drop-shadow-2xl opacity-40 blur-[1px]"
          >
            {FRUITS[i % FRUITS.length].icon}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Menu View Shell ---

function MenuContainer({ title, onBack, children }: any) {
  return (
    <motion.div 
      initial={{ y: '100vh' }}
      animate={{ y: 0 }}
      exit={{ y: '100vh' }}
      transition={{ type: 'spring', damping: 20 }}
      className="absolute inset-0 z-40 bg-[#1a0f00] flex flex-col p-6 overflow-hidden"
    >
      <div className="flex items-center gap-5 mb-8">
        <button onClick={onBack} className="p-3 bg-yellow-600 rounded-full text-white shadow-xl active:scale-90 transition-all border-b-4 border-yellow-800">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <h2 className="text-4xl font-black text-white italic drop-shadow-2xl uppercase tracking-tighter">{title}</h2>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

function LevelsView({ t, unlockedLevels, onPlay, onBack }: any) {
  return (
    <MenuContainer title={t.levels} onBack={onBack}>
      <div className="flex-1 overflow-y-auto pr-3 grid grid-cols-4 sm:grid-cols-5 gap-4 pb-12">
        {[...Array(100)].map((_, i) => {
          const levelNum = i + 1;
          const isLocked = levelNum > unlockedLevels;
          return (
            <button
              key={i}
              disabled={isLocked}
              onClick={() => onPlay(levelNum)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-2xl font-black text-2xl shadow-xl transition-all active:scale-90 relative border-b-8
                ${isLocked 
                  ? 'bg-gray-800 text-gray-600 border-gray-950 opacity-50 cursor-not-allowed' 
                  : 'bg-yellow-500 text-yellow-950 border-yellow-700 hover:bg-yellow-400'
                }
              `}
            >
              {isLocked ? <Skull className="w-8 h-8 opacity-20" /> : levelNum}
              {!isLocked && i < unlockedLevels - 1 && (
                <div className="absolute -top-1 -right-1">
                  <Star className="w-6 h-6 fill-white text-white drop-shadow-md" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </MenuContainer>
  );
}

function ShopView({ 
  t, 
  coins, 
  setCoins, 
  unlockedBlades, 
  setUnlockedBlades, 
  selectedBlade, 
  setSelectedBlade, 
  unlockedBackgrounds,
  setUnlockedBackgrounds,
  selectedBackground,
  setSelectedBackground,
  onBack 
}: any) {
  const [tab, setTab] = useState<'blades' | 'bg' | 'fx'>('blades');

  const handleBuyBlade = (blade: any) => {
    if (coins >= blade.price) {
      setCoins(prev => prev - blade.price);
      setUnlockedBlades(prev => [...prev, blade.id]);
      setSelectedBlade(blade.id);
    }
  };

  const handleBuyBG = (bg: any) => {
    if (coins >= bg.price) {
      setCoins(prev => prev - bg.price);
      setUnlockedBackgrounds(prev => [...prev, bg.id]);
      setSelectedBackground(bg.id);
    }
  };

  return (
    <MenuContainer title={t.shop_title} onBack={onBack}>
      <div className="flex gap-2 mb-8 p-1.5 bg-black/40 rounded-full border border-white/5">
        {Object.entries(t.tabs).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`
              flex-1 py-4 px-4 rounded-full font-black text-sm transition-all
              ${tab === key ? 'bg-yellow-500 text-yellow-950 shadow-lg' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            {label as string}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-12 pr-2">
        {tab === 'blades' && BLADES.map(blade => {
          const isUnlocked = unlockedBlades.includes(blade.id);
          const isSelected = selectedBlade === blade.id;
          return (
            <motion.div 
              layout
              key={blade.id} 
              className="bg-black/50 backdrop-blur-sm border-2 border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-2xl transition-all"
            >
              <div className="flex items-center gap-5">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner relative border-2"
                  style={{ backgroundColor: `${blade.color}22`, borderColor: `${blade.color}44` }}
                >
                  <Zap className="w-10 h-10" style={{ color: blade.color, fill: blade.color }} />
                  {blade.id === 'fire' && <Flame className="absolute -top-3 -right-3 w-8 h-8 text-orange-500 fill-orange-500 drop-shadow-lg" />}
                  {blade.id === 'ice' && <Snowflake className="absolute -top-3 -right-3 w-8 h-8 text-blue-400 fill-blue-400 drop-shadow-lg" />}
                </div>
                <div>
                  <h3 className="text-white font-black text-xl italic tracking-tight">{blade.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-black uppercase tracking-widest">{blade.effect}</span>
                  </div>
                </div>
              </div>

              {!isUnlocked ? (
                <button 
                  onClick={() => handleBuyBlade(blade)}
                  disabled={coins < blade.price}
                  className={`
                    flex flex-col items-center justify-center px-6 py-3 rounded-2xl border-b-6 shadow-xl transition-all active:scale-95
                    ${coins >= blade.price 
                      ? 'bg-green-500 border-green-700 text-white' 
                      : 'bg-gray-800 border-gray-950 text-gray-600 cursor-not-allowed opacity-50'}
                  `}
                >
                  <div className="flex items-center gap-1.5 font-black text-xl italic">
                    <Coins className="w-5 h-5 fill-yellow-400" /> {blade.price}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.buy}</span>
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedBlade(blade.id)}
                  className={`
                    px-8 py-4 rounded-2xl border-b-6 font-black italic text-xl transition-all active:scale-95 shadow-xl
                    ${isSelected 
                      ? 'bg-yellow-500 border-yellow-700 text-yellow-950' 
                      : 'bg-blue-600 border-blue-800 text-white'}
                  `}
                >
                  {isSelected ? t.selected : t.select}
                </button>
              )}
            </motion.div>
          );
        })}

        {tab === 'bg' && BACKGROUNDS.map(bg => {
          const isUnlocked = unlockedBackgrounds.includes(bg.id);
          const isSelected = selectedBackground === bg.id;
          return (
            <motion.div 
              layout
              key={bg.id} 
              className="bg-black/50 backdrop-blur-sm border-2 border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-2xl transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden border-2 border-white/10">
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xl italic tracking-tight">{bg.name}</h3>
                </div>
              </div>

              {!isUnlocked ? (
                <button 
                  onClick={() => handleBuyBG(bg)}
                  disabled={coins < bg.price}
                  className={`
                    flex flex-col items-center justify-center px-6 py-3 rounded-2xl border-b-6 shadow-xl transition-all active:scale-95
                    ${coins >= bg.price 
                      ? 'bg-green-500 border-green-700 text-white' 
                      : 'bg-gray-800 border-gray-950 text-gray-600 cursor-not-allowed opacity-50'}
                  `}
                >
                  <div className="flex items-center gap-1.5 font-black text-xl italic">
                    <Coins className="w-5 h-5 fill-yellow-400" /> {bg.price}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.buy}</span>
                </button>
              ) : (
                <button 
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`
                    px-8 py-4 rounded-2xl border-b-6 font-black italic text-xl transition-all active:scale-95 shadow-xl
                    ${isSelected 
                      ? 'bg-yellow-500 border-yellow-700 text-yellow-950' 
                      : 'bg-blue-600 border-blue-800 text-white'}
                  `}
                >
                  {isSelected ? t.selected : t.select}
                </button>
              )}
            </motion.div>
          );
        })}

        {tab === 'fx' && [
          { id: 'fx1', name: 'Juice Sparkle', icon: '✨' },
          { id: 'fx2', name: 'Neon Trail', icon: '🌈' },
          { id: 'fx3', name: 'Explosion Pack', icon: '💥' }
        ].map(fx => (
          <motion.div 
            layout
            key={fx.id} 
            className="bg-black/50 backdrop-blur-sm border-2 border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-2xl transition-all opacity-60"
          >
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner text-4xl grayscale">
                {fx.icon}
              </div>
              <div>
                <h3 className="text-white font-black text-xl italic tracking-tight">{fx.name}</h3>
                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1 block">Coming Soon</span>
              </div>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-gray-900 border-b-6 border-black text-gray-600 font-black italic text-sm">
              LOCKED
            </div>
          </motion.div>
        ))}

        <div className="pt-8 pb-12">
          <GlossyButton 
            variant="blue" 
            onClick={onBack}
          >
            <Home className="w-8 h-8 fill-white" /> {t.home}
          </GlossyButton>
        </div>
      </div>
    </MenuContainer>
  );
}

function SettingsView({ t, lang, setLang, settings, setSettings, onReset, onBack }: any) {
  const toggle = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <MenuContainer title={t.settings_title} onBack={onBack}>
      <div className="space-y-4">
        <SettingToggle label={t.music} active={settings.music} onToggle={() => toggle('music')} icon={<Music />} />
        <SettingToggle label={t.sound} active={settings.sound} onToggle={() => toggle('sound')} icon={<Volume2 />} />
        <SettingToggle label={t.vibration} active={settings.vibration} onToggle={() => toggle('vibration')} icon={<Vibrate />} />
        
        <div className="bg-black/40 rounded-[2rem] p-6 flex flex-col gap-5 border border-white/5">
          <label className="text-gray-500 font-black uppercase text-xs tracking-[0.2em] px-2">{t.language}</label>
          <div className="flex gap-3">
            {[ 
              { id: 'en', label: 'ENGLISH' }, 
              { id: 'hi', label: 'हिन्दी' } 
            ].map(l => (
              <button 
                key={l.id}
                onClick={() => setLang(l.id as Language)}
                className={`flex-1 py-5 rounded-2xl font-black italic text-xl border-b-4 transition-all shadow-xl active:scale-95 ${lang === l.id ? 'bg-yellow-500 border-yellow-700 text-yellow-950' : 'bg-gray-800 border-gray-950 text-gray-500'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={onReset}
          className="w-full py-6 mt-12 bg-red-950/30 border-2 border-red-900/50 rounded-3xl text-red-500 font-black italic text-xl hover:bg-red-900/40 transition-all flex items-center justify-center gap-3 shadow-2xl"
        >
          <RotateCcw className="w-6 h-6" /> {t.reset}
        </button>
      </div>
    </MenuContainer>
  );
}

function SettingToggle({ label, active, onToggle, icon }: any) {
  return (
    <div className="bg-black/50 border-2 border-white/5 rounded-[2rem] p-5 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl shadow-inner ${active ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-600'}`}>
          {React.cloneElement(icon, { size: 30 })}
        </div>
        <span className="text-white font-black text-2xl italic tracking-tight">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`w-20 h-10 rounded-full p-1.5 transition-all shadow-inner ${active ? 'bg-green-500' : 'bg-gray-800'}`}
      >
        <div className={`w-7 h-7 bg-white rounded-full transition-all flex items-center justify-center shadow-xl ${active ? 'translate-x-10' : 'translate-x-0'}`}>
          {active ? <div className="w-3 h-3 bg-green-500 rounded-full" /> : <div className="w-3 h-3 bg-gray-400 rounded-full" />}
        </div>
      </button>
    </div>
  );
}

// --- Gameplay Engine View ---

function GamePlayView({ t, level, selectedBlade, settings, onGameOver, onLevelWin, setGameState }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bladeColor = BLADES.find(b => b.id === selectedBlade)?.color || '#fff';
    
    let animationFrameId: number;
    let fruits: GameObject[] = [];
    let pieces: Piece[] = [];
    let particles: Particle[] = [];
    let trail: { x: number, y: number, time: number }[] = [];
    let isMouseDown = false;
    let lastX = 0; let lastY = 0;
    let lastThrowTime = Date.now();
    let internalScore = 0;
    let internalLives = 3;
    let internalCombo = 0;
    let comboTimeout: any = null;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const spawnObject = () => {
      const isBomb = Math.random() < 0.12 + (level * 0.006);
      const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      
      fruits.push({
        id: Math.random().toString(),
        x: Math.random() * (canvas.width - 120) + 60,
        y: canvas.height + 60,
        vx: (Math.random() - 0.5) * 8,
        vy: -(13 + Math.random() * 8 + (level * 0.12)),
        radius: 45,
        type: isBomb ? 'bomb' : 'fruit',
        fruitData: isBomb ? undefined : fruit,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        isSliced: false
      });
    };

    const handleSliceCollision = (x1: number, y1: number, x2: number, y2: number) => {
      fruits.forEach(obj => {
        if (obj.isSliced) return;
        const dist = distToSegment({ x: obj.x, y: obj.y }, { x: x1, y: y1 }, { x: x2, y: y2 });
        if (dist < obj.radius) {
          obj.isSliced = true;
          if (settings.vibration && navigator.vibrate) navigator.vibrate(obj.type === 'bomb' ? [100, 50, 100] : 20);
          if (obj.type === 'bomb') {
            createExplosion(obj.x, obj.y);
            internalLives = 0; setLives(0);
            setTimeout(() => onGameOver(internalScore, Math.floor(internalScore / 10)), 1200);
          } else {
            internalScore += 10; setScore(internalScore);
            internalCombo++; setCombo(internalCombo);
            clearTimeout(comboTimeout);
            comboTimeout = setTimeout(() => { internalCombo = 0; setCombo(0); }, 900);
            createSplash(obj.x, obj.y, obj.fruitData!.juice);
            createPieces(obj);

            if (internalScore >= level * 100) {
              onLevelWin(internalScore, Math.floor(internalScore / 5));
            }
          }
        }
      });
    };

    const createSplash = (x: number, y: number, color: string) => {
      for (let i = 0; i < 25; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 18,
          vy: (Math.random() - 0.5) * 18,
          size: Math.random() * 7 + 3,
          color, life: 1.0
        });
      }
    };

    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 60; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          size: Math.random() * 12 + 6,
          color: i % 2 === 0 ? '#ff5000' : '#ffdd00',
          life: 1.8
        });
      }
    };

    const createPieces = (obj: GameObject) => {
      const sides: ('left' | 'right')[] = ['left', 'right'];
      sides.forEach(side => {
        pieces.push({
          x: obj.x, y: obj.y,
          vx: (side === 'left' ? -6 : 6) + (Math.random() - 0.5) * 4,
          vy: obj.vy - 2,
          icon: obj.fruitData!.icon,
          rotation: obj.rotation,
          rotationSpeed: side === 'left' ? -0.12 : 0.12,
          side, life: 1.0
        });
      });
    };

    const update = () => {
      const now = Date.now();
      if (now - lastThrowTime > Math.max(400, 2200 - level * 35) && internalLives > 0) {
        const count = 1 + Math.floor(Math.random() * (1 + Math.floor(level / 12)));
        for (let i = 0; i < count; i++) spawnObject();
        lastThrowTime = now;
      }

      fruits = fruits.filter(obj => {
        obj.x += obj.vx; obj.y += obj.vy; obj.vy += 0.28; obj.rotation += obj.rotationSpeed;
        if (obj.y > canvas.height + 120) {
          if (!obj.isSliced && obj.type === 'fruit') {
            internalLives--; setLives(internalLives);
            if (internalLives <= 0) onGameOver(internalScore, Math.floor(internalScore / 10));
          }
          return false;
        }
        return !obj.isSliced;
      });

      pieces = pieces.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.rotation += p.rotationSpeed; p.life -= 0.012;
        return p.y < canvas.height + 120 && p.life > 0;
      });

      particles = particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life -= 0.022;
        return p.life > 0;
      });

      trail = trail.filter(t => now - t.time < 350);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      if (trail.length > 2) {
        ctx.beginPath();
        ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = bladeColor; ctx.shadowBlur = 20; ctx.shadowColor = bladeColor;
        ctx.moveTo(trail[0].x, trail[0].y);
        for(let i=1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      fruits.forEach(obj => {
        ctx.save(); ctx.translate(obj.x, obj.y); ctx.rotate(obj.rotation);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '85px serif';
        ctx.fillText(obj.type === 'bomb' ? '💣' : obj.fruitData!.icon, 0, 0);
        if (obj.type === 'bomb') {
          ctx.fillStyle = '#ff6d00'; ctx.beginPath();
          ctx.arc(18, -28, 4 + Math.random() * 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });

      pieces.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        ctx.globalAlpha = p.life; ctx.font = '85px serif';
        ctx.beginPath(); ctx.rect(p.side === 'left' ? -120 : 0, -60, 120, 120); ctx.clip();
        ctx.fillText(p.icon, 0, 0); ctx.restore();
      });
    };

    const loop = () => {
      update(); draw(); animationFrameId = requestAnimationFrame(loop);
    };

    const handlePointerAction = (e: any) => {
      const ev = e.touches ? e.touches[0] : e;
      const x = ev.clientX; const y = ev.clientY;
      if (isMouseDown || e.type === 'touchstart') {
        handleSliceCollision(lastX, lastY, x, y);
        trail.push({ x, y, time: Date.now() });
      }
      lastX = x; lastY = y;
    };

    const onDown = (e: any) => { isMouseDown = true; handlePointerAction(e); };
    const onUp = () => { isMouseDown = false; };
    
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mousemove', handlePointerAction);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(e); });
    canvas.addEventListener('touchend', onUp);
    canvas.addEventListener('touchmove', handlePointerAction);

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(comboTimeout);
    };
  }, [level, selectedBlade, onGameOver, onLevelWin]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-30 cursor-crosshair">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-1 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-1.5 mb-1">
           <div className="bg-yellow-500 text-yellow-950 font-black px-3 py-1 rounded-lg text-xs italic transform -skew-x-12 shadow-lg">
             LEVEL {level}
           </div>
        </div>
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400 w-8 h-8 fill-yellow-400" />
          <span className="text-white font-black text-6xl italic tracking-tighter tabular-nums">{score}</span>
        </div>
        <div className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] px-1">TARGET: {level * 100}</div>
      </div>

      <div className="absolute top-6 right-6 flex gap-3">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} animate={{ scale: i < (3 - lives) ? [1, 1.3, 1] : 1 }}>
            <Skull className={`w-10 h-10 drop-shadow-lg ${i < (3 - lives) ? 'text-red-600 fill-red-600' : 'text-white/10'}`} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {combo > 1 && (
          <motion.div 
            initial={{ x: -100, opacity: 0, scale: 0.5 }}
            animate={{ x: 20, opacity: 1, scale: 1 }}
            exit={{ x: 200, opacity: 0, scale: 1.5 }}
            className="absolute top-1/2 left-4 pointer-events-none"
          >
            <div className="bg-[#ff6d00] border-4 border-yellow-400 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rotate-[-10deg]">
              <h4 className="text-white font-black italic text-5xl tracking-tighter drop-shadow-md">
                {combo} CUT COMBO!
              </h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full max-w-[280px]">
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mb-1">LEVEL PROGRESS</div>
        <div className="w-full h-5 bg-black/40 rounded-full border-2 border-white/10 overflow-hidden shadow-inner p-1">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (score / (level * 100)) * 100)}%` }}
          />
        </div>
        <div className="text-yellow-500 font-black text-xs tracking-wider mt-1 italic">
          STAGE {level}
        </div>
      </div>

      <button onClick={() => setGameState(GameState.HOME)} className="absolute bottom-6 left-6 p-4 bg-white/5 backdrop-blur-xl rounded-full text-white/50 border border-white/5 shadow-2xl active:scale-90 transition-all">
        <Home size={28} />
      </button>
    </motion.div>
  );
}

// --- Status View ---
function GameOverView({ t, highScore, result, onRetry, onNextLevel, onHome }: any) {
  const isWin = result?.isWin;
  const score = result?.score || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.4, rotateX: 90, opacity: 0 }}
        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-[#5d4037] border-b-12 border-r-12 border-[#3e2723] rounded-[3rem] p-12 shadow-[0_40px_80px_rgba(0,0,0,0.7)] relative w-full max-w-sm ring-8 ring-[#8d6e63]/20"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
        
        {isWin && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
             <div className="text-6xl mb-2">🎉</div>
             <div className="bg-green-500 text-white font-black px-6 py-2 rounded-full shadow-2xl border-b-4 border-green-700 animate-bounce whitespace-nowrap">
               {t.win}
             </div>
          </div>
        )}

        <h2 className="text-6xl font-black text-white italic drop-shadow-2xl mb-8 uppercase tracking-tighter text-center leading-none mt-4">
          {isWin ? 'CLEAR!' : t.gameOver}
        </h2>

        <div className="bg-black/20 rounded-[2rem] p-6 mb-8 flex flex-col items-center border border-white/5 shadow-inner">
          <span className="text-gray-400 font-black text-xs uppercase tracking-[0.3em] mb-1">{t.score}</span>
          <span className="text-white font-black text-6xl italic drop-shadow-lg tabular-nums mb-4">{score}</span>
          
          <div className="w-full h-[2px] bg-white/5 mb-4" />
          
          <span className="text-yellow-600 font-black text-xs uppercase tracking-[0.3em] mb-1">{t.best}</span>
          <span className="text-yellow-500 font-black text-3xl italic tracking-tighter tabular-nums">{highScore}</span>
        </div>

        <div className="flex flex-col gap-5">
          {isWin ? (
            <GlossyButton variant="green" onClick={onNextLevel}>
              <Zap className="w-8 h-8 fill-white" /> {t.nextLevel}
            </GlossyButton>
          ) : (
            <GlossyButton variant="orange" onClick={onRetry}>
              <RotateCcw className="w-8 h-8 fill-white" /> {t.retry}
            </GlossyButton>
          )}
          
          <GlossyButton variant="blue" onClick={onHome}>
            <Home className="w-8 h-8 fill-white" /> {t.home}
          </GlossyButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Shared Glossy Interaction ---

function GlossyButton({ children, variant, size, onClick }: any) {
  const styles = {
    green: { bg: 'linear-gradient(to bottom, #86d45a 0%, #4caf50 50%, #388e3c 100%)', border: '#1b5e20' },
    orange: { bg: 'linear-gradient(to bottom, #ffb74d 0%, #ff9800 50%, #f57c00 100%)', border: '#bf360c' },
    blue: { bg: 'linear-gradient(to bottom, #4fc3f7 0%, #2196f3 50%, #1976d2 100%)', border: '#0d47a1' },
    purple: { bg: 'linear-gradient(to bottom, #ba68c8 0%, #9c27b0 50%, #7b1fa2 100%)', border: '#4a148c' },
  }[variant as 'green' | 'orange' | 'blue' | 'purple'] || { bg: 'gray', border: 'black' };

  return (
    <button 
      onClick={onClick}
      style={{ background: styles.bg, borderColor: styles.border }}
      className={`
        relative group active:translate-y-2 transition-all duration-75
        border-b-[8px] rounded-[42px]
        ${size === 'small' ? 'h-20 text-2xl' : 'h-[85px] text-3xl'}
        w-full flex items-center justify-center gap-3
        text-white font-black italic tracking-tighter uppercase
        shadow-[inset_0_4px_4px_rgba(255,255,255,0.4),0_10px_0_rgba(0,0,0,0.3)] 
        active:shadow-[inset_0_4px_4px_rgba(255,255,255,0.4),0_2px_0_rgba(0,0,0,0.3)]
        overflow-hidden
      `}
    >
      <div className="absolute top-0 left-0 right-0 h-[45%] bg-white/20 rounded-b-[100%]" />
      <span className="relative drop-shadow-[0_3px_0_rgba(0,0,0,0.4)] flex items-center">
        {children}
      </span>
    </button>
  );
}

// --- Internal Engine Logic ---

function distToSegment(p: {x:number, y:number}, v: {x:number, y:number}, w: {x:number, y:number}) {
  const l2 = distSq(v, w);
  if (l2 === 0) return Math.sqrt(distSq(p, v));
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.sqrt(distSq(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) }));
}

function distSq(v: {x:number, y:number}, w: {x:number, y:number}) { 
  return Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2); 
}
