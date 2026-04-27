# Survey Project - Setup Instructions

## Project Overview
This is a web-based survey application that collects responses and stores them in a Google Sheets spreadsheet.

## Project Structure
```
project/
├── images/
│   ├── female/
│   │   └── female_01.jpg to female_20.jpg
│   └── male/
│       └── male_01.jpg to male_20.jpg
├── welcome_screen.png
├── index_final.html
├── sketch_final.js
└── README.md
```

## How to Run

### Option 1: Direct Browser Opening (Try This First)
1. Simply double-click `index_final.html` to open it in your default browser
2. If images don't load or you see CORS errors, use Option 2 below

### Option 2: Local Server (Recommended)
The project may require a local server to properly load images and connect to Google Sheets.

#### Using Python (if installed):
```bash
# Navigate to the project folder
cd path/to/project/folder

# Start a local server
python3 -m http.server 8000

# Or if you have Python 2:
python -m SimpleHTTPServer 8000
```

Then open your browser and go to: `http://localhost:8000`

#### Using Node.js (if installed):
```bash
# Navigate to the project folder
cd path/to/project/folder

# Start a local server
npx http-server -p 8000
```

Then open your browser and go to: `http://localhost:8000`

#### Using PHP (if installed):
```bash
# Navigate to the project folder
cd path/to/project/folder

# Start a local server
php -S localhost:8000
```

Then open your browser and go to: `http://localhost:8000`

## Data Collection
Survey responses are automatically saved to a Google Sheets spreadsheet. The connection is already configured in the project files.

## Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection (for Google Sheets integration)
- Local server (Python, Node.js, or PHP) - only if direct opening doesn't work

## Troubleshooting
- **Images not loading**: Use a local server (Option 2)
- **Data not saving**: Check internet connection
- **Port already in use**: Try a different port number (e.g., 8001, 8080, 3000)

## Contact
If you have any questions or issues running the project, please contact me.
