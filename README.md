# 🎮 Pacman Game

A modern TypeScript implementation of the classic Pacman game with sound effects, lives system, and power-ups!

## 🚀 Features

- **Classic Gameplay** - Navigate mazes, collect pellets, avoid ghosts
- **Lives System** - Start with 3 lives, collect hearts for extra lives
- **Sound Effects** - Background music and sound effects for all actions
- **Power-ups** - Heart icons spawn every 30 seconds for extra lives
- **Smart Ghost AI** - Ghosts actively chase the player
- **Game Controls** - Pause, resume, reset, and mute functionality
- **Responsive Design** - Works on desktop browsers

## 🎯 Game Controls

- **🎮 Movement**: Arrow Keys or WASD
- **⏸️ Pause/Resume**: P key or Pause button
- **🔄 Reset**: R key or Reset button
- **🚀 Start**: S key or Start button
- **🔊 Sound Toggle**: M key or Sound button

## 🐳 Docker Deployment

### Quick Start with Docker

1. **Build and run with Docker Compose** (Recommended):
   ```bash
   docker-compose up --build -d
   ```

2. **Or build and run manually**:
   ```bash
   # Build the image
   docker build -t pacman-game .
   
   # Run the container
   docker run -p 3000:80 pacman-game
   ```

3. **Access the game**:
   Open your browser and go to `http://localhost:3000`

### Docker Commands

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Start with docker-compose
npm run docker:compose

# Build and start with docker-compose
npm run docker:compose:build

# Stop the containers
npm run docker:stop
```

### Production Deployment

The Docker setup includes:
- **Multi-stage build** for optimized image size
- **Nginx** for serving static files
- **Gzip compression** for better performance
- **Security headers** for protection
- **Health checks** for monitoring
- **Caching strategies** for static assets

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
pacman-game/
├── src/
│   ├── Game.ts          # Main game logic
│   ├── Player.ts        # Pacman player class
│   ├── Ghost.ts         # Ghost AI logic
│   ├── GameBoard.ts     # Maze and board logic
│   ├── PowerUp.ts       # Heart power-ups
│   ├── SoundManager.ts  # Audio system
│   ├── types.ts         # TypeScript interfaces
│   └── main.ts          # Entry point
├── index.html           # Main HTML file
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── nginx.conf           # Nginx configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

## 🎵 Audio System

The game includes a complete audio system with:
- **Procedurally generated sounds** using Web Audio API
- **Background music** during gameplay
- **Sound effects** for pellets, power-ups, game events
- **Mute/unmute functionality**
- **Volume controls** for music and effects

## 💖 Lives & Power-ups

- **Start with 3 lives** (❤️❤️❤️)
- **Heart power-ups** spawn every 30 seconds
- **Collect hearts** to gain extra lives
- **Hearts disappear** after 10 seconds if not collected
- **Strategic gameplay** - risk vs reward for collecting hearts

## 🤖 Ghost AI

- **Intelligent pathfinding** - Ghosts actively chase the player
- **Dynamic behavior** - Ghosts change direction strategically
- **Collision avoidance** - Smart navigation around walls
- **Multiple ghost types** with different colors

## 🌐 Browser Compatibility

- **Modern browsers** with ES6+ support
- **Web Audio API** support required for sound
- **Canvas API** support required for graphics
- **Responsive design** for different screen sizes

## 📊 Performance

The Docker setup is optimized for production:
- **Gzip compression** reduces file sizes
- **Static asset caching** improves load times
- **Nginx** serves files efficiently
- **Health checks** ensure reliability

## 🔧 Configuration

### Environment Variables
- `NODE_ENV` - Set to 'production' for optimized builds

### Docker Ports
- **Container Port**: 80 (nginx)
- **Host Port**: 3000 (configurable in docker-compose.yml)

### Health Check
The container includes a health check endpoint at `/health`

## 🚀 Deployment Options

1. **Local Docker**: `docker-compose up`
2. **Cloud Platforms**: Deploy the Docker image to any container platform
3. **Static Hosting**: Build and deploy the `dist` folder to any static host
4. **Kubernetes**: Use the Docker image in K8s deployments

## 🎮 How to Play

1. **Start the game** by clicking "Start Game" or pressing S
2. **Move Pacman** using arrow keys or WASD
3. **Collect all pellets** to win the level
4. **Avoid ghosts** - they will chase you!
5. **Collect hearts** (❤️) for extra lives
6. **Use controls** to pause, reset, or mute as needed

## 🏆 Scoring

- **Pellets**: 10 points each
- **Winning bonus**: 1000 points
- **Extra lives**: Collect hearts for more chances

Enjoy playing! 🎮✨
