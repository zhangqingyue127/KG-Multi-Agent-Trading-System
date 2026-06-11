# SP500 ETF Market Dashboard

A full-stack financial analytics web app built with React and Flask. It includes a stock universe browser, S&P 500 ETF DCA simulator, stock comparison tools, market news, and analysis workflows.

## Repository

- GitHub: [zhangqingyue127/sp500-etf-market-dashboard](https://github.com/zhangqingyue127/sp500-etf-market-dashboard)

## Live Demo

- Production URL: deploy on Render, then place your generated service URL here
- Recommended format after deployment: `https://your-service-name.onrender.com`

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/zhangqingyue127/sp500-etf-market-dashboard)

## Features

- Browse 100 real US stocks and ETFs with real ticker/company names
- Search and paginate the full stock universe
- Run DCA simulations for `SPY`, `VOO`, and `IVV`
- Compare multiple stocks with chart-based dashboards
- Read market news with category and symbol filters
- Generate analysis results from backend calculations

## Tech Stack

- Frontend: React 18, Recharts, CSS
- Backend: Flask, Pandas, NumPy, pandas-datareader
- Deployment: Docker, Render

## Project Structure

```text
sp500-etf-market-dashboard/
├── public/                 # React HTML entry
├── src/                    # Frontend source
├── api_server.py           # Flask backend + production static serving
├── Dockerfile              # One-service deployment image
├── render.yaml             # Render blueprint config
├── package.json            # Frontend dependencies
└── requirements.txt        # Backend dependencies
```

## Local Development

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
pip install -r requirements.txt
```

3. Start the Flask API:

```bash
python api_server.py
```

4. In another terminal, start the React app:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Production Deployment

This repository is prepared for a single-service deployment. In production:

- React is built into static files
- Flask serves both the frontend and `/api/*`
- The app runs behind `gunicorn`

### Option A: Render

1. Open the repo on GitHub:
   [sp500-etf-market-dashboard](https://github.com/zhangqingyue127/sp500-etf-market-dashboard)
2. Create a new Render Web Service from this repository, or use the Deploy to Render button above.
3. Render will detect `render.yaml` and `Dockerfile`.
4. Wait for the first build to finish.
5. Copy the generated `https://...onrender.com` URL.
6. Replace the `Production URL` line in this README with the real deployed link.

### Option B: Any Docker-Compatible Platform

You can also deploy the same repository to Railway, Fly.io, or another Docker host.

Build and run locally with Docker:

```bash
docker build -t sp500-etf-market-dashboard .
docker run -p 10000:10000 sp500-etf-market-dashboard
```

Then open:

```text
http://localhost:10000
```

## API Endpoints

- `GET /health`
- `GET /api/stocks`
- `GET /api/stock-history/<ticker>`
- `POST /api/calculate-dca`
- `POST /api/predict-stocks`
- `POST /api/generate-analysis`
- `GET /api/market-news`

## Notes

- Local React development uses the `proxy` setting in `package.json` to reach the Flask API.
- Production uses same-origin requests, so the frontend no longer depends on `http://localhost:5000`.
- If live market data is temporarily unavailable, the app falls back to the same real stock universe with generated placeholder numeric values.
