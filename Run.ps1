<#
Complete Legal Aid - Local Setup and Run Script (Windows PowerShell)
This script sets up and runs both backend and frontend servers on Windows 11.

Requirements:
- PowerShell 7+ recommended
- Python 3.10+
- Node.js 18+
- npm 9+
- MySQL Server installed and running
#>

param(
    [switch]$SetupOnly,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipSetup,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Color utilities
function Write-Color {
    param([string]$Message, [ConsoleColor]$Color)
    $orig = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $orig
}

function Header {
    param([string]$Title)
    Write-Host ""
    Write-Color "==========================================" Blue
    Write-Color $Title Blue
    Write-Color "==========================================" Blue
    Write-Host ""
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendDir = Join-Path $ScriptDir "Backend"
$FrontendDir = Join-Path $ScriptDir "Frontend"

function CommandExists($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Check-Prerequisites {
    Header "Checking Prerequisites"

    $missing = $false

    if (CommandExists "python") {
        Write-Color "Python found: $(python --version)" Green
    } else {
        Write-Color "Python not found. Install Python 3.10+." Red
        $missing = $true
    }

    if (CommandExists "node") {
        Write-Color "Node.js found: $(node --version)" Green
    } else {
        Write-Color "Node.js not found. Install Node.js 18+." Red
        $missing = $true
    }

    if (CommandExists "npm") {
        Write-Color "npm found: $(npm --version)" Green
    } else
        {
        Write-Color "npm not found. Install npm." Red
        $missing = $true
    }

    $mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysqlCmd) {
        Write-Color "MySQL found: $( & $mysqlCmd.Source --version )" Green
    } else {
        Write-Color "MySQL command-line client not detected. Continuing, but ensure MySQL Server is running and add its bin directory to PATH." Yellow
    }

    if ($missing) {
        Write-Color "Install missing prerequisites and re-run the script." Red
        exit 1
    }

    Write-Color "All prerequisites satisfied." Green
}

function Setup-Backend {
    Header "Setting Up Backend"

    Set-Location $BackendDir

    if (!(Test-Path "venv")) {
        Write-Color "Creating Python virtual environment..." Yellow
        python -m venv venv
        Write-Color "Virtual environment created." Green
    } else {
        Write-Color "Virtual environment already exists." Green
    }

    Write-Color "Activating virtual environment..." Yellow
    & "$BackendDir\venv\Scripts\Activate.ps1"

    Write-Color "Upgrading pip..." Yellow
    pip install --upgrade pip | Out-Null

    if (Test-Path "requirements.txt") {
        Write-Color "Installing Python dependencies..." Yellow
        pip install -r requirements.txt | Out-Null
        Write-Color "Dependencies installed." Green
    } else {
        Write-Color "requirements.txt missing." Red
        exit 1
    }

    if (!(Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Color "Edit Backend/.env with database credentials." Yellow
        } else {
            Write-Color ".env.example missing." Red
            exit 1
        }
    }

 Write-Color "Checking database connectivity..." Yellow
try {
    $dbTestCode = @"
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

conn = pymysql.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', '12345678')
)
print("OK")
"@

    python -c $dbTestCode | Out-Null
    Write-Color "Database connection confirmed." Green
}
catch {
    Write-Color "Database unreachable. Running create_db.py..." Yellow
    python create_db.py
}


    Write-Color "Applying migrations..." Yellow
    python manage.py migrate --noinput
    Write-Color "Migrations complete." Green

    Write-Color "Validating superuser..." Yellow
    python manage.py shell -c "
from api.models import User
exit(0 if User.objects.filter(is_superuser=True).exists() else 1)
"
    if ($LASTEXITCODE -ne 0) {
        Write-Color "Creating superuser..." Yellow
        python create_superuser.py
    }

    Write-Color "Backend setup complete." Green
}

function Setup-Frontend {
    Header "Setting Up Frontend"

    Set-Location $FrontendDir

    if (!(Test-Path "node_modules")) {
        Write-Color "Installing Node.js dependencies..." Yellow
        npm install | Out-Null
        Write-Color "Dependencies installed." Green
    } else {
        Write-Color "Node modules already present. Syncing..." Yellow
        npm install | Out-Null
    }

    if (!(Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Color "Edit Frontend/.env with API config." Yellow
        } else {
            Write-Color ".env.example missing." Red
            exit 1
        }
    }

    Write-Color "Frontend setup complete." Green
}

function Kill-Port($port) {
    $pids = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess)

    foreach ($pid in $pids) {
        Write-Color "Killing PID $pid on port $port..." Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

function Start-Backend {
    Header "Starting Backend Server"

    Kill-Port 8000

    Set-Location $BackendDir
    & "$BackendDir\venv\Scripts\Activate.ps1"

    Write-Color "Launching Django server on http://localhost:8000" Green

    Start-Process powershell -ArgumentList "-Command", "& '$BackendDir\venv\Scripts\Activate.ps1'; cd '$BackendDir'; python manage.py runserver" -NoNewWindow
}

function Start-Frontend {
    Header "Starting Frontend Server"

    Kill-Port 3000

    Set-Location $FrontendDir
    Write-Color "Launching Vite server on http://localhost:3000" Green

    Start-Process powershell -ArgumentList "-Command", "cd '$FrontendDir'; npm run dev" -NoNewWindow
}

function Show-Help {
@"
Usage: run_local.ps1 [options]

Options:
  --SetupOnly       Run setup only
  --BackendOnly     Start backend only
  --FrontendOnly    Start frontend only
  --SkipSetup       Skip setup workflow
  --Help            Display this message
"@
}

if ($Help) {
    Show-Help
    exit 0
}

Header "Complete Legal Aid - Local Setup & Run"
Write-Color "Initiating automation sequence..." Green

Check-Prerequisites

if (-not $SkipSetup) {
    if (-not $FrontendOnly) { Setup-Backend }
    if (-not $BackendOnly) { Setup-Frontend }
} else {
    Write-Color "Setup phase skipped." Yellow
}

if ($SetupOnly) {
    Write-Color "Setup completed. Rerun script to start servers." Green
    exit 0
}

if (-not $FrontendOnly) { Start-Backend }
if (-not $BackendOnly)  { Start-Frontend }

Header "System Operational"

Write-Color "Backend:  http://localhost:8000/api/" Green
Write-Color "Admin:    http://localhost:8000/admin/" Green

if (-not $BackendOnly) {
    Write-Color "Frontend: http://localhost:3000" Green
}

Write-Color "Admin Credentials:" Yellow
Write-Color "Email:    admin@cla.bd" Yellow
Write-Color "Password: admin123" Yellow

Write-Color "Servers running in this terminal." Blue
Write-Color "Press Ctrl+C to stop the servers." Blue

try {
    while ($true) { Start-Sleep -Seconds 1 }
}
catch {
    Write-Host "`nStopping servers..."
    Kill-Port 8000
    Kill-Port 3000
}