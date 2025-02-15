const room = new WebsimSocket();

const CARD_COLORS = ['red', 'blue', 'green', 'yellow'];
const CARD_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];
const SPECIAL_CARDS = ['+4', 'wild'];

function generateDeck() {
  let deck = [];

  // Generate colored cards
  CARD_COLORS.forEach(color => {
    CARD_VALUES.forEach(value => {
      deck.push({ color, value });
      if (value !== '0') { // Add duplicate for all except 0
        deck.push({ color, value });
      }
    });
  });

  // Add special cards
  SPECIAL_CARDS.forEach(value => {
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'black', value });
    }
  });

  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function App() {
  const [gameState, setGameState] = React.useState('menu');
  const [gameData, setGameData] = React.useState(null);
  const [colorSelectDialog, setColorSelectDialog] = React.useState(null);
  const [winner, setWinner] = React.useState(null);
  const [chatMessages, setChatMessages] = React.useState([]);
  const peers = React.useSyncExternalStore(
    room.party.subscribe,
    () => room.party.peers
  );

  function startGame() {
    const playerCount = Object.keys(peers).length;
    if (playerCount < 2 || playerCount > 8) {
      alert('2-8 players required!');
      return;
    }

    const deck = generateDeck();
    const hands = {};
    const players = Object.keys(peers).slice(0,8); // Only first 8 are players

    players.forEach(playerId => {
      hands[playerId] = deck.splice(0, 7);
    });

    const initialGameData = {
      deck,
      hands,
      discard: [deck.splice(0, 1)[0]],
      currentPlayer: players[0],
      direction: 1,
      lastAction: null,
      unoCalled: null,
      playerHasUno: {},
      spectators: Object.keys(peers).slice(8), // Players beyond 8 are spectators
      actionLog: [] // Initialize action log
    };

    room.send({
      type: 'gameStart',
      gameData: initialGameData
    });

    setGameData(initialGameData);
    setGameState('game');
  };

  React.useEffect(() => {
    room.onmessage = (event) => {
      const { type, gameData, winner, message, clientId, username } = event.data;

      if (type === 'gameStart') {
        setGameData(gameData);
        setGameState('game');
        setWinner(null);
      }
      else if (type === 'playCard') {
        setGameData(gameData);
      }
      else if (type === 'uno') {
        setGameData(gameData);
      }
      else if (type === 'chatMessage') {
        setChatMessages(prevMessages => [{ clientId, username, message }, ...prevMessages]);
      }
      else if (type === 'gameWon') {
        setGameData(gameData);
        setWinner(winner);
        setTimeout(() => {
          setGameState('menu');
          setGameData(null);
          setWinner(null);
        }, 5000);
      }
    };
  }, []);

  const handlePlayCard = (card) => {
    if (gameData.currentPlayer !== room.party.client.id) return;

    const newGameData = {...gameData};
    const playerHand = newGameData.hands[room.party.client.id];
    const cardIndex = playerHand.findIndex(c =>
      c.color === card.color && c.value === card.value
    );

    if (cardIndex === -1) return;

    const topCard = newGameData.discard[newGameData.discard.length - 1];

    const isPlayable =
      card.color === 'black' ||
      card.color === topCard.color ||
      card.value === topCard.value ||
      (topCard.chosenColor && card.color === topCard.chosenColor);

    if (isPlayable) {
      if (card.color === 'black') {
        setColorSelectDialog(card);
        return;
      }

      playerHand.splice(cardIndex, 1);
      newGameData.discard.push(card);

      const players = Object.keys(gameData.hands);
      const currentIndex = players.indexOf(newGameData.currentPlayer);
      let nextIndex = (currentIndex + newGameData.direction + players.length) % players.length;

      let actionMessage = `${peers[room.party.client.id].username} played ${card.value} ${card.color}`;

      // Handle special cards
      if (card.value === 'skip') {
        actionMessage = `${peers[room.party.client.id].username} skipped ${peers[players[nextIndex]].username}`;
        nextIndex = (nextIndex + newGameData.direction + players.length) % players.length;
      } else if (card.value === 'reverse') {
        actionMessage = `${peers[room.party.client.id].username} reversed direction`;
        nextIndex = (currentIndex + newGameData.direction + players.length) % players.length; // Correct nextIndex for reverse
      } else if (card.value === '+2') {
        const nextPlayer = players[nextIndex];
        actionMessage = `${peers[room.party.client.id].username} played +2, ${peers[nextPlayer].username} draws 2 cards`;
        if (newGameData.deck.length < 2) {
          const lastCard = newGameData.discard.pop();
          newGameData.deck = shuffle([...newGameData.discard]);
          newGameData.discard = [lastCard];
        }
        newGameData.hands[nextPlayer].push(...newGameData.deck.splice(0, 2));
        newGameData.lastAction = '+2';
      }

      newGameData.currentPlayer = players[nextIndex];
      newGameData.actionLog.unshift(actionMessage); // Add action to log

      room.send({
        type: 'playCard',
        gameData: newGameData,
      });

      setGameData(newGameData);
    }
  };

  const handleColorSelect = (color) => {
    const card = {...colorSelectDialog}; // Create a copy of the card
    card.chosenColor = color;
    setColorSelectDialog(null);

    const newGameData = {...gameData};
    const playerHand = newGameData.hands[room.party.client.id];
    const cardIndex = playerHand.findIndex(c =>
      c.color === card.color && c.value === card.value
    );

    if (cardIndex === -1) return;

    playerHand.splice(cardIndex, 1);
    newGameData.discard.push(card);

    const players = Object.keys(gameData.hands);
    const currentIndex = players.indexOf(newGameData.currentPlayer);
    let nextIndex = (currentIndex + newGameData.direction + players.length) % players.length;

    let actionMessage = `${peers[room.party.client.id].username} played ${card.value} and chose ${color}`;

    if (card.value === '+4') {
      const nextPlayer = players[nextIndex];
      actionMessage = `${peers[room.party.client.id].username} played +4 and chose ${color}, ${peers[nextPlayer].username} draws 4 cards`;
      if (newGameData.deck.length < 4) {
        const lastCard = newGameData.discard.pop();
        newGameData.deck = shuffle([...newGameData.discard]);
        newGameData.discard = [lastCard];
      }
      newGameData.hands[nextPlayer].push(...newGameData.deck.splice(0, 4));
      newGameData.lastAction = '+4';
    }

    newGameData.currentPlayer = players[nextIndex];
    newGameData.actionLog.unshift(actionMessage); // Add action to log

    room.send({
      type: 'playCard',
      gameData: newGameData,
    });

    setGameData(newGameData);
  };

  const callUno = () => {
    if (!gameData || gameData.currentPlayer !== room.party.client.id) return;

    const playerHand = gameData.hands[room.party.client.id];
    if (playerHand.length !== 0) return; // Only allow UNO call at 0 cards

    const newGameData = {...gameData};
    newGameData.unoCalled = room.party.client.id;

    let winner = null;
    if (playerHand.length === 0) { // Double check in callUno
      winner = room.party.client.id;
      room.send({
        type: 'gameWon',
        gameData: newGameData,
        winner
      });
      setWinner(winner); // Set winner state locally as well for immediate UI update
      setTimeout(() => {
        setGameState('menu');
        setGameData(null);
        setWinner(null);
      }, 5000);
    } else {
      room.send({
        type: 'uno',
        gameData: newGameData
      });
      setGameData(newGameData);
    }

  };

  function sendMessage(message) {
    room.send({
      type: 'chatMessage',
      message: message,
    });
  }

  return (
    <div className="container">
      {gameState === 'menu' && (
        <div className="menu">
          <ChatBox
            chatMessages={chatMessages}
            sendChatMessage={sendMessage}
            peers={peers}
          />
          <h1 className="title">UNO Online</h1>
          <button className="button" onClick={startGame}>Start Game</button>
          <div className="players">
            {Object.entries(peers).map(([id, peer]) => (
              <div key={id} className="player">
                <img
                  className="avatar"
                  src={`https://images.websim.ai/avatar/${peer.username}`}
                  alt={peer.username}
                />
                <span>{peer.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'game' && gameData && (
        <>
          <GameBoard
            gameData={gameData}
            currentPlayerId={room.party.client.id}
            peers={peers}
            onPlayCard={handlePlayCard}
            onUno={callUno}
            chatMessages={chatMessages}
            sendChatMessage={sendMessage}
            setGameData={setGameData}
          />
          {colorSelectDialog && (
            <ColorSelectDialog onColorSelect={handleColorSelect} />
          )}
          {winner && (
            <div className="winner-overlay">
              <div className="winner-dialog">
                <h2>🎉 Winner! 🎉</h2>
                <div className="winner-info">
                  {peers[winner] ? (
                    <>
                      <img
                        className="avatar"
                        src={`https://images.websim.ai/avatar/${peers[winner].username}`}
                        alt={peers[winner].username}
                      />
                      <h3>{peers[winner].username}</h3>
                    </>
                  ) : (
                    <h3>Player Left</h3>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Card({ card, onClick }) {
  const getSymbol = (value) => {
    switch(value) {
      case 'skip': return '⊘';
      case 'reverse': return '⟲';
      case '+2': return '+2';
      case '+4': return '+4';
      case 'wild': return '🌈';
      default: return value;
    }
  };

  const getBackgroundStyle = () => {
    if (card.chosenColor) {
      return `linear-gradient(135deg, var(--${card.chosenColor}-light), var(--${card.chosenColor}-dark))`;
    }
    return undefined;
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={`card ${card.color} ${card.chosenColor ? 'chosen-' + card.chosenColor : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ?
          'translateY(-10px) rotateX(10deg) rotateY(10deg) scale(1.05)' :
          'translateY(0) rotateX(0) rotateY(0) scale(1)'
      }}
    >
      <div
        className="card-inner"
        style={{ background: getBackgroundStyle() }}
      >
        <div className="card-border"></div>
        <div className="card-corner top-left">
          <div className="card-value">{getSymbol(card.value)}</div>
        </div>
        <div className="card-center">{getSymbol(card.value)}</div>
        <div className="card-corner bottom-right">
          <div className="card-value">{getSymbol(card.value)}</div>
        </div>
        {card.chosenColor && (
          <div className="chosen-color-indicator">
            Chosen Color: {card.chosenColor}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorSelectDialog({ onColorSelect }) {
  return (
    <div className="color-select-overlay">
      <div className="color-select-dialog">
        <h3>Choose a color:</h3>
        <div className="color-buttons">
          {['red', 'blue', 'green', 'yellow'].map(color => (
            <button
              key={color}
              className={`color-button ${color}`}
              onClick={() => onColorSelect(color)}
              aria-label={`Choose ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatBox({ chatMessages, sendChatMessage, peers }) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatInput, setChatInput] = React.useState('');
  const [unreadMessagesCount, setUnreadMessagesCount] = React.useState(0);

  const handleChatInputChange = (event) => {
    setChatInput(event.target.value);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadMessagesCount(0);
    }
  };

  React.useEffect(() => {
    if (!isChatOpen && chatMessages.length > 0) {
      setUnreadMessagesCount(prev => prev + 1);
    }
  }, [chatMessages]);

  return (
    <div className="chat-toggle-container">
      <button className="chat-toggle-button" onClick={toggleChat}>
        {isChatOpen ? '▼ Chat' : '▲ Chat'}
        {unreadMessagesCount > 0 && (
          <span className="chat-notification-counter">{unreadMessagesCount}</span>
        )}
      </button>
      {isChatOpen && (
        <div className="chatbox-container top-chat">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{peers[msg.clientId]?.username || 'Player Left'}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Enter message"
              value={chatInput}
              onChange={handleChatInputChange}
              onKeyDown={handleKeyDown}
            />
            <button className="send-button" onClick={handleSendMessage} aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 17 11 13 2 22 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function GameBoard({ gameData, currentPlayerId, peers = {}, onPlayCard, onUno, chatMessages, sendChatMessage, setGameData }) {
  const playerHand = gameData.hands[currentPlayerId];
  const isCurrentPlayer = gameData.currentPlayer === currentPlayerId;
  const canCallUno = isCurrentPlayer && playerHand.length === 0; // Only show when 0 cards
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const topCard = gameData.discard[gameData.discard.length - 1];
  const activeColor = topCard?.chosenColor || topCard?.color;
  const [turnTimeRemaining, setTurnTimeRemaining] = React.useState(60); // Timer state
  const [timerIntervalId, setTimerIntervalId] = React.useState(null); // Interval ID state
  const [isMyTurnNotificationVisible, setIsMyTurnNotificationVisible] = React.useState(false);

  // Function to play turn start sound
  const playTurnStartSound = React.useCallback(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1); // Short beep
  }, []);


  React.useEffect(() => {
    if (isCurrentPlayer) {
      setTurnTimeRemaining(60); // Reset timer to 60 seconds
      setIsMyTurnNotificationVisible(true);
      playTurnStartSound();
      const intervalId = setInterval(() => {
        setTurnTimeRemaining(prevTime => {
          if (prevTime <= 0) {
            clearInterval(intervalId);
            // Handle turn timeout - for now, just draw a card for the player
            drawCardForTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      setTimerIntervalId(intervalId);
    } else {
      clearInterval(timerIntervalId); // Clear any existing interval when it's not the player's turn
      setTimerIntervalId(null);
      setTurnTimeRemaining(60); // Optionally reset timer when turn ends
      setIsMyTurnNotificationVisible(false);
    }

    return () => clearInterval(timerIntervalId); // Cleanup on unmount or turn change
  }, [isCurrentPlayer, gameData, playTurnStartSound]);


  const drawCard = () => {
    if (!isCurrentPlayer) return;
    clearInterval(timerIntervalId); // Clear timer when player draws card

    const newGameData = {...gameData};
    if (newGameData.deck.length === 0) {
      const lastCard = newGameData.discard.pop();
      newGameData.deck = shuffle([...newGameData.discard]);
      newGameData.discard = [lastCard];
    }

    const drawnCard = newGameData.deck.splice(0, 1)[0];
    newGameData.hands[currentPlayerId].push(drawnCard);

    const actionMessage = `${peers[currentPlayerId].username} drew a card`;
    newGameData.actionLog.unshift(actionMessage); // Add action to log

    if (!newGameData.lastAction?.includes('+')) {
      const players = Object.keys(gameData.hands);
      const currentIndex = players.indexOf(newGameData.currentPlayer);
      const nextIndex = (currentIndex + newGameData.direction + players.length) % players.length;
      newGameData.currentPlayer = players[nextIndex];
    }
    newGameData.lastAction = null;

    room.send({
      type: 'playCard',
      gameData: newGameData
    });

    setGameData(newGameData);
  };

  const drawCardForTimeout = () => {
    if (!isCurrentPlayer) return;
    clearInterval(timerIntervalId); // Clear timer when player draws card

    const newGameData = {...gameData};
    if (newGameData.deck.length === 0) {
      const lastCard = newGameData.discard.pop();
      newGameData.deck = shuffle([...newGameData.discard]);
      newGameData.discard = [lastCard];
    }

    const drawnCard = newGameData.deck.splice(0, 1)[0];
    newGameData.hands[currentPlayerId].push(drawnCard);

    const actionMessage = `${peers[currentPlayerId].username} timed out and drew a card`;
    newGameData.actionLog.unshift(actionMessage); // Add action to log

    if (!newGameData.lastAction?.includes('+')) {
      const players = Object.keys(gameData.hands);
      const currentIndex = players.indexOf(newGameData.currentPlayer);
      const nextIndex = (currentIndex + newGameData.direction + players.length) % players.length;
      newGameData.currentPlayer = players[nextIndex];
    }
    newGameData.lastAction = null;

    room.send({
      type: 'playCard',
      gameData: newGameData
    });

    setGameData(newGameData);
  };


  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="game-board">
      <ChatBox
        chatMessages={chatMessages}
        sendChatMessage={sendChatMessage}
        peers={peers}
      />
      <div className="players-container">
        <button className="players-toggle-button" onClick={toggleDropdown}>
          Players {Object.keys(peers).length}
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
            <path d="M0 0h24v24H0z" fill="none"/>
          </svg>
        </button>
        <div className={`players-dropdown ${isDropdownOpen ? 'open' : ''}`}>
          <div className="players">
            {Object.entries(peers || {}).map(([id, peer]) => peer && (
              <div key={id} className={`player ${gameData.currentPlayer === id ? 'active' : ''}`}>
                <img
                  className="avatar"
                  src={`https://images.websim.ai/avatar/${peer?.username}`}
                  alt={peer?.username || 'Player'}
                />
                <span>{peer?.username || 'Player Left'}</span>
                <span>{gameData?.hands?.[id]?.length || 0} Cards</span>
                {gameData.currentPlayer === id && <span>🎮</span>}
                {gameData.unoCalled === id && <span className="uno-called">UNO!</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="turn-info-container">
        <span>Turn: <span className="turn-info-player">{peers[gameData.currentPlayer]?.username || 'Player Left'}</span></span>
        <span>Time Left: <span className="turn-timer">{turnTimeRemaining}s</span></span>
      </div>

      {isMyTurnNotificationVisible && (
        <div className="my-turn-notification">
          ⚠️ Your Turn! ⚠️
        </div>
      )}

      <div className="pile">
        <div className="draw-pile" onClick={drawCard}>
          <Card card={{color: 'red', value: ''}} />
        </div>
        <div className="cards-remaining" style={{
          '--active-color-light': activeColor ? `var(--${activeColor}-light)` : '#fff'
        }}>
          {gameData.deck.length}
          <style>{`
            .cards-remaining::after {
              background-color: var(--${activeColor}-light);
              box-shadow: 0 0 15px var(--${activeColor}-light);
            }
          `}</style>
        </div>
        <div className="discard-pile">
          {gameData.discard.length > 0 && (
            <Card
              card={gameData.discard[gameData.discard.length - 1]}
              onClick={() => {}}
            />
          )}
        </div>
      </div>

      <div className="hand">
        {playerHand.map((card, index) => (
          <Card
            key={index}
            card={card}
            onClick={() => isCurrentPlayer && onPlayCard(card)}
          />
        ))}
      </div>

      {canCallUno && ( // Only render button if canCallUno is true
        <button
          className={`uno-button ${gameData.unoCalled === currentPlayerId ? 'called' : ''}`}
          onClick={onUno}
        >
          UNO!
        </button>
      )}

      <div className="action-log-container">
        <div className="action-log-title">Game Actions:</div>
        <div className="action-log">
          {gameData.actionLog.length > 0 && ( // Conditionally render only if there are actions
            <div className="action-message">{gameData.actionLog[0]}</div> // Display only the latest action
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
