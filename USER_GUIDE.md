# User Guide - Huluntunzao

## 📖 Complete Guide to Using Huluntunzao

### Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Page](#dashboard-page)
3. [All Stocks Page](#all-stocks-page)
4. [DCA Calculator](#dca-calculator)
5. [Other Features](#other-features)
6. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### Accessing the Application
1. Ensure both servers are running:
   - React: http://localhost:3000
   - Flask API: http://localhost:5000
2. Open http://localhost:3000 in your web browser
3. You should see the Huluntunzao application with the purple sidebar

### Navigation
- Use the left sidebar menu to navigate between different pages
- Click menu items to switch pages
- Each menu item has an emoji icon for quick identification

---

## Dashboard Page

### What You See
- Welcome message: "Welcome to Huluntunzao"
- Centered "Hello World" text
- Subtitle: "Financial Big Data Analysis Platform"

### What You Can Do
- Read the welcome message
- Click any menu item to explore features
- Familiarize yourself with the application

### Next Steps
- Click "All Stocks" to browse stocks
- Click "DCA Calculator" to simulate investments

---

## All Stocks Page

### Purpose
Browse and search through 100 popular stocks with detailed information.

### Features

#### 📊 Stock Information Display
Each stock shows:
- **Symbol**: Trading ticker (e.g., STOCK001)
- **Name**: Company name
- **Price**: Current stock price
- **Change**: Dollar amount change
- **Change %**: Percentage change
- **Volume**: Trading volume in millions
- **Market Cap**: Market capitalization

#### 🔍 Search/Filter

**How to Use:**
1. Find the search box at the top of the page
2. Type to search by:
   - Stock symbol (e.g., "STOCK01")
   - Company name (e.g., "Company 50")
3. Results update in real-time
4. Stock count shows filtered results

**Example Searches:**
- `STOCK05` - Find stocks with 05 in symbol
- `Company 25` - Find companies with 25 in name
- `5` - Find any stock with 5 in symbol or name

#### 📄 Pagination

**Understanding Pagination:**
- Shows 20 stocks per page
- Total pages displayed at bottom
- Current page number highlighted in blue

**Navigation Buttons:**
- **First** (<<): Jump to first page
- **Previous** (<): Go to previous page
- **Page Numbers** (1, 2, 3...): Go to specific page
- **Next** (>): Go to next page
- **Last** (>>): Jump to last page

**Pagination Info:**
- "Page X of Y" shows current position
- Dots (...) appear if there are too many pages

#### Example Workflow
1. Open "All Stocks" page
2. See page 1 with stocks 1-20
3. Search for "STOCK30" - see 1 result
4. Clear search to see all stocks again
5. Click page 3 to see stocks 41-60
6. Use "Next" button to move between pages

---

## DCA Calculator

### Purpose
Simulate dollar-cost averaging investment strategy with S&P 500 ETFs.

### What is DCA?
Dollar-Cost Averaging means investing a fixed amount regularly (daily in this case) regardless of market price. This can reduce the impact of volatility.

### How to Use

#### Step 1: Set Start Date
```
Find: "Start Date" field
Click: The date input box
Select: Your investment start date
Example: 2014-01-01
```

#### Step 2: Set End Date
```
Find: "End Date" field
Click: The date input box
Select: Your investment end date
Example: 2024-01-01
```

#### Step 3: Set Daily Investment
```
Find: "Daily Investment ($)" field
Enter: Dollar amount to invest daily
Example: 100, 500, 1000
```

#### Step 4: Choose ETF
```
Find: "ETF Selection" dropdown
Click: Dropdown menu
Select: SPY, VOO, or IVV
All track the S&P 500 with slight differences
```

#### Step 5: Calculate
```
Click: "Calculate DCA" button
Wait: For calculation to complete
See: Results appear below
```

### Understanding Results

#### Result Cards (4 Summary Cards)

**Total Invested (Blue Card)**
- Shows total amount you invested
- Formula: Daily Investment × Number of Days
- Example: $100 × 2500 days = $250,000

**Final Value (Green Card)**
- Shows portfolio value at end date
- This is the total value of your shares
- Example: $450,000

**Total Return (Orange Card)**
- Percentage gain on your investment
- Formula: (Final Value - Total Invested) / Total Invested × 100
- Example: 80% means you made 80% profit

**Annual Return/CAGR (Purple Card)**
- Compound Annual Growth Rate
- Average annual return over the period
- Example: 8.5% means average 8.5% per year

#### Portfolio Value Chart

**What It Shows:**
- Blue line: Your portfolio value over time
- Purple line: Total amount invested over time
- X-axis: Dates from start to end
- Y-axis: Dollar amounts

**How to Read:**
1. Lower line = total invested (grows steadily)
2. Upper line = portfolio value (fluctuates more)
3. Gap between lines = your gains/losses
4. Larger gap = better investment returns

#### Example Calculation
```
Start Date:        2014-01-01
End Date:          2024-01-01
Daily Investment:  $100
ETF:               SPY
Number of Days:    ~2500 trading days

Results:
Total Invested:    $250,000
Final Value:       $462,500
Total Return:      85%
CAGR:              8.5%

Meaning: Your $250,000 investment grew to $462,500 (85% gain)
At an average rate of 8.5% per year
```

### ETF Differences

**SPY (SPDR S&P 500)**
- Largest ETF by assets
- Most liquid and traded
- Expense ratio: ~0.03%

**VOO (Vanguard S&P 500)**
- Similar to SPY
- Slightly lower expense ratio: ~0.03%
- Large fund

**IVV (iShares Core S&P 500)**
- Similar to SPY and VOO
- BlackRock's S&P 500 ETF
- Expense ratio: ~0.03%

**Conclusion**: All three track the same index, differences are minimal.

### Tips for DCA Calculator

1. **Long-term perspective**: Use dates spanning years for meaningful results
2. **Market cycles**: See how investments perform through bull and bear markets
3. **Recession periods**: Compare returns from different economic periods
4. **Dollar amount**: Try different daily investments to see impact
5. **Historical data**: Use dates going back several years for accuracy

### Example Scenarios to Try

**Scenario 1: 10-Year Bull Market**
- Start: 2014-01-01
- End: 2024-01-01
- Daily: $100
- ETF: Any

**Scenario 2: During Great Recession**
- Start: 2008-01-01
- End: 2013-01-01
- Daily: $100
- ETF: SPY

**Scenario 3: Recent Years**
- Start: 2022-01-01
- End: 2024-01-01
- Daily: $500
- ETF: VOO

---

## Other Features

### 📊 Dashboard (Home)
Currently shows welcome message. Future development planned.

### 🔍 Analysis
Dedicated page for advanced stock analysis.
Currently in development.

### 👤 Profile
User profile management page.
Future user authentication system will use this.

### ⚙️ Settings
Application settings and preferences.
Future customization options available here.

### 🚪 Logout
Sign out of the application.
Future user authentication will integrate here.

---

## Tips & Tricks

### Keyboard Shortcuts
- Click on search box and start typing to filter stocks
- Use arrow keys after clicking pagination buttons
- Tab key navigates through form inputs in DCA Calculator

### Data Entry Tips

**For Dates:**
- Use YYYY-MM-DD format
- Can use date picker calendar
- Ensure end date > start date

**For Dollar Amounts:**
- Enter just numbers: 100, 500, 1000
- No special characters or currency symbols
- Decimal values supported: 100.50, 99.99

### Common Mistakes to Avoid

❌ **Wrong Date Format**
- Don't use: 2014/01/01 or Jan 01, 2014
- Use: 2014-01-01

❌ **End Date Before Start Date**
- Will cause error
- Always ensure: End Date > Start Date

❌ **Forgetting to Click Calculate**
- Changes won't take effect until you click "Calculate DCA"

❌ **Invalid Characters in Numbers**
- Don't use: $100, 100.00.50
- Use: 100, 100.50

### Performance Tips

1. **Slow Performance?**
   - Clear browser cache
   - Close other tabs
   - Restart servers

2. **Search Not Working?**
   - Ensure Flask API is running
   - Check browser console for errors
   - Try page refresh

3. **Chart Not Showing?**
   - Wait for calculation to complete
   - Check browser console
   - Ensure Recharts library loaded

---

## Troubleshooting

### Page Looks Blank
- ✓ Check that both servers are running
- ✓ Try refreshing the page (Ctrl+R)
- ✓ Clear browser cache
- ✓ Check browser console for errors (F12)

### Stocks Not Loading
- ✓ Ensure you clicked "All Stocks" menu
- ✓ Wait for data to load (may take a moment)
- ✓ Check Flask server status

### DCA Calculator Not Working
- ✓ Ensure all date fields are filled
- ✓ Ensure daily investment amount is entered
- ✓ Check that Flask server is running
- ✓ See if fallback mock data appears

### Search/Filter Not Working
- ✓ Check the search box is active (cursor visible)
- ✓ Try typing slowly
- ✓ Clear and try again
- ✓ Refresh page

---

## Data Interpretation

### Return Rate Meanings
- **5%**: Conservative, steady growth
- **10%**: Average long-term market returns
- **15%**: Good performance
- **20%+**: Excellent performance

### CAGR Comparison
- **S&P 500 historical average**: ~10% annually
- **Your DCA CAGR > 10%**: Outperforming
- **Your DCA CAGR < 10%**: Underperforming (possibly market conditions)

### Volume Numbers
- **M** = Millions
- **10M** = 10 million shares
- **Higher volume** = More liquid, easier to trade

---

## Frequently Asked Questions

**Q: Why are results different each time?**
A: Mock data is randomly generated. Real stock data would be consistent.

**Q: Can I export the results?**
A: Not yet. Future versions will support PDF export.

**Q: Can I track multiple portfolios?**
A: Future feature. Currently one calculation at a time.

**Q: What time zone are dates in?**
A: UTC/GMT. Adjust for your local timezone.

**Q: Are fees included in calculations?**
A: No. Calculations show theoretical returns without fees or taxes.

---

## Advanced Features

### Browser Developer Tools
1. Press F12 to open Developer Tools
2. Go to "Console" tab
3. See any errors or warnings
4. Useful for troubleshooting

### API Testing
You can test the API directly:
```
GET http://localhost:5000/health
Should return: {"status": "ok"}

GET http://localhost:5000/api/stocks
Should return stocks data
```

---

## Best Practices

1. **Always verify dates** before calculating
2. **Try multiple scenarios** to understand DCA better
3. **Compare different ETFs** with same parameters
4. **Record interesting findings** for reference
5. **Take screenshots** of good results for records

---

## Getting Help

1. Check this user guide first
2. Read QUICKSTART.md for setup help
3. Check browser console (F12) for errors
4. Review server terminal output for API issues
5. Consult README.md for technical details

---

## Welcome to Huluntunzao! 🎉

Enjoy exploring stocks and simulating investment strategies!

For questions or suggestions, refer to the project documentation.

**Happy Investing! 📈**
