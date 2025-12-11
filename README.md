# 🤖 Agentic Calculator

An intelligent AI-powered calculator agent with a modern web interface that solves mathematical expressions, provides step-by-step breakdowns, and generates personalized recommendations.

## ✨ Features

### Core Capabilities
- **Advanced Math Expressions**: Solves complex calculations with proper operator precedence
  - Basic operations: `5 + 3 * 2` → respects PEMDAS order
  - Parentheses: `(10 + 5) * 2` → grouped expressions
  - Exponents: `2^10` → power calculations
  - Percentages: `15% of 300` → percentage calculations
  - Complex expressions: `25 * 4 + 18 / (5 - 2)`

### Smart Recommendations
- **Context-Aware Suggestions**: Get personalized recommendations based on your calculation type
  - Order of operations explanations
  - Percentage calculation tips
  - Exponent notation guidance
  - Rounding and precision advice
  - Related calculation suggestions

### Step-by-Step Breakdown
- Click on any "step-by-step breakdown" recommendation to see:
  - Original question parsing
  - Mathematical expression extraction
  - Step-by-step evaluation order (PEMDAS)
  - Final calculated result
  - Related calculations for the extracted numbers

### History Management
- **Recent Questions Panel**: View last 5 questions
- **Click to Reload**: Click any history item to instantly reload its answer
- **Clear History**: Remove all history with one click

### User-Friendly Interface
- Real-time answer display in point form
- Loading states and error handling
- Smooth animations and transitions
- Responsive design for desktop and mobile
- Intuitive keyboard support (Enter to submit)

## 🏗️ Project Structure

```
Calculator agent/
├── agentic-calculator-backend/          # Node.js/Express server
│   ├── agent.js                         # Core calculation logic
│   ├── server.js                        # API endpoints
│   ├── package.json                     # Backend dependencies
│   └── .env                             # Environment configuration
│
└── agentic-calculator-frontend/         # React/Vite frontend
    ├── src/
    │   ├── App.jsx                      # Main React component
    │   ├── App.css                      # Styling
    │   ├── index.css                    # Global styles
    │   ├── main.jsx                     # Entry point
    │   └── assets/                      # Images and resources
    ├── index.html                       # HTML template
    ├── vite.config.js                   # Vite configuration
    ├── package.json                     # Frontend dependencies
    └── eslint.config.js                 # Linting configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.19+ or 22.12+
- **npm** 9.0+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Imasha19/calculator_agent_AI.git
cd "Calculator agent"
```

2. **Backend Setup**
```bash
cd agentic-calculator-backend
npm install
```

3. **Frontend Setup**
```bash
cd ../agentic-calculator-frontend
npm install
```

### Configuration

Create `.env` file in `agentic-calculator-backend/`:
```env
OPENROUTER_API_KEY=your_api_key_here
PORT=5000
```

### Running the Application

**Terminal 1 - Backend Server:**
```bash
cd agentic-calculator-backend
node server.js
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend Dev Server:**
```bash
cd agentic-calculator-frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`

Open your browser and navigate to the displayed URL to start calculating!

## 🎯 Usage Examples

### Basic Calculations
- Type: `5 + 3`
- Get: `5 + 3 = 8` with recommendations

### Order of Operations
- Type: `25 * 4 + 18`
- Get: `25*4+18 = 118` with breakdown of PEMDAS

### Percentages
- Type: `15% of 300`
- Get: `(15/100)*300 = 45` with percentage tips

### Exponents
- Type: `2^10`
- Get: `Math.pow(2,10) = 1024` with exponent guidance

### Complex Expressions
- Type: `(15 + 7) * 3`
- Get: `(15+7)*3 = 66` with operation order explanation

### Try Asking Examples
Click any of the quick-start examples under "Try asking":
- `25 * 4 + 18`
- `15% of 300`
- `2^10`
- `(15 + 7) * 3`

## 🔌 API Endpoints

### POST `/ask`
**Calculate a mathematical expression**

Request:
```json
{
  "question": "What is 25 * 4 + 18?"
}
```

Response:
```json
{
  "answer": "25*4+18 = 118\n\nRecommendations:\n- Order of operations applied: multiplication/division before addition/subtraction.\n- Next: verify units (if applicable), try related calculations, or ask for step-by-step breakdown."
}
```

### POST `/breakdown`
**Get step-by-step breakdown and related calculations**

Request:
```json
{
  "question": "Calculate 15% of 300"
}
```

Response:
```json
{
  "breakdown": "Question: Calculate 15% of 300\nExpression: (15/100)*300\n\nStep 2: Evaluate multiplication and division (left to right)\n  → Apply * and / operations from left to right\n\nFinal Result: 45\n\nRelated Calculations:\n  → 15 + 300 = 315\n  → 15 - 300 = -285\n  → 15 * 300 = 4500\n  → 15 / 300 = 0.05"
}
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with animations
- **JavaScript ES6+** - Modern JavaScript

## 📋 Supported Mathematical Operations

| Operation | Syntax | Example |
|-----------|--------|---------|
| Addition | `+` | `10 + 5` |
| Subtraction | `-` | `10 - 5` |
| Multiplication | `*` | `10 * 5` |
| Division | `/` | `10 / 5` |
| Exponentiation | `^` | `2^10` |
| Percentage | `X% of Y` | `15% of 300` |
| Parentheses | `(expr)` | `(10 + 5) * 2` |
| Word Operators | `plus, minus, times, divided by` | `10 plus 5` |

## 🎨 UI Features

### Answer Display
- Multi-line answers rendered as bullet points
- Color-coded mathematical expressions
- Line numbering for clarity

### Recommendations Section
- Context-aware suggestions based on calculation type
- Clickable cards for interactive actions
- Visual indicators for importance

### Breakdown Section
- Arrow-formatted step-by-step breakdown
- Clear expression extraction
- Related calculation suggestions
- Close button for easy dismissal
- Auto-closes when new calculation requested

### History Panel
- Timestamp tracking
- Scrollable list (up to 5 items)
- Clickable items to reload answers
- Clear all button
- Hover effects for better UX

## 🔧 Development

### Build Frontend
```bash
cd agentic-calculator-frontend
npm run build
```

### Preview Production Build
```bash
cd agentic-calculator-frontend
npm run preview
```

### Run Linter
```bash
cd agentic-calculator-frontend
npm run lint
```

## 📦 Dependencies

### Backend
- express: ^5.2.1
- cors: ^2.8.5
- dotenv: ^17.2.3
- @langchain/openai: ^0.0.28
- langchain: ^0.2.0
- openai: ^6.10.0

### Frontend
- react: ^19.2.0
- react-dom: ^19.2.0

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is already in use: `netstat -ano | findstr :5000`
- Verify `.env` file exists with valid API key
- Check Node.js version: `node --version` (need 20.19+)

### Frontend won't load
- Clear node_modules and reinstall: `npm install`
- Check if port 5173 is available
- Try clearing browser cache (Ctrl+Shift+Delete)

### Calculations not working
- Check backend is running: `http://localhost:5000/ask`
- Open browser console (F12) to see error messages
- Verify API endpoint is accessible

### History not loading
- Open browser DevTools Console (F12)
- Check for any JavaScript errors
- Refresh the page

## 📝 Expression Parser Details

The agent uses sophisticated parsing to:
1. Extract numbers and mathematical operators from natural language
2. Convert word-based operators (plus, times, etc.) to symbols
3. Handle percentage calculations with "X% of Y" syntax
4. Convert exponent notation (`^`) to JavaScript `Math.pow()`
5. Validate parentheses are balanced
6. Respect PEMDAS order of operations
7. Handle floating-point precision with intelligent rounding

## 🎓 Learning Features

Each calculation provides:
- **Answer**: The exact computed result
- **Expression**: The mathematical formula used
- **Recommendations**: Personalized learning tips based on calculation type
- **Breakdown**: Step-by-step evaluation guide
- **Related Calculations**: Variations to explore

## 🚀 Deployment

### Production Build
```bash
cd agentic-calculator-frontend
npm run build
```

Static files will be in `dist/` directory.

### Environment Setup
For production, ensure these environment variables are set:
```env
OPENROUTER_API_KEY=your_production_api_key
PORT=5000
NODE_ENV=production
```

## 📄 License

ISC

## 👨‍💻 Author

**Imasha19**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Happy Calculating! 🎉**
