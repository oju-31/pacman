#!/bin/bash

# Pacman Game Build Script
echo "🎮 Building Pacman Game..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. Trying docker compose..."
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Build and start the application
print_status "Building Docker image..."
$COMPOSE_CMD build

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully!"
    
    print_status "Starting the application..."
    $COMPOSE_CMD up -d
    
    if [ $? -eq 0 ]; then
        print_status "🎉 Pacman Game is now running!"
        print_status "🌐 Open your browser and go to: http://localhost:3000"
        print_status "🔍 Health check available at: http://localhost:3000/health"
        print_status ""
        print_status "To stop the game, run: $COMPOSE_CMD down"
        print_status "To view logs, run: $COMPOSE_CMD logs -f"
    else
        print_error "Failed to start the application"
        exit 1
    fi
else
    print_error "Failed to build Docker image"
    exit 1
fi
