const GameService = require('../services/CPMgame.services');
const logger = require('../utils/CPMlogger.utils');

// * Socket Event Handler Setup
const setupGameSocket = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // * Initialize Game Handler
    socket.on('initializeGame', async (dimensions) => {
      try {
        const { width = 5, height = 5 } = dimensions || {};
        const game = await GameService.initializeBoard(width, height);
        socket.emit('gameInitialized', {
          boardId: game.boardId,
          board: game.board,
          width: game.width,
          height: game.height
        });
      } catch (error) {
        logger.error('Error initializing game:', error);
        socket.emit('error', { message: 'Failed to initialize game' });
      }
    });

    // * Place Rectangle Handler
    socket.on('placeRectangle', async ({ boardId, rectangle }) => {
      try {
        const game = await GameService.placeRectangle(boardId, rectangle);
        const { isWin } = await GameService.checkWin(boardId);
        
        socket.emit('rectanglePlaced', {
          rectangles: game.rectangles,
          isWin,
          elapsedTime: game.elapsedTime
        });
      } catch (error) {
        logger.error('Error placing rectangle:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // * Remove Rectangle Handler
    socket.on('removeRectangle', async ({ boardId, startX, startY, endX, endY }) => {
      try {
        const game = await GameService.removeRectangle(boardId, startX, startY, endX, endY);
        socket.emit('rectangleRemoved', { rectangles: game.rectangles });
      } catch (error) {
        logger.error('Error removing rectangle:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // * Check Win Handler
    socket.on('checkWin', async ({ boardId }) => {
      try {
        const { isWin, game } = await GameService.checkWin(boardId);
        socket.emit('winCheck', {
          isWin,
          elapsedTime: game.elapsedTime
        });
      } catch (error) {
        logger.error('Error checking win condition:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // * Reset Game Handler
    socket.on('resetGame', async ({ boardId }) => {
      try {
        const game = await GameService.resetGame(boardId);
        socket.emit('gameInitialized', {
          boardId: game.boardId,
          width: game.width,
          height: game.height,
          board: game.board
        });
      } catch (error) {
        logger.error('Error resetting game:', error);
        socket.emit('error', { message: 'Failed to reset game' });
      }
    });

    // * Disconnect Handler
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupGameSocket; 