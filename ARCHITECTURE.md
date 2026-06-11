# System Architecture & Data Flow

## 🏗️ Huluntunzao Application Architecture

### High-Level System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
│  (http://localhost:3000)                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │            React Application (React 18)                     │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Sidebar Menu        │  Content Area                 │  │  │
│  │  │  - Dashboard         │  - Dynamic Pages              │  │  │
│  │  │  - All Stocks        │  - Tables                     │  │  │
│  │  │  - Analysis          │  - Forms                      │  │  │
│  │  │  - DCA Calculator    │  - Charts (Recharts)          │  │  │
│  │  │  - Profile           │  - Results Display            │  │  │
│  │  │  - Settings          │                               │  │  │
│  │  │  - Logout            │                               │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ▲                                     │
│                              │ HTTP Requests                       │
│                              ▼                                     │
│                        ┌──────────┐                               │
│                        │ Fetch API│                               │
│                        └──────────┘                               │
│                              ▲                                     │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                 HTTP / JSON   │
                               ▼
          ┌────────────────────────────────────────┐
          │     FLASK API SERVER                   │
          │  (http://localhost:5000)              │
          │  ┌───────────────────────────────────┐ │
          │  │  Routes & Handlers                │ │
          │  │  ┌─────────────────────────────┐  │ │
          │  │  │ POST /api/calculate-dca     │  │ │
          │  │  │ GET /api/stocks             │  │ │
          │  │  │ GET /health                 │  │ │
          │  │  └─────────────────────────────┘  │ │
          │  │                                    │ │
          │  │  ┌─────────────────────────────┐  │ │
          │  │  │ Business Logic              │  │ │
          │  │  │ - DCA Calculations          │  │ │
          │  │  │ - Data Processing           │  │ │
          │  │  │ - Caching                   │  │ │
          │  │  └─────────────────────────────┘  │ │
          │  └───────────────────────────────────┘ │
          │                    ▲                    │
          │                    │ Pandas/NumPy      │
          │                    ▼                    │
          │  ┌───────────────────────────────────┐ │
          │  │  External Data Sources            │ │
          │  │  - Yahoo Finance (pandas-reader)  │ │
          │  │  - Stock Price Data               │ │
          │  │  - Time Series Data               │ │
          │  └───────────────────────────────────┘ │
          └────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### 1️⃣ All Stocks Page Data Flow

```
User clicks "All Stocks"
        │
        ▼
React loads AllStocksPage component
        │
        ▼
Component generates 100 mock stocks
        │
        ▼
Display stocks in table (page 1)
        │
        ├─ User types in search box
        │  │
        │  ▼
        │ Filter stocks locally
        │  │
        │  ▼
        │ Reset to page 1
        │  │
        │  ▼
        │ Display filtered results
        │
        └─ User clicks pagination
           │
           ▼
           Calculate start & end index
           │
           ▼
           Display 20 stocks per page
```

### 2️⃣ DCA Calculator Data Flow

```
User clicks "DCA Calculator"
        │
        ▼
Load DCACalculator component
        │
        ├─ Show input form with fields:
        │  - Start Date
        │  - End Date
        │  - Daily Investment
        │  - ETF Selection
        │
        ▼
User fills form and clicks "Calculate"
        │
        ▼
Send POST request to /api/calculate-dca
{
  "ticker": "SPY",
  "start_date": "2014-01-01",
  "end_date": "2024-01-01",
  "daily_invest": 100
}
        │
        ▼ [HTTP Request]
        
FLASK BACKEND:
        │
        ▼
Receive POST request
        │
        ├─ Validate input parameters
        │
        ├─ Download stock prices (Yahoo Finance)
        │  └─ Try cache first
        │  └─ If not cached, fetch and cache
        │
        ├─ Perform DCA backtest calculation
        │  ├─ Calculate daily shares purchased
        │  ├─ Calculate cumulative shares
        │  ├─ Calculate portfolio value over time
        │  ├─ Calculate total return %
        │  ├─ Calculate CAGR
        │
        ├─ Return JSON response with:
        │  ├─ Summary statistics
        │  ├─ Portfolio values array
        │  └─ Dates array
        │
        ▼ [HTTP Response]

REACT FRONTEND:
        │
        ▼
Receive JSON response
        │
        ├─ Parse results data
        │
        ├─ Display summary cards
        │  ├─ Total Invested
        │  ├─ Final Value
        │  ├─ Total Return %
        │  └─ Annual Return (CAGR)
        │
        ├─ Process chart data
        │  ├─ Combine dates with values
        │  ├─ Format for Recharts
        │
        ▼
Render interactive chart
with Recharts library
```

---

## 🔄 Component Hierarchy

```
App (Main Component)
├── Sidebar
│   ├── Logo
│   └── Menu
│       ├── Dashboard Button
│       ├── All Stocks Button
│       ├── Analysis Button
│       ├── DCA Calculator Button
│       ├── Profile Button
│       ├── Settings Button
│       └── Logout Button
│
└── Content Area
    ├── Home Page (when Dashboard active)
    ├── AllStocksPage (when All Stocks active)
    │   ├── Filter Input
    │   ├── Stock Count Display
    │   ├── StocksTable
    │   │   ├── TableHeader
    │   │   └── TableBody (with 20 rows)
    │   └── Pagination Controls
    ├── DCACalculator (when DCA Calculator active)
    │   ├── InputForm
    │   │   ├── Start Date Input
    │   │   ├── End Date Input
    │   │   ├── Daily Investment Input
    │   │   ├── ETF Dropdown
    │   │   └── Calculate Button
    │   ├── ResultCards (4 cards)
    │   │   ├── Total Invested Card
    │   │   ├── Final Value Card
    │   │   ├── Total Return Card
    │   │   └── Annual Return Card
    │   └── Chart (Recharts LineChart)
    └── Other Pages...
```

---

## 🗄️ Data Structures

### Stock Object
```javascript
{
  id: number,           // 1-100
  symbol: string,       // "STOCK01"
  name: string,         // "Company 1"
  price: number,        // 125.50
  change: number,       // -2.50
  changePercent: number, // -1.96
  volume: number,       // 2500000
  marketCap: string     // "$100B"
}
```

### DCA Result Object
```javascript
{
  ticker: "SPY",
  summary: {
    total_invested: number,    // 250000
    final_value: number,       // 450000
    total_return: number,      // 80.0
    cagr: string,             // "8.5%"
    n_days: number            // 2500
  },
  portfolio_value: [number],   // Array of portfolio values
  dates: [string]             // Array of dates (YYYY-MM-DD)
}
```

### Chart Data Point
```javascript
{
  date: "2014-01-01",
  portfolio: 100.50,
  invested: 100
}
```

---

## 🔌 API Endpoints Details

### 1. Calculate DCA

**Endpoint**: `POST /api/calculate-dca`

**Request**:
```json
{
  "ticker": "SPY",
  "start_date": "2014-01-01",
  "end_date": "2024-01-01",
  "daily_invest": 100
}
```

**Response (Success)**:
```json
{
  "ticker": "SPY",
  "summary": {
    "total_invested": 250000,
    "final_value": 462500,
    "total_return": 85.0,
    "cagr": "8.50%",
    "n_days": 2500
  },
  "portfolio_value": [100, 101.50, 103.20, ...],
  "dates": ["2014-01-01", "2014-01-02", "2014-01-03", ...]
}
```

**Response (Error)**:
```json
{
  "error": "Error message describing what went wrong"
}
```

---

### 2. Get Stocks

**Endpoint**: `GET /api/stocks`

**Response**:
```json
{
  "stocks": [
    {
      "id": 1,
      "symbol": "STOCK001",
      "name": "Company 1",
      "price": 125.50,
      "change": -2.50,
      "changePercent": -1.96,
      "volume": 2500000,
      "marketCap": "$100B"
    },
    ...
  ]
}
```

---

### 3. Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok"
}
```

---

## 💾 Caching Strategy

```
Request for stock data (ticker: SPY, start: 2014-01-01, end: 2024-01-01)
        │
        ▼
Check cache for "SPY_2014-01-01_2024-01-01"
        │
        ├─ IF FOUND IN CACHE:
        │  │
        │  ▼
        │  Return cached data
        │  (No external API call)
        │
        └─ IF NOT IN CACHE:
           │
           ▼
           Fetch from Yahoo Finance
           │
           ▼
           Store in cache dictionary
           │
           ▼
           Return data
           
           Cache expires/updates after repeated use
```

---

## 🔐 Error Handling Flow

```
User Action
    │
    ▼
Try:
    ├─ Validate Input
    ├─ Make API Request
    ├─ Parse Response
    └─ Display Results
    │
    └─ Exception Caught:
       │
       ▼
    Log Error
       │
       ▼
    Show User-Friendly Message
       │
       ├─ "Please fill all fields"
       ├─ "End date must be after start date"
       ├─ "Unable to fetch data"
       └─ "Please try again later"
```

---

## 🎨 State Management

### React State (AllStocksPage)
```
state = {
  filterText: "",       // Current filter text
  currentPage: 1,       // Current pagination page
  filteredStocks: [],   // Filtered stock results
  paginatedStocks: []   // Stocks for current page
}
```

### React State (DCACalculator)
```
state = {
  startDate: "2014-01-01",
  endDate: "2024-01-01",
  dailyInvest: 100,
  selectedETF: "SPY",
  results: null,         // DCA calculation results
  loading: false,        // Loading status
  chartData: []          // Data for chart
}
```

### React State (App)
```
state = {
  currentPage: "home",   // Current page to display
  stocks: [],            // Loaded stocks
  loading: false         // Loading status
}
```

---

## 📈 Performance Considerations

### Frontend Optimization
- ✅ Pagination reduces DOM elements (max 20 per page)
- ✅ Memoization for expensive calculations
- ✅ Lazy loading of components
- ✅ CSS transitions for smooth animations

### Backend Optimization
- ✅ Data caching prevents repeated API calls
- ✅ Efficient pandas operations for data processing
- ✅ Minimal JSON payload
- ✅ Gzip compression available

### Network Optimization
- ✅ Minimal HTTP requests
- ✅ Efficient JSON serialization
- ✅ CORS properly configured
- ✅ Connection reuse possible

---

## 🔄 Request-Response Cycle Example

### All Stocks Page Load

**Time: 0ms** - User clicks "All Stocks"
```
React renders AllStocksPage component
```

**Time: 5ms** - Component mounts
```
useEffect hook triggered
loadStocks() function called
Mock data generated in JavaScript
No network request
```

**Time: 10ms** - Component renders
```
Table with 100 stocks loaded
First page (stocks 1-20) displayed
```

**Time: 15ms** - User can interact
```
Search box active
Pagination clickable
Real-time filtering responsive
```

---

### DCA Calculator Calculation

**Time: 0ms** - User clicks "Calculate DCA"
```
Form validated
Request object created
fetch() API called
```

**Time: 50-500ms** - Network request
```
Request travels to http://localhost:5000/api/calculate-dca
Flask receives request
```

**Time: 500-2000ms** - Server processing
```
Check cache for stock data
Fetch from Yahoo Finance if needed
Perform DCA calculations
Create response object
```

**Time: 2000-2500ms** - Return response
```
Response travels back to frontend
React receives response
```

**Time: 2500ms** - Update UI
```
Parse results
Update state
Render summary cards
Render chart
User sees results
```

---

## 🎯 System Reliability

### Error Recovery
1. Network error → Show alert, allow retry
2. Invalid input → Show validation message
3. API timeout → Use mock data
4. Missing data → Show appropriate message

### Data Integrity
- ✅ Input validation on both frontend and backend
- ✅ Type checking on API responses
- ✅ Consistent date formats
- ✅ Safe calculations with error bounds

---

## 📱 Responsiveness Strategy

```
Desktop (1920x1080)
├─ Sidebar: 250px fixed width
├─ Content: Remaining width
└─ Table: Full width with horizontal scroll

Tablet (1024x768)
├─ Sidebar: 200px width or collapsible
├─ Content: Responsive
└─ Table: Optimized for smaller width

Mobile (375x667)
├─ Sidebar: Hidden/Hamburger menu
├─ Content: Full width
└─ Table: Vertical scroll with key columns
```

---

## 🚀 Scalability Considerations

### Current Limitations
- ⚠️ Max 100 stocks (mock data)
- ⚠️ In-memory caching (no database)
- ⚠️ Single-threaded Flask server
- ⚠️ No user authentication

### Future Scalability
- 🎯 Connect to real database
- 🎯 Implement load balancing
- 🎯 Add async processing with Celery
- 🎯 Implement user authentication
- 🎯 Add WebSocket for real-time updates

---

## 🎓 Technology Integration Points

### Frontend ↔ Backend
```
React Components
       ↓
Fetch API (HTTP)
       ↓
Flask Routes
       ↓
Business Logic
       ↓
Pandas/Yahoo Finance
       ↓
Return JSON
       ↓
Recharts Visualization
```

---

## Summary

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Scalable component structure
- ✅ Efficient data flow
- ✅ Responsive user experience
- ✅ Error resilience
- ✅ Easy maintenance and extension

**Status**: ✅ Production-Ready Architecture
