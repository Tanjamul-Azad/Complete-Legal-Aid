#!/bin/bash

# Complete Legal Aid - Local Setup and Run Script
# This script sets up and runs both backend and frontend servers

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Backend"
FRONTEND_DIR="$SCRIPT_DIR/Frontend"

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print section header
print_header() {
    echo ""
    print_message "$BLUE" "=========================================="
    print_message "$BLUE" "$1"
    print_message "$BLUE" "=========================================="
    echo ""
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local missing_prereqs=0
    
    # Check Python
    if command_exists python3; then
        print_message "$GREEN" "✓ Python3 found: $(python3 --version)"
    else
        print_message "$RED" "✗ Python3 not found. Please install Python 3.10+"
        missing_prereqs=1
    fi
    
    # Check Node.js
    if command_exists node; then
        print_message "$GREEN" "✓ Node.js found: $(node --version)"
    else
        print_message "$RED" "✗ Node.js not found. Please install Node.js 18+"
        missing_prereqs=1
    fi
    
    # Check npm
    if command_exists npm; then
        print_message "$GREEN" "✓ npm found: $(npm --version)"
    else
        print_message "$RED" "✗ npm not found. Please install npm"
        missing_prereqs=1
    fi
    
    # Check MySQL
    if command_exists mysql; then
        print_message "$GREEN" "✓ MySQL found: $(mysql --version)"
    else
        print_message "$YELLOW" "⚠ MySQL not found. Make sure MySQL server is installed and running"
        print_message "$YELLOW" "  Install: brew install mysql"
        missing_prereqs=1
    fi
    
    if [ $missing_prereqs -eq 1 ]; then
        print_message "$RED" "Please install missing prerequisites and run again."
        exit 1
    fi
    
    print_message "$GREEN" "All prerequisites satisfied!"
}

# Setup backend
setup_backend() {
    print_header "Setting Up Backend"
    
    cd "$BACKEND_DIR"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_message "$YELLOW" "Creating Python virtual environment..."
        python3 -m venv venv
        print_message "$GREEN" "✓ Virtual environment created"
    else
        print_message "$GREEN" "✓ Virtual environment already exists"
    fi
    
    # Activate virtual environment
    print_message "$YELLOW" "Activating virtual environment..."
    source venv/bin/activate
    
    # Install/upgrade pip
    print_message "$YELLOW" "Upgrading pip..."
    pip install --upgrade pip --quiet
    
    # Install dependencies
    print_message "$YELLOW" "Installing Python dependencies..."
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt --quiet
        print_message "$GREEN" "✓ Python dependencies installed"
    else
        print_message "$RED" "✗ requirements.txt not found"
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_message "$YELLOW" "Creating .env file from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_message "$YELLOW" "⚠ Please edit Backend/.env with your database credentials"
        else
            print_message "$RED" "✗ .env.example not found"
            exit 1
        fi
    else
        print_message "$GREEN" "✓ .env file exists"
    fi
    
    # Check database connection
    print_message "$YELLOW" "Checking database connection..."
    if python3 -c "import pymysql; import os; from dotenv import load_dotenv; load_dotenv(); conn = pymysql.connect(host=os.getenv('DB_HOST', 'localhost'), user=os.getenv('DB_USER', 'root'), password=os.getenv('DB_PASSWORD', '12345678')); print('OK')" 2>/dev/null | grep -q "OK"; then
        print_message "$GREEN" "✓ Database connection successful"
    else
        print_message "$YELLOW" "⚠ Could not connect to database. Running create_db.py..."
        python3 create_db.py || print_message "$YELLOW" "⚠ Database setup may need manual intervention"
    fi
    
    # Run migrations
    print_message "$YELLOW" "Running database migrations..."
    python manage.py migrate --noinput
    print_message "$GREEN" "✓ Migrations applied"
    
    # Check if superuser exists
    print_message "$YELLOW" "Checking for superuser..."
    if python manage.py shell -c "from api.models import User; exit(0 if User.objects.filter(is_superuser=True).exists() else 1)" 2>/dev/null; then
        print_message "$GREEN" "✓ Superuser already exists"
    else
        print_message "$YELLOW" "Creating superuser..."
        python3 create_superuser.py || print_message "$YELLOW" "⚠ Superuser creation may need manual intervention"
    fi
    
    print_message "$GREEN" "Backend setup complete!"
}

# Setup frontend
setup_frontend() {
    print_header "Setting Up Frontend"
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_message "$YELLOW" "Installing Node dependencies (this may take a few minutes)..."
        npm install
        print_message "$GREEN" "✓ Node dependencies installed"
    else
        print_message "$GREEN" "✓ Node dependencies already installed"
        print_message "$YELLOW" "Checking for updates..."
        npm install
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_message "$YELLOW" "Creating .env file from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_message "$YELLOW" "⚠ Please edit Frontend/.env with your API keys"
        else
            print_message "$RED" "✗ .env.example not found"
            exit 1
        fi
    else
        print_message "$GREEN" "✓ .env file exists"
    fi
    
    print_message "$GREEN" "Frontend setup complete!"
}

# Kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        print_message "$YELLOW" "Killing process on port $port (PID: $pid)..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Start backend server
start_backend() {
    print_header "Starting Backend Server"
    
    # Kill any existing process on port 8000
    kill_port 8000
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    print_message "$GREEN" "Starting Django server on http://localhost:8000"
    print_message "$BLUE" "Backend logs:"
    echo ""
    
    # Run backend server
    python manage.py runserver 2>&1 | while IFS= read -r line; do
        echo -e "${GREEN}[BACKEND]${NC} $line"
    done &
    
    BACKEND_PID=$!
    echo $BACKEND_PID > "$SCRIPT_DIR/.backend.pid"
    
    # Wait for backend to start
    print_message "$YELLOW" "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/api/ > /dev/null 2>&1; then
            print_message "$GREEN" "✓ Backend server is running!"
            break
        fi
        sleep 1
    done
}

# Start frontend server
start_frontend() {
    print_header "Starting Frontend Server"
    
    # Kill any existing process on port 3000
    kill_port 3000
    
    cd "$FRONTEND_DIR"
    
    print_message "$GREEN" "Starting Vite dev server on http://localhost:3000"
    print_message "$BLUE" "Frontend logs:"
    echo ""
    
    # Run frontend server (explicitly set working directory)
    (cd "$FRONTEND_DIR" && npm run dev) 2>&1 | while IFS= read -r line; do
        echo -e "${BLUE}[FRONTEND]${NC} $line"
    done &
    
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$SCRIPT_DIR/.frontend.pid"
    
    # Wait for frontend to start
    print_message "$YELLOW" "Waiting for frontend to start..."
    sleep 5
}

# Cleanup function
cleanup() {
    print_header "Shutting Down Servers"
    
    # Kill backend
    if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
        BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            print_message "$YELLOW" "Stopping backend server (PID: $BACKEND_PID)..."
            kill $BACKEND_PID 2>/dev/null || true
        fi
        rm "$SCRIPT_DIR/.backend.pid"
    fi
    
    # Kill frontend
    if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            print_message "$YELLOW" "Stopping frontend server (PID: $FRONTEND_PID)..."
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        rm "$SCRIPT_DIR/.frontend.pid"
    fi
    
    # Kill any remaining processes on ports
    kill_port 8000
    kill_port 3000
    
    print_message "$GREEN" "Servers stopped successfully!"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Display help
show_help() {
    cat << EOF
Complete Legal Aid - Local Setup and Run Script

Usage: ./run_local.sh [OPTIONS]

OPTIONS:
    --setup-only        Only run setup without starting servers
    --backend-only      Only start backend server
    --frontend-only     Only start frontend server
    --skip-setup        Skip setup and start servers directly
    --help              Show this help message

Examples:
    ./run_local.sh                  # Full setup and run both servers
    ./run_local.sh --setup-only     # Only setup, don't start servers
    ./run_local.sh --backend-only   # Only start backend
    ./run_local.sh --skip-setup     # Skip setup, start servers

The script will:
1. Check prerequisites (Python, Node.js, MySQL)
2. Setup backend (venv, dependencies, database, migrations)
3. Setup frontend (npm install, .env)
4. Start both servers (backend on :8000, frontend on :3000)

Press Ctrl+C to stop all servers and exit.

EOF
}

# Main execution
main() {
    local setup_only=0
    local backend_only=0
    local frontend_only=0
    local skip_setup=0
    
    # Parse arguments
    for arg in "$@"; do
        case $arg in
            --setup-only)
                setup_only=1
                shift
                ;;
            --backend-only)
                backend_only=1
                shift
                ;;
            --frontend-only)
                frontend_only=1
                shift
                ;;
            --skip-setup)
                skip_setup=1
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_message "$RED" "Unknown option: $arg"
                show_help
                exit 1
                ;;
        esac
    done
    
    print_header "Complete Legal Aid - Local Setup & Run"
    print_message "$GREEN" "Starting automated setup and deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Setup phase
    if [ $skip_setup -eq 0 ]; then
        if [ $frontend_only -eq 0 ]; then
            setup_backend
        fi
        
        if [ $backend_only -eq 0 ]; then
            setup_frontend
        fi
    else
        print_message "$YELLOW" "Skipping setup phase..."
    fi
    
    # Exit if setup-only
    if [ $setup_only -eq 1 ]; then
        print_message "$GREEN" "Setup complete! Run without --setup-only to start servers."
        exit 0
    fi
    
    # Start servers
    if [ $frontend_only -eq 0 ]; then
        start_backend
    fi
    
    if [ $backend_only -eq 0 ]; then
        start_frontend
    fi
    
    # Display success message
    print_header "🎉 Complete Legal Aid is Running!"
    echo ""
    print_message "$GREEN" "✓ Backend API:     http://localhost:8000/api/"
    print_message "$GREEN" "✓ Admin Panel:     http://localhost:8000/admin/"
    if [ $backend_only -eq 0 ]; then
        print_message "$GREEN" "✓ Frontend App:    http://localhost:3000"
    fi
    echo ""
    print_message "$YELLOW" "Credentials:"
    print_message "$YELLOW" "  Email:    ahbab.md@gmail.com"
    print_message "$YELLOW" "  Password: ahbab2018"
    echo ""
    print_message "$BLUE" "Press Ctrl+C to stop all servers"
    echo ""
    
    # Keep script running
    wait
}

# Run main function
main "$@"
