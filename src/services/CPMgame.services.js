const Game = require('../models/CPMgame.models');
const { v4: uuidv4 } = require('uuid');

class GameService {
  static generateShikakuPuzzle(width = 5, height = 5) {
    // * Initialize Grid
    const grid = Array.from({ length: height }, () => Array(width).fill(false));
    const numbers = [];
    const rectangles = [];

    while (true) {
        // * Find Empty Cells
        const availableCells = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!grid[y][x]) availableCells.push({ x, y });
            }
        }
        
        if (availableCells.length === 0) break;
        
        const { x, y } = availableCells[Math.floor(Math.random() * availableCells.length)];
        
        // * Generate Rectangle
        let maxWidth = 0;
        while (x + maxWidth < width && !grid[y][x + maxWidth]) maxWidth++;
        
        const possibleRectangles = [];
        for (let w = 1; w <= maxWidth; w++) {
            let maxHeight = 0;
            outer: for (let h = 1; h <= height - y; h++) {
                for (let dy = 0; dy < h; dy++) {
                    for (let dx = 0; dx < w; dx++) {
                        if (grid[y + dy][x + dx]) break outer;
                    }
                }
                maxHeight = h;
            }
            if (maxHeight > 0) possibleRectangles.push({ w, h: maxHeight });
        }

        if (possibleRectangles.length === 0) continue;
        
        const { w, h } = possibleRectangles[Math.floor(Math.random() * possibleRectangles.length)];
        const area = w * h;
        
        // * Update Grid
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                grid[y + dy][x + dx] = true;
            }
        }

        numbers.push({ x, y, value: area });
        rectangles.push({
            startX: x,
            startY: y,
            width: w,
            height: h,
            value: area
        });
    }

    return { numbers, rectangles };
  }

  static generateValidPuzzle(width = 5, height = 5) {
    // * Generate Board
    const board = Array(height).fill().map(() => Array(width).fill(0));
    const solution = [];

    const { numbers, rectangles } = this.generateShikakuPuzzle(width, height);
    
    // * Create Solution
    numbers.forEach(({ x, y, value }) => {
      board[y][x] = value;
    });

    rectangles.forEach(({ startX, startY, width, height, value }) => {
      solution.push({
        startX,
        startY,
        endX: startX + width - 1,
        endY: startY + height - 1,
        value
      });
    });

    return { board, solution };
  }

  static createSpecificPuzzle() {
    // * Initialize Board
    const width = 5;
    const height = 5;
    const board = Array(height).fill().map(() => Array(width).fill(0));
    const solution = [];

    // * Define Numbers
    const numbers = [
      { x: 3, y: 0, value: 4 },
      { x: 1, y: 1, value: 4 },
      { x: 3, y: 1, value: 2 },
      { x: 3, y: 2, value: 2 },
      { x: 0, y: 3, value: 4 },
      { x: 2, y: 3, value: 2 },
      { x: 0, y: 4, value: 2 },
      { x: 3, y: 4, value: 2 },
      { x: 4, y: 4, value: 3 }
    ];

    numbers.forEach(({ x, y, value }) => {
      board[y][x] = value;
    });

    // * Define Solution
    const rectangles = [
      { startX: 3, startY: 0, width: 2, height: 1, value: 4 },
      { startX: 1, startY: 1, width: 2, height: 2, value: 4 },
      { startX: 3, startY: 1, width: 2, height: 1, value: 2 },
      { startX: 3, startY: 2, width: 1, height: 2, value: 2 },
      { startX: 0, startY: 3, width: 1, height: 2, value: 4 },
      { startX: 1, startY: 3, width: 2, height: 1, value: 2 },
      { startX: 3, startY: 3, width: 2, height: 1, value: 2 },
      { startX: 0, startY: 4, width: 2, height: 1, value: 2 },
      { startX: 3, startY: 4, width: 2, height: 1, value: 3 }
    ];

    rectangles.forEach(({ startX, startY, width, height, value }) => {
      solution.push({
        startX,
        startY,
        endX: startX + width - 1,
        endY: startY + height - 1,
        value
      });
    });

    return { board, solution, width, height };
  }

  static async initializeBoard(width = 5, height = 5) {
    try {
      // * Create New Game
      const { board, solution } = this.generateValidPuzzle(width, height);
      const boardId = uuidv4();
      
      const game = new Game({
        boardId,
        width,
        height,
        board,
        solution,
        rectangles: [],
        isComplete: false,
        startTime: new Date()
      });

      await game.save();
      return game;
    } catch (error) {
      console.error("Error in initializeBoard:", error);
      throw error;
    }
  }

  static async getGame(boardId) {
    return await Game.findOne({ boardId });
  }

  static async placeRectangle(boardId, rectangle) {
    const game = await this.getGame(boardId);
    if (!game) throw new Error('Game not found');

    game.rectangles.push(rectangle);
    await game.save();
    return game;
  }

  static async removeRectangle(boardId, startX, startY, endX, endY) {
    const game = await this.getGame(boardId);
    if (!game) throw new Error('Game not found');

    game.rectangles = game.rectangles.filter(rect => 
      !(rect.startX === startX && rect.startY === startY && 
        rect.endX === endX && rect.endY === endY));
    
    await game.save();
    return game;
  }

  static async checkWin(boardId) {
    const game = await this.getGame(boardId);
    if (!game) throw new Error('Game not found');

    // * Check Solution Match
    const playerRects = new Set(game.rectangles.map(r => 
      `${r.startX},${r.startY},${r.endX},${r.endY},${r.value}`
    ));

    const solutionRects = new Set(game.solution.map(r =>
      `${r.startX},${r.startY},${r.endX},${r.endY},${r.value}`
    ));

    const isWin = playerRects.size === solutionRects.size &&
      [...playerRects].every(rect => solutionRects.has(rect));

    // * Update Game Status
    if (isWin && !game.isComplete) {
      game.isComplete = true;
      game.endTime = new Date();
      game.elapsedTime = game.endTime - game.startTime;
      await game.save();
    }

    return { isWin, game };
  }

  static async resetGame(boardId) {
    // * Reset Game State
    const game = await Game.findOne({ boardId });
    if (!game) throw new Error('Game not found');

    game.rectangles = [];
    game.startTime = new Date();
    game.endTime = null;
    game.isComplete = false;
    game.elapsedTime = 0;
    await game.save();

    return game;
  }

  static async getElapsedTime(boardId) {
    const game = await Game.findOne({ boardId });
    if (!game) throw new Error('Game not found');

    if (game.isComplete) {
      return game.elapsedTime / 1000;
    }
    
    const now = new Date();
    return (now - game.startTime) / 1000;
  }
}

module.exports = GameService; 