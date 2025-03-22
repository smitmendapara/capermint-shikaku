# capermint-shikaku

A web-based implementation of the Shikaku puzzle game, where players need to divide a grid into rectangles based on given numbers.

## Game Description

Shikaku is a logic puzzle where players must divide a grid into rectangles based on numbers placed in cells. Each number indicates the area of the rectangle that should contain it.

### Rules
1. The grid must be completely divided into rectangles
2. Each rectangle must contain exactly one number
3. The area of each rectangle must equal the number it contains
4. Rectangles cannot overlap
5. All rectangles must be placed horizontally or vertically (no diagonal shapes)

## Features

- Interactive grid-based gameplay
- Dynamic board sizes (5x5, 6x6, 7x7, 8x8)
- Real-time validation of moves
- Timer to track solving time
- Save and resume game progress
- Multiple predefined puzzle patterns
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, EJS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Logging**: Winston
- **Environment Variables**: dotenv

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/smitmendapara/capermint-shikaku
   cd capermint-shikaku
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory from `example.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/shikaku
   NODE_ENV=development
   ```

4. Run the application:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Error Handling

The application includes comprehensive error handling:
- Client-side validation for moves
- Server-side validation for game rules
- Socket connection error recovery
- Database operation error handling
- Detailed error logging
