# AI-Powered Excuse Generator System (Python Version)

A Python Flask web application that generates context-aware, believable excuses using AI-powered algorithms.

## Features

- **Excuse Generator**: Create context-aware excuses based on situation, urgency, audience, and relationship
- **Apology Generator**: Generate heartfelt apologies to follow up on excuses
- **Emergency Alerts**: Set up simulated emergency notifications
- **Dashboard**: View statistics and recent activity
- **Saved Excuses**: Save and manage your favorite excuses

## Installation

1. **Clone or download the project files**

2. **Install Python dependencies**:
   ```bash
   python -m pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python run.py
   ```
   
   Or directly:
   ```bash
   python app.py
   ```

4. **Open your browser** and go to: `http://localhost:5000`

## Project Structure

```
excuse-generator/
├── app.py                 # Main Flask application
├── run.py                 # Application runner script
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   └── js/
│       └── app.js        # Frontend JavaScript
└── README.md             # This file
```

## Usage

1. **Generate Excuses**: 
   - Navigate to the "Generate" tab
   - Configure your context (situation, urgency, audience, relationship)
   - Click "Generate Excuse" to create a believable excuse

2. **Create Apologies**:
   - Go to the "Apology" tab
   - Select tone and length
   - Generate heartfelt apologies

3. **Emergency Alerts**:
   - Set up simulated emergency notifications
   - Configure sender and message content

4. **View Dashboard**:
   - See statistics and recent activity
   - Quick access to all features

## API Endpoints

- `GET /` - Main application page
- `POST /api/generate-excuse` - Generate a new excuse
- `POST /api/generate-apology` - Generate an apology
- `POST /api/save-excuse` - Save an excuse
- `POST /api/emergency-alert` - Create emergency alert
- `GET /api/stats` - Get application statistics
- `GET /api/excuses` - Get all generated excuses
- `GET /api/saved-excuses` - Get saved excuses

## VS Code Setup

To run this project in VS Code:

1. **Open the project folder** in VS Code
2. **Install Python extension** if not already installed
3. **Select Python interpreter**: 
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Python: Select Interpreter"
   - Choose your Python installation
4. **Install dependencies** in the integrated terminal:
   ```bash
   python -m pip install -r requirements.txt
   ```
5. **Run the application**:
   - Press `F5` to run with debugger, or
   - Run `python run.py` in the terminal

## Important Notice

⚠️ **This application is for entertainment and educational purposes only.** 

- Do not use generated content for deceptive or harmful purposes
- Use responsibly and ethically
- Emergency alerts are simulated and should not be used for actual emergencies

## Troubleshooting

### Common Issues:

1. **Port already in use**: Change the port in `app.py` or `run.py`
2. **Module not found**: Make sure all dependencies are installed with `python -m pip install -r requirements.txt`
3. **Permission errors**: Run with appropriate permissions or use a virtual environment

### Virtual Environment (Recommended):

```bash
# Create virtual environment
python -m venv excuse_env

# Activate it
# On Windows:
excuse_env\Scripts\activate
# On Mac/Linux:
source excuse_env/bin/activate

# Install dependencies
python -m pip install -r requirements.txt

# Run the application
python run.py
```

## License

This project is for educational purposes. Use responsibly and ethically.