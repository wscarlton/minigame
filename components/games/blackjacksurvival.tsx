import React, { useState, useEffect } from 'react';
import { Heart, Coins, AlertCircle, RotateCcw, Trophy, ShoppingBag, X } from 'lucide-react';

const BlackjackEndlessEnhanced = () => {
  // Game constants
  const INITIAL_HEALTH = 100;
  const SHOP_FREQUENCY = 5;
  const SUITS = ['♥', '♦', '♠', '♣'];
  const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const PERFECT_21_HEALTH_BONUS = 5; // Health bonus for scoring 21
  const REMOVAL_COST = 25; // Reduced card removal cost
  const FULL_DECK_SIZE = 52; // Standard deck size
  
  // Game state
  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [chips, setChips] = useState(0);
  const [handsCompleted, setHandsCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, shop, lost
  const [message, setMessage] = useState('');
  const [powerUps, setPowerUps] = useState([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [removalCards, setRemovalCards] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [isHighStakes, setIsHighStakes] = useState(false);
  const [healthBonus, setHealthBonus] = useState(0);
  
  // Stats tracking
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    bestRun: 0,
    mostChips: 0,
    totalHands: 0,
    perfect21Count: 0,
    totalChipsEarned: 0,
    totalChipsSpent: 0
  });

  // Initialize the game
  useEffect(() => {
    const savedStats = localStorage.getItem('blackjackSurvivalStats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Make sure we have default values for new stats
        setStats({
          ...parsedStats,
          totalChipsEarned: parsedStats.totalChipsEarned || 0,
          totalChipsSpent: parsedStats.totalChipsSpent || 0
        });
      } catch (e) {
        console.error("Error parsing saved stats", e);
        setStats({
          gamesPlayed: 0,
          bestRun: 0,
          mostChips: 0,
          totalHands: 0,
          perfect21Count: 0,
          totalChipsEarned: 0,
          totalChipsSpent: 0
        });
      }
    }
    startNewGame();
  }, []);

  // Save stats to localStorage when they change
  useEffect(() => {
    if (stats.gamesPlayed > 0) {
      localStorage.setItem('blackjackSurvivalStats', JSON.stringify(stats));
    }
  }, [stats]);

  const createDeck = () => {
    const newDeck = [];
    for (let suit of SUITS) {
      for (let value of VALUES) {
        newDeck.push({ suit, value });
      }
    }
    return shuffleDeck(newDeck);
  };

  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setHealth(INITIAL_HEALTH);
    setChips(0);
    setHandsCompleted(0);
    setStreak(0);
    setPowerUps([]);
    setGameState('playing');
    setMessage('');
    setShopOpen(false);
    setHealthBonus(0);
    
    // Determine if this is a high stakes hand (1 in 10 chance)
    const highStakes = Math.random() < 0.1;
    setIsHighStakes(highStakes);
    
    // Deal initial cards
    const firstCard = newDeck[newDeck.length - 1];
    const secondCard = newDeck[newDeck.length - 2];
    const initialCards = [firstCard, secondCard];
    const initialDeck = newDeck.slice(0, -2);
    
    setDeck(initialDeck);
    setPlayerCards(initialCards);
    setPlayerScore(calculateScore(initialCards));
  };

  const dealCard = () => {
    if (deck.length === 0 || deck.length < 2) {
      setMessage('Reshuffling the deck...');
      const newDeck = createDeck();
      setDeck(newDeck);
      
      // It's safer to return here and let the player hit again
      // rather than continue with a potentially undefined card
      return;
    }

    const newDeck = [...deck];
    const card = newDeck.pop();
    
    // Safety check in case card is undefined
    if (!card) {
      setMessage('Error drawing card. Reshuffling...');
      const freshDeck = createDeck();
      setDeck(freshDeck);
      return;
    }
    
    const newPlayerCards = [...playerCards, card];
    setDeck(newDeck);
    setPlayerCards(newPlayerCards);

    // Apply Heart Healer power-up if owned
    if (hasPowerUp('heartsBonus') && card.suit === '♥') {
      setHealth(prev => Math.min(INITIAL_HEALTH, prev + 1));
      setMessage('Heart card played! +1 health');
    }

    // Calculate new score
    const newScore = calculateScore(newPlayerCards);
    setPlayerScore(newScore);

    // Check for bust
    if (newScore > 21) {
      handleBust();
    }
  };

  const calculateScore = (cards) => {
    let score = 0;
    let aces = 0;

    for (const card of cards) {
      if (card.value === 'A') {
        score += 11;
        aces += 1;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    }

    // Handle aces if score is over 21
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const hasPowerUp = (id) => {
    return powerUps.some(powerUp => powerUp.id === id);
  };

  const handleStand = () => {
    // Calculate base health loss
    let healthLoss = 21 - playerScore;
    
    // Apply high stakes multiplier if applicable
    if (isHighStakes) {
      healthLoss = Math.round(healthLoss * 2.5);
    }
    
    // Calculate health bonus for perfect 21
    let bonus = 0;
    if (playerScore === 21) {
      bonus = PERFECT_21_HEALTH_BONUS;
      setStats(prev => ({
        ...prev,
        perfect21Count: prev.perfect21Count + 1
      }));
    }
    
    // Update health with loss and bonus
    const newHealth = Math.max(0, health - healthLoss + bonus);
    setHealth(newHealth);
    
    // Update health bonus display
    setHealthBonus(bonus);
    
    // Calculate base chips earned
    let earnedChips = 10; // Base amount for completing a hand
    earnedChips += playerScore; // Add points based on score
    
    // Check for perfect 21
    if (playerScore === 21) {
      earnedChips += 25; // Bonus for perfect 21
    }
    
    // Check for natural blackjack (21 with first two cards)
    if (playerScore === 21 && playerCards.length === 2) {
      earnedChips += 15; // Bonus for natural blackjack
    }
    
    // Apply Clubs bonus if owned
    if (hasPowerUp('clubsBonus')) {
      const clubs = playerCards.filter(card => card.suit === '♣').length;
      earnedChips += clubs * 5;
      if (clubs > 0) {
        setMessage(`Earned ${clubs * 5} extra chips from clubs bonus!`);
      }
    }
    
    // Streak bonus for perfect hands
    if (healthLoss === 0) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      earnedChips += 5 * newStreak; // Bonus for consecutive perfect hands
    } else {
      setStreak(0);
    }
    
    // Apply high stakes multiplier to earnings if applicable
    if (isHighStakes) {
      earnedChips = earnedChips * 2;
    }
    
    setChips(prev => prev + earnedChips);
    
    // Track total chips earned
    setStats(prev => ({
      ...prev,
      totalChipsEarned: (prev.totalChipsEarned || 0) + earnedChips
    }));
    
    // Update hands completed
    const newHandsCompleted = handsCompleted + 1;
    setHandsCompleted(newHandsCompleted);
    
    // Check if game is over
    if (newHealth <= 0) {
      handleGameOver();
      return;
    }
    
    // Check if shop should appear
    if (newHandsCompleted % SHOP_FREQUENCY === 0) {
      let statusMessage = '';
      if (playerScore === 21) {
        statusMessage = isHighStakes 
          ? `Perfect 21! You earned ${earnedChips} chips (2x bonus) and ${bonus} health. The shop is open!` 
          : `Perfect 21! You earned ${earnedChips} chips and ${bonus} health. The shop is open!`;
      } else {
        statusMessage = isHighStakes 
          ? `High stakes hand complete! You earned ${earnedChips} chips (2x bonus). The shop is open!` 
          : `Hand complete! You earned ${earnedChips} chips. The shop is open!`;
      }
      setMessage(statusMessage);
      prepareShop();
    } else {
      // Make sure we have enough cards for the next hand
      let newDeck = [...deck];
      if (newDeck.length < 2) {
        newDeck = createDeck();
        setMessage('Reshuffling the deck for next hand...');
      }
      
      // Get status message
      let statusMessage = '';
      if (playerScore === 21) {
        statusMessage = isHighStakes 
          ? `Perfect 21! You earned ${earnedChips} chips (2x bonus) and ${bonus} health. Health lost: ${healthLoss} (2.5x penalty)` 
          : `Perfect 21! You earned ${earnedChips} chips and ${bonus} health. Health lost: ${healthLoss}`;
      } else {
        statusMessage = isHighStakes 
          ? `High stakes hand complete! You earned ${earnedChips} chips (2x bonus). Health lost: ${healthLoss} (2.5x penalty)` 
          : `Hand complete! You earned ${earnedChips} chips. Health lost: ${healthLoss}`;
      }
      setMessage(statusMessage);
      
      // Deal new cards for next hand
      const firstCard = newDeck.pop();
      const secondCard = newDeck.pop();
      
      // Safety check
      if (!firstCard || !secondCard) {
        // This should be very rare now, but just in case
        newDeck = createDeck();
        const freshFirstCard = newDeck.pop();
        const freshSecondCard = newDeck.pop();
        setPlayerCards([freshFirstCard, freshSecondCard]);
        setPlayerScore(calculateScore([freshFirstCard, freshSecondCard]));
      } else {
        setPlayerCards([firstCard, secondCard]);
        setPlayerScore(calculateScore([firstCard, secondCard]));
      }
      
      // Determine if next hand is high stakes
      const highStakes = Math.random() < 0.1;
      setIsHighStakes(highStakes);
      
      setDeck(newDeck);
      setHealthBonus(0);
    }
  };

  const handleBust = () => {
    // Calculate health loss for busting
    const healthLoss = isHighStakes ? Math.round(21 * 2.5) : 21;
    const newHealth = Math.max(0, health - healthLoss);
    setHealth(newHealth);
    
    if (newHealth <= 0) {
      setMessage('Bust! You lost all your health.');
      handleGameOver();
    } else {
      setMessage(`Bust! Lost ${healthLoss} health.`);
      
      // Make sure we have enough cards for the next hand
      let newDeck = [...deck];
      if (newDeck.length < 2) {
        newDeck = createDeck();
        setMessage('Reshuffling the deck for next hand...');
      }
      
      // Deal new cards for next hand
      const firstCard = newDeck.pop();
      const secondCard = newDeck.pop();
      
      // Safety check
      if (!firstCard || !secondCard) {
        // This should be very rare now, but just in case
        newDeck = createDeck();
        const freshFirstCard = newDeck.pop();
        const freshSecondCard = newDeck.pop();
        setPlayerCards([freshFirstCard, freshSecondCard]);
        setPlayerScore(calculateScore([freshFirstCard, freshSecondCard]));
      } else {
        setPlayerCards([firstCard, secondCard]);
        setPlayerScore(calculateScore([firstCard, secondCard]));
      }
      
      // Determine if next hand is high stakes
      const highStakes = Math.random() < 0.1;
      setIsHighStakes(highStakes);
      
      setDeck(newDeck);
      setHandsCompleted(prev => prev + 1);
      setStreak(0); // Reset streak on bust
      setHealthBonus(0);
    }
  };

  const prepareShop = () => {
    // Select 3 random cards for potential removal
    const newRemovalCards = [];
    const tempDeck = [...deck];
    
    // Safety check to make sure we have enough cards
    if (tempDeck.length < 3) {
      // If deck is nearly empty, reshuffle before selecting cards
      const newFullDeck = createDeck();
      for (let i = 0; i < 3 && i < newFullDeck.length; i++) {
        const randomIndex = Math.floor(Math.random() * newFullDeck.length);
        newRemovalCards.push(newFullDeck[randomIndex]);
        newFullDeck.splice(randomIndex, 1);
      }
      // Replace the current deck with the remainder
      setDeck(newFullDeck);
    } else {
      // Normal case - select from current deck
      for (let i = 0; i < 3 && i < tempDeck.length; i++) {
        const randomIndex = Math.floor(Math.random() * tempDeck.length);
        newRemovalCards.push(tempDeck[randomIndex]);
        tempDeck.splice(randomIndex, 1);
      }
    }
    
    setRemovalCards(newRemovalCards);
    setShopOpen(true);
    setGameState('shop');
  };

  const handleGameOver = () => {
    setGameState('lost');
    
    // Update stats
    setStats(prev => {
      const newStats = {
        gamesPlayed: prev.gamesPlayed + 1,
        bestRun: Math.max(prev.bestRun, handsCompleted),
        mostChips: Math.max(prev.mostChips, chips),
        totalHands: prev.totalHands + handsCompleted,
        perfect21Count: prev.perfect21Count,
        totalChipsEarned: prev.totalChipsEarned,
        totalChipsSpent: prev.totalChipsSpent
      };
      return newStats;
    });
  };

  const buyPowerUp = (id, name, cost) => {
    if (chips < cost) {
      setMessage('Not enough chips!');
      return;
    }
    
    // Check if one-time powerup is already owned
    if (hasPowerUp(id)) {
      setMessage('You already own this power-up!');
      return;
    }
    
    setChips(prev => prev - cost);
    setPowerUps(prev => [...prev, { id, name }]);
    setMessage(`Purchased ${name}!`);
    
    // Track chips spent
    setStats(prev => ({
      ...prev,
      totalChipsSpent: (prev.totalChipsSpent || 0) + cost
    }));
  };

  const buyHealth = (amount, cost) => {
    if (chips < cost) {
      setMessage('Not enough chips!');
      return;
    }
    
    setChips(prev => prev - cost);
    setHealth(prev => Math.min(INITIAL_HEALTH, prev + amount));
    setMessage(`Recovered ${amount} health!`);
    
    // Track chips spent
    setStats(prev => ({
      ...prev,
      totalChipsSpent: (prev.totalChipsSpent || 0) + cost
    }));
  };

  const removeCard = (card, index) => {
    if (chips < REMOVAL_COST) {
      setMessage(`Not enough chips! Card removal costs ${REMOVAL_COST} chips.`);
      return;
    }
    
    // Remove the card from the deck
    const newDeck = deck.filter(c => !(c.suit === card.suit && c.value === card.value));
    
    // Remove from the display
    const newRemovalCards = [...removalCards];
    newRemovalCards.splice(index, 1);
    
    // If we have cards left in the deck, get a new card to offer
    if (newDeck.length > 0 && newRemovalCards.length < 3) {
      const randomIndex = Math.floor(Math.random() * newDeck.length);
      const newCard = newDeck[randomIndex];
      newDeck.splice(randomIndex, 1);
      newRemovalCards.push(newCard);
    }
    
    setDeck(newDeck);
    setRemovalCards(newRemovalCards);
    setChips(prev => prev - REMOVAL_COST);
    setMessage(`Removed ${card.value}${card.suit} from the deck!`);
    
    // Track chips spent
    setStats(prev => ({
      ...prev,
      totalChipsSpent: (prev.totalChipsSpent || 0) + REMOVAL_COST
    }));
  };

  const closeShop = () => {
    setShopOpen(false);
    setGameState('playing');
    
    // Make sure we have enough cards for the new hand
    let newDeck = [...deck];
    if (newDeck.length < 2) {
      // Reshuffle if we don't have enough cards
      newDeck = createDeck();
      setMessage('Reshuffling the deck for next hand...');
    }
    
    // Deal new cards for the next hand
    const firstCard = newDeck.pop();
    const secondCard = newDeck.pop();
    
    // Safety check
    if (!firstCard || !secondCard) {
      // This should never happen now, but just in case
      newDeck = createDeck();
      const freshFirstCard = newDeck.pop();
      const freshSecondCard = newDeck.pop();
      setPlayerCards([freshFirstCard, freshSecondCard]);
      setPlayerScore(calculateScore([freshFirstCard, freshSecondCard]));
    } else {
      setPlayerCards([firstCard, secondCard]);
      setPlayerScore(calculateScore([firstCard, secondCard]));
    }
    
    // Determine if next hand is high stakes
    const highStakes = Math.random() < 0.1;
    setIsHighStakes(highStakes);
    
    setDeck(newDeck);
    setHealthBonus(0);
  };

  const getCardColor = (suit) => {
    return suit === '♥' || suit === '♦' ? 'text-red-600' : 'text-black';
  };

  const renderGameUI = () => {
    if (gameState === 'playing') {
      return (
        <div className="space-y-6">
          {/* Game Status and Cards */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              <span className="text-xl font-bold">{health}</span>
              {healthBonus > 0 && (
                <span className="text-sm text-green-500 ml-1">+{healthBonus}</span>
              )}
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Score</span>
              <div className="font-medium">{playerScore}</div>
              {isHighStakes && (
                <div className="text-xs font-bold text-red-500 animate-pulse mt-1">
                  HIGH STAKES HAND!
                </div>
              )}
            </div>
            <div className="flex items-center">
              <Coins className="mr-2 h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold">{chips}</span>
            </div>
          </div>
          
          {/* Deck Count Display */}
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>Total cards in deck: {deck.length}</span>
            <span>Cards until reshuffle: {deck.length}</span>
          </div>
          
          {/* Cards Display */}
          <div className="flex items-center justify-center flex-wrap gap-2 min-h-40">
            {playerCards.map((card, index) => (
              <div
                key={index}
                className={`w-16 h-24 rounded-lg bg-white border-2 border-gray-300 flex flex-col items-center justify-center ${getCardColor(card.suit)}`}
                style={{
                  transform: `rotate(${(index - playerCards.length / 2) * 5}deg)`,
                  transformOrigin: 'bottom center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div className="text-xl font-bold">{card.value}</div>
                <div className="text-2xl">{card.suit}</div>
              </div>
            ))}
          </div>
          
          {/* Game Controls */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={dealCard} 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Hit
            </button>
            <button 
              onClick={handleStand} 
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Stand
            </button>
          </div>
        </div>
      );
    } else if (gameState === 'shop') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Casino Shop</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-lg font-bold">{health}</span>
              </div>
              <div className="flex items-center">
                <Coins className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="text-lg font-bold">{chips}</span>
              </div>
            </div>
          </div>
          
          {/* Deck Count Display */}
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>Total cards in deck: {deck.length}</span>
            <span>Cards until reshuffle: {deck.length}</span>
          </div>
          
          {/* Health Recovery Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Health Recovery</h3>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow">
              <div>
                <p className="font-medium">Quick Fix</p>
                <p className="text-sm text-gray-500">Recover 5 health</p>
              </div>
              <button 
                onClick={() => buyHealth(5, 50)}
                disabled={chips < 50 || health >= INITIAL_HEALTH}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  chips < 50 || health >= INITIAL_HEALTH 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Coins className="h-4 w-4" />
                50
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow">
              <div>
                <p className="font-medium">Health Pack</p>
                <p className="text-sm text-gray-500">Recover 15 health</p>
              </div>
              <button 
                onClick={() => buyHealth(15, 120)}
                disabled={chips < 120 || health >= INITIAL_HEALTH}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  chips < 120 || health >= INITIAL_HEALTH 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Coins className="h-4 w-4" />
                120
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow">
              <div>
                <p className="font-medium">Emergency Kit</p>
                <p className="text-sm text-gray-500">Recover 30 health</p>
              </div>
              <button 
                onClick={() => buyHealth(30, 200)}
                disabled={chips < 200 || health >= INITIAL_HEALTH || health > 30}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  chips < 200 || health >= INITIAL_HEALTH || health > 30
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Coins className="h-4 w-4" />
                200
              </button>
            </div>
          </div>
          
          {/* Power-ups Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Power-ups</h3>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow">
              <div>
                <p className="font-medium">Hearts Bonus</p>
                <p className="text-sm text-gray-500">+1 health for each heart card played</p>
              </div>
              <button 
                onClick={() => buyPowerUp('heartsBonus', 'Hearts Bonus', 100)}
                disabled={chips < 100 || hasPowerUp('heartsBonus')}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  chips < 100 || hasPowerUp('heartsBonus') 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <Coins className="h-4 w-4" />
                100
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-md shadow">
              <div>
                <p className="font-medium">Clubs Bonus</p>
                <p className="text-sm text-gray-500">+5 chips for each club card played</p>
              </div>
              <button 
                onClick={() => buyPowerUp('clubsBonus', 'Clubs Bonus', 150)}
                disabled={chips < 150 || hasPowerUp('clubsBonus')}
                className={`px-3 py-1 rounded flex items-center gap-1 ${
                  chips < 150 || hasPowerUp('clubsBonus') 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Coins className="h-4 w-4" />
                150
              </button>
            </div>
          </div>
          
          {/* Card Removal Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Card Removal ({REMOVAL_COST} chips)</h3>
            
            {removalCards.length > 0 ? (
              <div className="flex justify-center gap-4 my-4">
                {removalCards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => removeCard(card, index)}
                    className={`w-16 h-24 rounded-lg bg-white border-2 border-gray-300 flex flex-col items-center justify-center ${getCardColor(card.suit)} cursor-pointer hover:border-blue-500 transition-colors relative shadow`}
                  >
                    <div className="text-xl font-bold">{card.value}</div>
                    <div className="text-2xl">{card.suit}</div>
                    <div className="absolute bottom-1 text-xs text-gray-500">Remove</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 p-4">No more cards available for removal</p>
            )}
          </div>
          
          <button
            onClick={closeShop}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Continue Playing
          </button>
        </div>
      );
    } else if (gameState === 'lost') {
      return (
        <div className="text-center space-y-4 py-8">
          <div className="text-2xl font-bold">Game Over!</div>
          <div className="text-lg">
            You completed {handsCompleted} hands and earned {chips} chips
          </div>
          <div className="text-md text-gray-600">
            Perfect 21s: {stats.perfect21Count}
          </div>
          
          <button
            onClick={startNewGame}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </button>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Statistics</h3>
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span>{stats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Run:</span>
                <span>{stats.bestRun} hands</span>
              </div>
              <div className="flex justify-between">
                <span>Most Chips:</span>
                <span>{stats.mostChips}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Perfect 21s:</span>
                <span>{stats.perfect21Count}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Chips Earned:</span>
                <span>{stats.totalChipsEarned}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Chips Spent:</span>
                <span>{stats.totalChipsSpent}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col p-4 bg-gray-100 min-h-screen">
      <div className="max-w-lg mx-auto w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-800 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Blackjack Survival</h1>
            <div className="text-sm">Hands: {handsCompleted}</div>
          </div>
          <div className="text-xs text-gray-300 mt-1 flex justify-between">
            <span>Perfect 21 = +5 Health Bonus</span>
            <span>Card Removal: {REMOVAL_COST} chips</span>
          </div>
        </div>
        
        <div className="p-4">
          {/* Active Power-ups Display */}
          {powerUps.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {powerUps.map((powerUp, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    powerUp.id === 'heartsBonus' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {powerUp.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Message Alert */}
          {message && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border-l-4 border-blue-500 text-blue-700 flex items-start">
              <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}
          
          {renderGameUI()}
        </div>
      </div>
    </div>
  );
};

export default BlackjackEndlessEnhanced;
