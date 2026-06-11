# Testing & Verification Guide

## 🧪 Huluntunzao Application Testing Guide

### Quick Verification Checklist

Before using the application, verify that everything is working:

- [ ] Both servers are running
- [ ] React app loads on http://localhost:3000
- [ ] Flask API responds on http://localhost:5000/health
- [ ] Dashboard page displays correctly
- [ ] Sidebar menu items are visible
- [ ] All Stocks page loads data

---

## ✅ Server Verification

### Check React Development Server

**Via Browser:**
1. Open http://localhost:3000
2. You should see:
   - Huluntunzao application
   - Purple sidebar with menu
   - Welcome message on dashboard
3. If blank page:
   - Check browser console (F12)
   - Look for error messages
   - Verify npm start is running

**Via Terminal:**
```bash
# Check npm process
npm start

# Should show:
# Compiled successfully!
# You can now view huluntunzao in the browser.
```

### Check Flask API Server

**Via Browser:**
1. Open http://localhost:5000/health
2. You should see:
   ```json
   {"status": "ok"}
   ```
3. If error:
   - Check Python is running
   - Verify Flask dependencies installed
   - Check terminal for error messages

**Via Terminal:**
```bash
# Check Flask process
python api_server.py

# Should show:
# Running on http://127.0.0.1:5000
# Debugger is active!
```

**Via Command Line:**
```bash
# Windows
curl http://localhost:5000/health

# Mac/Linux
curl http://localhost:5000/health

# Should return:
# {"status":"ok"}
```

---

## 🧪 Feature Testing

### 1. Dashboard Page Test

**Objective**: Verify dashboard loads correctly

**Steps**:
1. Open http://localhost:3000
2. Look for welcome message
3. Verify "Hello World" text is centered
4. Check sidebar is visible with menu

**Expected Results** ✓
- [ ] Dashboard displays welcome message
- [ ] "Hello World" is centered
- [ ] Sidebar has all menu items
- [ ] No console errors

**If Failed** ❌
- Check browser console (F12)
- Verify App.js is loaded
- Check CSS is applied
- Restart React server

---

### 2. Navigation Test

**Objective**: Verify all menu items work

**Steps**:
1. Click each menu item one by one:
   - Dashboard
   - All Stocks
   - Analysis
   - DCA Calculator
   - Profile
   - Settings
   - Logout (just verify button)

2. For each item:
   - Verify page content changes
   - Check menu item is highlighted
   - Look for console errors

**Expected Results** ✓
- [ ] Each menu item navigates correctly
- [ ] Menu item is highlighted when active
- [ ] Page content displays
- [ ] No console errors

**If Failed** ❌
- Check AllStocksPage.js exists
- Check DCACalculator.js exists
- Verify imports in App.js
- Check CSS for active state

---

### 3. All Stocks Page Test

**Objective**: Verify stocks page functions correctly

**Steps**:
1. Click "All Stocks" menu item
2. Wait for page to load
3. Verify stocks table appears
4. Test search/filter
5. Test pagination

#### Test 3a: Table Display
```
Expected to see:
- Stock table with headers
- 20 stocks per page
- Columns: Symbol, Name, Price, Change, Change %, Volume, Market Cap
```

**Test Results** ✓
- [ ] Table displays with data
- [ ] 20 stocks shown on first page
- [ ] Stock data has correct format

**If Failed** ❌
```
Troubleshooting:
- Verify AllStocksPage.js has data
- Check mock data generation
- Look for JavaScript errors (F12)
```

#### Test 3b: Search/Filter
```
Steps:
1. Type "STOCK01" in search box
2. Should show only 1 result
3. Clear search box
4. Should show all 100 stocks
5. Search for "Company 5"
6. Should show matching results
```

**Test Results** ✓
- [ ] Search filters results in real-time
- [ ] Stock count updates
- [ ] Reset works correctly

**If Failed** ❌
```
Troubleshooting:
- Check filter input onChange handler
- Verify filter logic in useMemo
- Look for console errors
```

#### Test 3c: Pagination
```
Steps:
1. Page 1 shows stocks 1-20
2. Click "Next" button
   - Should go to page 2
   - Should show stocks 21-40
3. Click page number "3"
   - Should go to page 3
4. Click "Last" button
   - Should go to last page
5. Click "Previous"
   - Should go back one page
6. Pagination info should show "Page X of Y"
```

**Test Results** ✓
- [ ] Pagination buttons work
- [ ] Page changes correctly
- [ ] Stock range updates
- [ ] Page info displays correctly

**If Failed** ❌
```
Troubleshooting:
- Check handlePageChange function
- Verify pagination button logic
- Look for state management issues
```

---

### 4. DCA Calculator Test

**Objective**: Verify DCA calculation works

**Steps**:
1. Click "DCA Calculator" menu item
2. Enter test data
3. Click "Calculate DCA"
4. Verify results display

#### Test 4a: Input Form
```
Verify all inputs are present:
- [ ] Start Date input field
- [ ] End Date input field
- [ ] Daily Investment input field
- [ ] ETF selection dropdown
- [ ] Calculate DCA button

Test date selection:
- [ ] Start date accepts valid date
- [ ] End date accepts valid date
- [ ] Date picker works (if available)
```

**Test Results** ✓
- [ ] All form fields visible
- [ ] Inputs accept values
- [ ] Button is clickable

**If Failed** ❌
```
Troubleshooting:
- Check DCACalculator.js form section
- Verify input handlers
- Check for rendering errors
```

#### Test 4b: Calculation
```
Test inputs:
- Start Date: 2014-01-01
- End Date: 2024-01-01
- Daily Investment: 100
- ETF: SPY

Steps:
1. Enter all values
2. Click "Calculate DCA"
3. Wait for calculation
4. Verify results appear

Expected results format:
- Total Invested: $XXX,XXX
- Final Value: $XXX,XXX
- Total Return: XX%
- Annual Return: X.XX%
```

**Test Results** ✓
- [ ] Calculation completes
- [ ] Results display in 4 cards
- [ ] Numbers are formatted correctly
- [ ] No errors in console

**If Failed** ❌
```
Troubleshooting:
- Check Flask server is running
- Verify API endpoint is reachable
- Look for network errors (F12 Network tab)
- Check for CORS issues
- Review calculateDCA function
```

#### Test 4c: Chart Display
```
After successful calculation:
1. Look below the results cards
2. Verify chart appears
3. Check chart has:
   - Title: "Portfolio Value Over Time"
   - Blue line (Portfolio Value)
   - Purple line (Total Invested)
   - X-axis (Dates)
   - Y-axis (Dollar amounts)
   - Legend showing both lines
```

**Test Results** ✓
- [ ] Chart renders after calculation
- [ ] Both lines are visible
- [ ] Chart has proper labels
- [ ] Interactive features work (hover)

**If Failed** ❌
```
Troubleshooting:
- Verify recharts is installed
- Check chart data formatting
- Look for console errors
- Verify Recharts import
```

---

### 5. Responsive Design Test

**Objective**: Verify layout works on different sizes

**Desktop (1920x1080)**
```
Expected:
- Sidebar on left
- Content on right
- Full-width table
- Readable on large screen
```

**Tablet (1024x768)**
```
Expected:
- Layout still organized
- Content scrollable if needed
- Table still functional
```

**Mobile (375x667)**
```
Expected:
- Sidebar visible or accessible
- Content takes full width
- Table may scroll horizontally
- Buttons easily tappable
```

**Test Results** ✓
- [ ] Desktop layout correct
- [ ] Tablet layout acceptable
- [ ] Mobile usable
- [ ] No horizontal scroll on desktop

---

## 🔧 Debugging Tests

### Browser Console Tests

**Access**: Press F12, go to "Console" tab

**Look for**:
- ✓ No red error messages
- ✓ No repeated warnings
- ✓ Application starts without errors

**Common Issues**:
```
Issue: "Module not found"
Solution: npm install missing-package

Issue: "Cannot GET /path"
Solution: Check routing/component names

Issue: "CORS error"
Solution: Verify Flask CORS is enabled

Issue: "fetch failed"
Solution: Verify Flask server is running
```

### Network Tab Tests

**Access**: Press F12, go to "Network" tab

**Load page and check**:
- ✓ All JS files load (200 status)
- ✓ No failed requests (red)
- ✓ API requests get responses

**Monitor**:
- Request to /api/calculate-dca (POST)
- Response includes data
- No 404 or 500 errors

### Terminal/Server Tests

**React Terminal**:
```
Should show:
✓ Compiled successfully!
✓ webpack compiled successfully

Should NOT show:
✗ Build failed
✗ Error in compilation
```

**Flask Terminal**:
```
Should show:
✓ Running on http://127.0.0.1:5000
✓ GET /health 200 OK
✓ POST /api/calculate-dca 200 OK

Should NOT show:
✗ ERROR
✗ 404 Not Found
✗ CORS error
```

---

## 🐛 Common Issues & Quick Fixes

### Issue: Blank Page on localhost:3000

**Diagnosis**:
1. Press F12 to open console
2. Look for error messages

**Solutions**:
```
If: "Cannot find module 'react'"
Fix: npm install

If: "Syntax error in App.js"
Fix: Check file for typos, restart server

If: "Webpack compilation error"
Fix: Look at npm start terminal for details

If: No errors in console
Fix: Try hard refresh (Ctrl+Shift+R)
```

### Issue: Flask API Not Responding

**Check**:
1. Is Flask server running?
   - Look at terminal for "Running on"
2. Is port 5000 available?
   - Check `netstat -ano | findstr :5000`
3. Are dependencies installed?
   - Check requirements.txt installed

**Solution**:
```bash
# Kill any process on 5000
# (Windows)
taskkill /PID <PID> /F

# (Mac/Linux)
lsof -i :5000
kill -9 <PID>

# Reinstall dependencies
pip install -r requirements.txt

# Restart Flask
python api_server.py
```

### Issue: Stocks Not Showing

**Check**:
1. Did you click "All Stocks" menu?
2. Is page loading (look for spinner)?
3. Any console errors (F12)?

**Solutions**:
```
If: Page shows "loading..."
Wait: Page is still loading

If: No stocks but no error
Fix: Refresh page (F5)

If: Error about data
Fix: Check AllStocksPage.js mock data
```

### Issue: DCA Calculator Not Working

**Check**:
1. Is Flask running?
   - Open http://localhost:5000/health
   - Should return {"status":"ok"}
2. Network errors?
   - Press F12, go to Network tab
   - Look for failed requests
3. Form filled correctly?
   - All date fields filled?
   - Daily investment > 0?

**Solutions**:
```
If: API returns 500 error
Check: Flask terminal for error message

If: API returns 404
Fix: Verify Flask is running on :5000

If: Timeout waiting for response
Try: Using simpler date range (fewer days)

If: No API connection
Use: App will show mock results automatically
```

---

## ✨ Performance Testing

### Check Page Load Time

**React App**:
```
Optimal: < 3 seconds
Acceptable: < 5 seconds
Poor: > 5 seconds

Test:
1. Press F12
2. Go to Network tab
3. Reload page
4. Look at load time (bottom)
```

**API Response Time**:
```
Optimal: < 500ms
Acceptable: < 1000ms
Poor: > 1000ms

Test:
1. Open Network tab
2. Click "Calculate DCA"
3. Watch request complete
4. Note response time
```

---

## 🎯 Complete Test Workflow

### Quick Smoke Test (5 minutes)
```
1. Start both servers
2. Open http://localhost:3000
3. Verify dashboard shows
4. Click "All Stocks" - see stocks table
5. Search for "STOCK01" - works?
6. Click "DCA Calculator"
7. Enter data and calculate
8. See results and chart
9. No red errors in console
✓ Basic functionality works
```

### Comprehensive Test (30 minutes)
```
1. Test all navigation items
2. Test all search/filter scenarios
3. Test all pagination combinations
4. Test multiple DCA calculations
5. Test with edge cases:
   - Very old dates
   - Very recent dates
   - Large daily amounts
   - Different ETFs
6. Test responsive design
7. Check all styling
8. Verify no console errors
✓ All features working correctly
```

---

## 📊 Test Results Template

Use this to record your testing:

```
Date: _______________
Tester: _______________
Environment: Windows 10 / Browser: Chrome v120

Test Results:
├─ [ ] Server Status
│   ├─ [ ] React running on :3000
│   ├─ [ ] Flask running on :5000
│   └─ [ ] Health check passes
├─ [ ] Dashboard Page
│   ├─ [ ] Displays correctly
│   └─ [ ] Navigation works
├─ [ ] All Stocks Page
│   ├─ [ ] Stocks load
│   ├─ [ ] Search works
│   ├─ [ ] Pagination works
│   └─ [ ] Table displays correctly
├─ [ ] DCA Calculator
│   ├─ [ ] Form displays
│   ├─ [ ] Calculation works
│   ├─ [ ] Results display
│   └─ [ ] Chart renders
└─ [ ] Console (No Errors)

Overall Status: ✓ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
```

---

## 🎓 Learning Through Testing

### Why Each Test Matters

**Navigation Test**: Ensures routing works
**Stocks Test**: Verifies frontend rendering
**Search Test**: Checks JavaScript functionality
**Pagination Test**: Tests state management
**DCA Test**: Validates frontend-backend integration
**Performance Test**: Ensures good user experience

---

## ✅ Sign-Off Checklist

Before considering the project complete:

- [ ] All servers start successfully
- [ ] Dashboard page displays
- [ ] All navigation items work
- [ ] All Stocks page shows 100 stocks
- [ ] Search/filter works correctly
- [ ] Pagination works with all buttons
- [ ] DCA calculator accepts input
- [ ] DCA calculator shows results
- [ ] Chart displays correctly
- [ ] No red console errors
- [ ] Responsive design looks good
- [ ] Performance is acceptable

**Sign-Off Date**: ________________
**Tester Name**: ________________
**Status**: ✅ APPROVED FOR USE

---

**Happy Testing!** 🚀
