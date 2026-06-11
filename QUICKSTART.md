# Quick Start Guide - Huluntunzao

## 🚀 Getting Started in 5 Minutes

### Option 1: Automated Startup (Windows)
```bash
# Simply double-click start.bat
# or run in PowerShell:
.\start.bat
```

### Option 2: Automated Startup (Mac/Linux)
```bash
# Make the script executable
chmod +x start.sh

# Run it
./start.sh
```

### Option 3: Manual Startup

#### Terminal 1 - Start Frontend:
```bash
npm start
```
This will open http://localhost:3000 in your browser

#### Terminal 2 - Start Backend:
```bash
python api_server.py
```
Flask API will be available at http://localhost:5000

---

## 📋 First Run Setup

1. **Install Dependencies (if not already done)**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. **Start the application**
   - Follow one of the startup options above

3. **Access the application**
   - Open http://localhost:3000 in your browser
   - You should see the Huluntunzao application

---

## 🎯 Using the Application

### Dashboard
- Default landing page with welcome message
- Access all features from the left sidebar menu

### All Stocks
1. Click "All Stocks" in the menu
2. Browse 100 stocks (20 per page)
3. Use the search box to filter by symbol or company name
4. Navigate between pages using pagination controls

### DCA Calculator
1. Click "DCA Calculator" in the menu
2. Select start and end dates
3. Enter your daily investment amount
4. Choose an ETF (SPY, VOO, or IVV)
5. Click "Calculate DCA"
6. View detailed results and charts

### Other Pages
- **Analysis**: Future analytics features
- **Profile**: User profile management
- **Settings**: Application settings
- **Logout**: Exit application

---

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Flask API Not Connecting
- Ensure Flask server is running (check terminal 2)
- Check that http://localhost:5000/health returns {"status": "ok"}
- Application has fallback mock data if API is unavailable

### React Module Not Found
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Python Dependencies Issue
```bash
# Reinstall Python dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 📊 Checking Server Status

### Check React Server
Open http://localhost:3000 in browser - should show the app

### Check Flask API
Open http://localhost:5000/health in browser - should return:
```json
{"status": "ok"}
```

---

## 📝 Environment Configuration

To customize settings, create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your settings
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page on http://localhost:3000 | Check browser console for errors, ensure Flask is running |
| "Cannot find module 'recharts'" | Run `npm install recharts` |
| Flask returns 404 on /api/calculate-dca | Ensure Flask is running on port 5000 |
| No stocks showing in list | Click "All Stocks" to trigger data load |
| Chart not displaying | Check browser console, ensure data is being fetched |

---

## 📚 Documentation

- **Main README**: [README.md](./README.md)
- **Frontend**: Built with React 18 and Recharts
- **Backend**: Flask API with pandas-datareader for stock data
- **API Docs**: See README.md for detailed API endpoints

---

## ⚡ Performance Tips

1. **Caching**: Stock prices are cached to reduce API calls
2. **Pagination**: Large datasets are paginated for better performance
3. **React Dev Tools**: Use React DevTools browser extension for debugging
4. **Network Tab**: Check browser Network tab if things seem slow

---

## 🔐 Security Notes

- Always run on HTTPS in production
- Never expose API keys in code
- Use environment variables for sensitive data
- Update dependencies regularly: `npm update`, `pip install --upgrade -r requirements.txt`

---

## 💡 Tips & Tricks

- Use keyboard navigation in tables
- Sort results by clicking column headers (feature in progress)
- Export data functionality coming soon
- Custom date ranges for DCA calculations
- Multiple portfolio tracking (coming soon)

---

## 📞 Getting Help

1. Check the troubleshooting section above
2. Check browser console (F12) for errors
3. Review server logs in terminals
4. Check README.md for detailed documentation

---

## 🎓 Learning Resources

- React: https://react.dev
- Flask: https://flask.palletsprojects.com/
- Pandas: https://pandas.pydata.org/
- Recharts: https://recharts.org/

---

Enjoy using Huluntunzao! 🚀
