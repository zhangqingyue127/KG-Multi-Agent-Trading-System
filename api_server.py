"""
Flask API server for stock data and DCA calculations.
In production it also serves the built React frontend from /build.
"""
import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import pandas as pd
try:
    from pandas_datareader import data as pdr
except Exception:
    pdr = None
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from urllib.parse import quote_plus
import xml.etree.ElementTree as ET
import requests
import time

BUILD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build')
AGENT_OUTPUT_DIR = os.environ.get(
    'AGENT_OUTPUT_DIR',
    r'F:\桌面\学校\学业课程\大三下\算法交易\期末\deepseek_agent_system\outputs'
)

app = Flask(__name__, static_folder=BUILD_DIR, static_url_path='/')
CORS(app)

# Cache for stock prices and data
price_cache = {}
stocks_cache = {'data': None, 'timestamp': 0}
news_cache = {}
CACHE_DURATION = 3600  # 1 hour in seconds

# Real US stock and ETF universe used by the All Stocks page.
POPULAR_STOCKS = [
    ('AAPL', 'Apple Inc.'),
    ('MSFT', 'Microsoft Corporation'),
    ('GOOGL', 'Alphabet Inc.'),
    ('AMZN', 'Amazon.com, Inc.'),
    ('NVDA', 'NVIDIA Corporation'),
    ('META', 'Meta Platforms, Inc.'),
    ('TSLA', 'Tesla, Inc.'),
    ('BRK-B', 'Berkshire Hathaway Inc.'),
    ('JPM', 'JPMorgan Chase & Co.'),
    ('V', 'Visa Inc.'),
    ('LLY', 'Eli Lilly and Company'),
    ('UNH', 'UnitedHealth Group Incorporated'),
    ('XOM', 'Exxon Mobil Corporation'),
    ('MA', 'Mastercard Incorporated'),
    ('AVGO', 'Broadcom Inc.'),
    ('JNJ', 'Johnson & Johnson'),
    ('PG', 'The Procter & Gamble Company'),
    ('HD', 'The Home Depot, Inc.'),
    ('COST', 'Costco Wholesale Corporation'),
    ('ABBV', 'AbbVie Inc.'),
    ('MRK', 'Merck & Co., Inc.'),
    ('WMT', 'Walmart Inc.'),
    ('ORCL', 'Oracle Corporation'),
    ('KO', 'The Coca-Cola Company'),
    ('BAC', 'Bank of America Corporation'),
    ('PEP', 'PepsiCo, Inc.'),
    ('CRM', 'Salesforce Inc.'),
    ('NFLX', 'Netflix, Inc.'),
    ('ADBE', 'Adobe Inc.'),
    ('AMD', 'Advanced Micro Devices, Inc.'),
    ('CSCO', 'Cisco Systems, Inc.'),
    ('ACN', 'Accenture plc'),
    ('TMO', 'Thermo Fisher Scientific Inc.'),
    ('MCD', "McDonald's Corporation"),
    ('ABT', 'Abbott Laboratories'),
    ('WFC', 'Wells Fargo & Company'),
    ('LIN', 'Linde plc'),
    ('INTU', 'Intuit Inc.'),
    ('QCOM', 'QUALCOMM Incorporated'),
    ('TXN', 'Texas Instruments Incorporated'),
    ('IBM', 'International Business Machines Corporation'),
    ('GE', 'GE Aerospace'),
    ('CAT', 'Caterpillar Inc.'),
    ('DIS', 'The Walt Disney Company'),
    ('NOW', 'ServiceNow, Inc.'),
    ('AMAT', 'Applied Materials, Inc.'),
    ('VZ', 'Verizon Communications Inc.'),
    ('DHR', 'Danaher Corporation'),
    ('PFE', 'Pfizer Inc.'),
    ('UBER', 'Uber Technologies, Inc.'),
    ('CMCSA', 'Comcast Corporation'),
    ('NEE', 'NextEra Energy, Inc.'),
    ('PM', 'Philip Morris International Inc.'),
    ('RTX', 'RTX Corporation'),
    ('SPGI', 'S&P Global Inc.'),
    ('LOW', "Lowe's Companies, Inc."),
    ('HON', 'Honeywell International Inc.'),
    ('COP', 'ConocoPhillips'),
    ('BKNG', 'Booking Holdings Inc.'),
    ('T', 'AT&T Inc.'),
    ('UNP', 'Union Pacific Corporation'),
    ('ELV', 'Elevance Health, Inc.'),
    ('MS', 'Morgan Stanley'),
    ('GS', 'The Goldman Sachs Group, Inc.'),
    ('BLK', 'BlackRock, Inc.'),
    ('ISRG', 'Intuitive Surgical, Inc.'),
    ('LMT', 'Lockheed Martin Corporation'),
    ('DE', 'Deere & Company'),
    ('MDT', 'Medtronic plc'),
    ('TJX', 'The TJX Companies, Inc.'),
    ('SYK', 'Stryker Corporation'),
    ('AXP', 'American Express Company'),
    ('AMGN', 'Amgen Inc.'),
    ('PLD', 'Prologis, Inc.'),
    ('ADI', 'Analog Devices, Inc.'),
    ('PANW', 'Palo Alto Networks, Inc.'),
    ('GILD', 'Gilead Sciences, Inc.'),
    ('SBUX', 'Starbucks Corporation'),
    ('MDLZ', 'Mondelez International, Inc.'),
    ('VRTX', 'Vertex Pharmaceuticals Incorporated'),
    ('CI', 'The Cigna Group'),
    ('MMC', 'Marsh & McLennan Companies, Inc.'),
    ('C', 'Citigroup Inc.'),
    ('SCHW', 'The Charles Schwab Corporation'),
    ('CB', 'Chubb Limited'),
    ('SO', 'The Southern Company'),
    ('REGN', 'Regeneron Pharmaceuticals, Inc.'),
    ('BSX', 'Boston Scientific Corporation'),
    ('MU', 'Micron Technology, Inc.'),
    ('PGR', 'The Progressive Corporation'),
    ('ETN', 'Eaton Corporation plc'),
    ('BA', 'The Boeing Company'),
    ('NKE', 'NIKE, Inc.'),
    ('INTC', 'Intel Corporation'),
    ('PYPL', 'PayPal Holdings, Inc.'),
    ('SPY', 'SPDR S&P 500 ETF Trust'),
    ('VOO', 'Vanguard S&P 500 ETF'),
    ('IVV', 'iShares Core S&P 500 ETF'),
    ('QQQ', 'Invesco QQQ Trust'),
    ('VTI', 'Vanguard Total Stock Market ETF'),
]

NEWS_CATEGORY_QUERIES = {
    'all': [
        ('market', 'stock market S&P 500 ETF'),
        ('macro', 'Federal Reserve inflation economy markets'),
        ('earnings', 'earnings outlook large cap technology')
    ],
    'market': [
        ('market', 'stock market S&P 500 ETF')
    ],
    'macro': [
        ('macro', 'Federal Reserve inflation economy markets')
    ],
    'earnings': [
        ('earnings', 'earnings outlook large cap technology')
    ],
    'etf': [
        ('etf', 'ETF flows S&P 500 ETF SPY VOO IVV')
    ]
}

def fetch_stock_data(ticker):
    """Fetch real stock data from Yahoo Finance"""
    if pdr is None:
        return None
    try:
        # Get current data
        data = pdr.get_data_yahoo(ticker, start='2024-01-01')
        
        if len(data) == 0:
            return None
        
        current_price = data['Close'].iloc[-1]
        prev_price = data['Close'].iloc[-2] if len(data) > 1 else current_price
        
        change = current_price - prev_price
        change_percent = (change / prev_price * 100) if prev_price != 0 else 0
        volume = data['Volume'].iloc[-1]
        
        # Get market cap estimate (using closing price * estimated shares)
        market_cap_value = current_price * 1000000000  # Rough estimate
        market_cap_str = f"${market_cap_value / 1e9:.1f}B"
        
        return {
            'price': round(current_price, 2),
            'change': round(change, 2),
            'changePercent': round(change_percent, 2),
            'volume': int(volume),
            'marketCap': market_cap_str
        }
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def generate_mock_stock(ticker, name, index):
    """Generate mock stock data"""
    base_price = 50 + (index % 10) * 20
    change = np.random.uniform(-5, 5)
    change_percent = np.random.uniform(-3, 3)
    volume = np.random.randint(1000000, 100000000)
    market_cap = f"${(np.random.uniform(10, 1000)):.1f}B"
    
    return {
        'id': index,
        'symbol': ticker,
        'name': name,
        'price': round(base_price + np.random.randn(), 2),
        'change': round(change, 2),
        'changePercent': round(change_percent, 2),
        'volume': volume,
        'marketCap': market_cap
    }

def infer_sentiment(title, summary=''):
    """Infer a simple sentiment label from a headline."""
    positive_keywords = [
        'surge', 'gain', 'beat', 'bull', 'record', 'growth', 'rally',
        'upgrade', 'strong', 'outperform', 'expands'
    ]
    negative_keywords = [
        'fall', 'drop', 'miss', 'bear', 'cut', 'risk', 'slowdown',
        'downgrade', 'weak', 'pressure', 'selloff', 'concern'
    ]

    text = f"{title} {summary}".lower()

    positive_score = sum(keyword in text for keyword in positive_keywords)
    negative_score = sum(keyword in text for keyword in negative_keywords)

    if positive_score > negative_score:
        return 'positive'
    if negative_score > positive_score:
        return 'negative'
    return 'neutral'

def normalize_news_item(title, link, published_at, source, category, summary='', symbols=None):
    """Normalize a news item for the frontend."""
    symbols = symbols or []
    sentiment = infer_sentiment(title, summary)

    try:
        parsed_date = parsedate_to_datetime(published_at) if published_at else datetime.utcnow()
    except Exception:
        parsed_date = datetime.utcnow()

    if parsed_date.tzinfo is not None:
        parsed_date = parsed_date.astimezone().replace(tzinfo=None)

    return {
        'title': title.strip(),
        'url': link or '',
        'publishedAt': parsed_date.isoformat(timespec='seconds'),
        'publishedLabel': parsed_date.strftime('%Y-%m-%d %H:%M'),
        'source': (source or 'Market Wire').strip(),
        'category': category,
        'summary': (summary or title).strip(),
        'sentiment': sentiment,
        'symbols': symbols
    }

def fetch_google_news(query, category, symbols=None, limit=6):
    """Fetch news items from Google News RSS."""
    rss_url = f"https://news.google.com/rss/search?q={quote_plus(query)}&hl=en-US&gl=US&ceid=US:en"
    response = requests.get(rss_url, timeout=6)
    response.raise_for_status()

    root = ET.fromstring(response.content)
    items = []

    for node in root.findall('./channel/item')[:limit]:
        title = node.findtext('title', default='Market update')
        link = node.findtext('link', default='')
        published_at = node.findtext('pubDate', default='')
        source = node.findtext('source', default='Google News')
        summary = node.findtext('description', default='')

        items.append(
            normalize_news_item(
                title=title,
                link=link,
                published_at=published_at,
                source=source,
                category=category,
                summary=summary,
                symbols=symbols
            )
        )

    return items

def generate_mock_news(category='all', symbols=None, limit=12):
    """Generate mock market news when live RSS is unavailable."""
    symbols = symbols or ['SPY', 'VOO', 'IVV', 'AAPL', 'MSFT', 'NVDA']
    base_time = datetime.utcnow()
    category_cycle = ['market', 'macro', 'earnings', 'etf']

    headline_templates = [
        "{symbol} attracts fresh attention as investors rebalance S&P 500 exposure",
        "Analysts revisit positioning around {symbol} after a broad market rotation",
        "ETF flows point to renewed interest in {symbol} during a risk-on session",
        "Macro headlines keep {symbol} on watch as traders assess rate expectations",
        "{symbol} stays in focus while portfolio managers compare defensive and growth setups",
        "Large-cap leadership discussion puts {symbol} back on institutional radar"
    ]

    mock_items = []
    for index in range(limit):
        symbol = symbols[index % len(symbols)]
        item_category = category if category != 'all' else category_cycle[index % len(category_cycle)]
        title = headline_templates[index % len(headline_templates)].format(symbol=symbol)
        published_at = (base_time - pd.Timedelta(hours=index * 3)).strftime('%a, %d %b %Y %H:%M:%S GMT')

        mock_items.append(
            normalize_news_item(
                title=title,
                link='',
                published_at=published_at,
                source='ETF-500 Desk',
                category=item_category,
                summary=f"Fallback market brief covering {symbol} and broader positioning across U.S. equities.",
                symbols=[symbol]
            )
        )

    return mock_items

def get_market_news_payload(category='all', symbols=None, limit=18):
    """Build market news payload with live RSS plus local fallback."""
    symbols = [symbol.upper() for symbol in (symbols or []) if symbol]
    category = category if category in NEWS_CATEGORY_QUERIES else 'all'
    cache_key = f"{category}:{','.join(symbols)}:{limit}"
    now = time.time()

    if cache_key in news_cache and now - news_cache[cache_key]['timestamp'] < 900:
        return news_cache[cache_key]['payload']

    queries = list(NEWS_CATEGORY_QUERIES.get(category, NEWS_CATEGORY_QUERIES['all']))
    if symbols:
        symbol_query = ' OR '.join(symbols[:5])
        queries.insert(0, ('watchlist', f"{symbol_query} stock market earnings"))

    deduped = []
    seen = set()
    live_success = False

    for query_category, query in queries:
        try:
            for item in fetch_google_news(query, query_category, symbols=symbols, limit=max(4, min(limit, 8))):
                fingerprint = (item['title'].lower(), item['source'].lower())
                if fingerprint in seen:
                    continue
                seen.add(fingerprint)
                deduped.append(item)
            live_success = True
        except Exception as exc:
            print(f"News fetch failed for '{query}': {exc}")

    if not deduped:
        deduped = generate_mock_news(category=category, symbols=symbols, limit=limit)

    deduped.sort(key=lambda item: item['publishedAt'], reverse=True)
    news_items = deduped[:limit]

    sentiment_breakdown = {'positive': 0, 'neutral': 0, 'negative': 0}
    category_breakdown = {}

    for item in news_items:
        sentiment_breakdown[item['sentiment']] = sentiment_breakdown.get(item['sentiment'], 0) + 1
        category_breakdown[item['category']] = category_breakdown.get(item['category'], 0) + 1

    payload = {
        'news': news_items,
        'meta': {
            'category': category,
            'symbols': symbols,
            'count': len(news_items),
            'sourceMode': 'live' if live_success else 'fallback',
            'updatedAt': datetime.utcnow().isoformat(timespec='seconds'),
            'sentimentBreakdown': sentiment_breakdown,
            'categoryBreakdown': category_breakdown
        }
    }

    news_cache[cache_key] = {
        'timestamp': now,
        'payload': payload
    }

    return payload

@app.route('/api/stock-history/<ticker>', methods=['GET'])
def get_stock_history(ticker):
    """Get historical price data for a stock"""
    try:
        period = request.args.get('period', '1m')
        startDate = request.args.get('startDate', None)
        endDate = request.args.get('endDate', None)
        
        # Use custom dates if provided, otherwise use period
        if startDate and endDate:
            start_date = startDate
            end_date = endDate
        else:
            # Map period to date range
            date_ranges = {
                '1m': ('2024-03-20', '2024-04-20'),
                '3m': ('2024-01-20', '2024-04-20'),
                '6m': ('2023-10-20', '2024-04-20'),
                '1y': ('2023-04-20', '2024-04-20'),
                '5y': ('2019-04-20', '2024-04-20'),
            }
            start_date, end_date = date_ranges.get(period, ('2024-03-20', '2024-04-20'))
        
        # Try to fetch real historical data
        prices = download_stock_prices(ticker, start_date, end_date)
        
        if prices is None or len(prices) == 0:
            return jsonify({'error': 'Could not fetch price data'}), 400
        
        # Format data for frontend
        history = []
        for date, price in prices.items():
            history.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': float(price),
                'volume': int(np.random.randint(1000000, 10000000))
            })
        
        return jsonify({'history': history})
    
    except Exception as e:
        print(f"Error in get_stock_history: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """Get popular stocks data with real or cached data"""
    try:
        current_time = time.time()
        
        # Check if cache is still valid
        if stocks_cache['data'] and (current_time - stocks_cache['timestamp'] < CACHE_DURATION):
            return jsonify({'stocks': stocks_cache['data']})
        
        stocks = []
        
        # Try to fetch real data for the full real stock/ETF universe.
        for index, (ticker, name) in enumerate(POPULAR_STOCKS, 1):
            stock_data = fetch_stock_data(ticker)
            
            if stock_data:
                stock = {
                    'id': index,
                    'symbol': ticker,
                    'name': name,
                    **stock_data
                }
            else:
                # Fall back to mock data if real fetch fails
                stock = generate_mock_stock(ticker, name, index)
            
            stocks.append(stock)
        
        # Update cache
        stocks_cache['data'] = stocks
        stocks_cache['timestamp'] = current_time
        
        return jsonify({'stocks': stocks})
    
    except Exception as e:
        print(f"Error in get_stocks: {e}")
        # Return deterministic fallback values on the same real universe.
        fallback_stocks = [
            generate_mock_stock(ticker, name, idx) 
            for idx, (ticker, name) in enumerate(POPULAR_STOCKS, 1)
        ]
        return jsonify({'stocks': fallback_stocks})

def download_stock_prices(ticker, start_date, end_date):
    """Download stock prices from Yahoo Finance"""
    cache_key = f"{ticker}_{start_date}_{end_date}"
    
    if cache_key in price_cache:
        return price_cache[cache_key]
    
    if pdr is not None:
        try:
            # Try to download from Yahoo Finance
            df = pdr.get_data_yahoo(ticker, start=start_date, end=end_date)
            prices = df['Close']
            price_cache[cache_key] = prices
            return prices
        except Exception as e:
            print(f"Error downloading {ticker} with pandas_datareader: {e}")

    try:
        start_ts = int(pd.Timestamp(start_date).timestamp())
        end_ts = int((pd.Timestamp(end_date) + pd.Timedelta(days=1)).timestamp())
        url = (
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
            f"?period1={start_ts}&period2={end_ts}&interval=1d&events=history"
        )
        response = requests.get(url, timeout=12, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        payload = response.json()
        result = payload.get('chart', {}).get('result', [])
        if not result:
            return None
        timestamps = result[0].get('timestamp', [])
        quote = result[0].get('indicators', {}).get('quote', [{}])[0]
        closes = quote.get('close', [])
        if not timestamps or not closes:
            return None
        index = pd.to_datetime(timestamps, unit='s')
        prices = pd.Series(closes, index=index, name='Close').dropna()
        price_cache[cache_key] = prices
        return prices
    except Exception as e:
        print(f"Error downloading {ticker} with Yahoo chart API: {e}")
        return None

def classify_live_market_state(prices):
    """Classify a near-real-time market state from recent close prices."""
    price = prices.dropna()
    if len(price) < 60:
        return None

    returns = price.pct_change().dropna()
    close = float(price.iloc[-1])
    previous_close = float(price.iloc[-2])
    ma20 = float(price.tail(20).mean())
    ma60 = float(price.tail(60).mean())
    ret20 = float(close / price.iloc[-21] - 1)
    vol20 = float(returns.tail(20).std() * np.sqrt(252))
    drawdown60 = float(close / price.tail(60).max() - 1)

    if close > ma60 and ma20 > ma60 and ret20 > 0.04:
        trend_state = 'StrongUptrend'
    elif close > ma60 and ret20 > 0.015:
        trend_state = 'Uptrend'
    elif close < ma60 and ma20 < ma60 and ret20 < -0.04:
        trend_state = 'StrongDowntrend'
    elif close < ma60 and ret20 < -0.015:
        trend_state = 'Downtrend'
    else:
        trend_state = 'Sideways'

    if vol20 >= 0.50:
        volatility_state = 'HighVolatility'
    elif vol20 >= 0.28:
        volatility_state = 'MediumVolatility'
    else:
        volatility_state = 'LowVolatility'

    change = close - previous_close
    change_percent = change / previous_close * 100 if previous_close else 0

    return {
        'close': round(close, 4),
        'previousClose': round(previous_close, 4),
        'change': round(change, 4),
        'changePercent': round(change_percent, 4),
        'ma20': round(ma20, 4),
        'ma60': round(ma60, 4),
        'ret20': round(ret20, 6),
        'vol20': round(vol20, 6),
        'drawdown60': round(drawdown60, 6),
        'trendState': trend_state,
        'volatilityState': volatility_state
    }

def live_risk_profile(ticker):
    high_risk = {'NVDA', 'TSLA', 'AMD'}
    low_risk = {'SPY', 'VOO', 'IVV', 'KO'}
    if ticker in high_risk:
        return {'riskBucket': 'high', 'maxPosition': 0.35, 'volLimit': 0.62, 'drawdownLimit': -0.35}
    if ticker in low_risk:
        return {'riskBucket': 'low', 'maxPosition': 0.80, 'volLimit': 0.28, 'drawdownLimit': -0.15}
    return {'riskBucket': 'medium', 'maxPosition': 0.55, 'volLimit': 0.42, 'drawdownLimit': -0.24}

@app.route('/api/live-kg/<ticker>', methods=['GET'])
def get_live_kg(ticker):
    """Return a live/dynamic market snapshot as knowledge-graph triples."""
    try:
        symbol = ticker.upper()
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=150)
        prices = download_stock_prices(symbol, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))

        if prices is None or len(prices.dropna()) < 60:
            return jsonify({
                'error': 'Could not fetch enough live market data',
                'ticker': symbol,
                'source': 'live_kg_api'
            }), 503

        snapshot = classify_live_market_state(prices)
        if not snapshot:
            return jsonify({'error': 'Insufficient data for live KG snapshot', 'ticker': symbol}), 400

        risk = live_risk_profile(symbol)
        as_of = prices.dropna().index[-1].strftime('%Y-%m-%d')
        snapshot_id = f"LiveMarketSnapshot:{symbol}_{as_of}"
        triples = [
            {'subject': f'Asset:{symbol}', 'predicate': 'HAS_LIVE_SNAPSHOT', 'object': snapshot_id},
            {'subject': snapshot_id, 'predicate': 'SNAPSHOT_OF', 'object': f'Asset:{symbol}'},
            {'subject': snapshot_id, 'predicate': 'HAS_TREND_STATE', 'object': f"MarketState:{snapshot['trendState']}"},
            {'subject': snapshot_id, 'predicate': 'HAS_VOLATILITY_STATE', 'object': f"MarketState:{snapshot['volatilityState']}"},
            {'subject': snapshot_id, 'predicate': 'HAS_CLOSE_PRICE', 'object': f"Close:{snapshot['close']}"},
            {'subject': snapshot_id, 'predicate': 'HAS_MA20', 'object': f"MA20:{snapshot['ma20']}"},
            {'subject': snapshot_id, 'predicate': 'HAS_MA60', 'object': f"MA60:{snapshot['ma60']}"},
            {'subject': snapshot_id, 'predicate': 'HAS_RET20', 'object': f"RET20:{snapshot['ret20']}"},
            {'subject': snapshot_id, 'predicate': 'HAS_VOL20', 'object': f"VOL20:{snapshot['vol20']}"},
            {'subject': f'Asset:{symbol}', 'predicate': 'HAS_RISK_BUCKET', 'object': f"RiskBucket:{risk['riskBucket']}"},
            {'subject': f"RiskBucket:{risk['riskBucket']}", 'predicate': 'HAS_MAX_POSITION', 'object': f"MaxPosition:{risk['maxPosition']}"},
            {'subject': f"RiskBucket:{risk['riskBucket']}", 'predicate': 'HAS_VOL_LIMIT', 'object': f"VolLimit:{risk['volLimit']}"},
        ]

        return jsonify({
            'ticker': symbol,
            'asOf': as_of,
            'source': 'Yahoo Finance via pandas_datareader',
            'mode': 'dynamic_live_snapshot',
            'snapshot': snapshot,
            'riskProfile': risk,
            'triples': triples
        })
    except Exception as e:
        print(f"Error in get_live_kg: {e}")
        return jsonify({'error': str(e), 'ticker': ticker.upper()}), 500

def dca_backtest(price_series, daily_invest):
    """Perform DCA backtest on a price series"""
    price = price_series.dropna()
    
    if len(price) == 0:
        return None
    
    # Calculate metrics
    n_days = len(price)
    shares_bought = daily_invest / price
    cum_shares = shares_bought.cumsum()
    portfolio_value = cum_shares * price
    total_invested = daily_invest * n_days
    final_value = float(portfolio_value.iloc[-1])
    total_return = (final_value - total_invested) / total_invested if total_invested > 0 else 0
    
    # Calculate CAGR
    years = (price.index[-1] - price.index[0]).days / 365.25
    if years > 0 and total_invested > 0:
        cagr = (final_value / total_invested) ** (1 / years) - 1
    else:
        cagr = 0
    
    return {
        'n_days': n_days,
        'total_invested': float(total_invested),
        'final_value': float(final_value),
        'total_return': float(total_return) * 100,
        'cagr': float(cagr) * 100,
        'portfolio_value': portfolio_value.tolist(),
        'dates': [d.strftime('%Y-%m-%d') for d in portfolio_value.index],
    }

def predict_stock_prices(prices, days_ahead=5):
    """Simple exponential smoothing prediction"""
    if len(prices) < 10:
        # Not enough data, use simple trend
        recent = prices[-5:] if len(prices) >= 5 else prices
        avg_change = (recent[-1] - recent[0]) / (len(recent) - 1) if len(recent) > 1 else 0
    else:
        # Use exponential smoothing with recent data
        recent = prices[-30:]  # Use last 30 days
        alpha = 0.3  # Smoothing factor
        
        # Calculate exponential moving average
        ema = recent[0]
        for price in recent[1:]:
            ema = alpha * price + (1 - alpha) * ema
        
        # Calculate trend
        avg_change = (recent[-1] - ema) / len(recent)
    
    predictions = []
    last_price = prices[-1]
    
    for i in range(1, days_ahead + 1):
        predicted_price = last_price + (avg_change * i)
        # Add some randomness based on volatility
        volatility = np.std(prices[-20:]) / np.mean(prices[-20:]) if len(prices) >= 20 else 0.02
        predicted_price += np.random.normal(0, volatility * last_price * 0.5)
        predictions.append(float(predicted_price))
    
    return predictions

@app.route('/api/predict-stocks', methods=['POST'])

@app.route('/api/calculate-dca', methods=['POST'])
def calculate_dca():
    """Calculate DCA returns for selected ETF"""
    try:
        data = request.json
        ticker = data.get('ticker', 'SPY')
        start_date = data.get('start_date', '2014-01-01')
        end_date = data.get('end_date', '2024-01-01')
        daily_invest = float(data.get('daily_invest', 100))
        
        # Download prices
        prices = download_stock_prices(ticker, start_date, end_date)
        
        if prices is None or len(prices) == 0:
            return jsonify({'error': 'Could not fetch price data'}), 400
        
        # Run DCA backtest
        result = dca_backtest(prices, daily_invest)
        
        if result is None:
            return jsonify({'error': 'Could not calculate DCA'}), 400
        
        # Prepare response
        response = {
            'ticker': ticker,
            'summary': {
                'total_invested': result['total_invested'],
                'final_value': result['final_value'],
                'total_return': result['total_return'],
                'cagr': f"{result['cagr']:.2f}%",
                'n_days': result['n_days'],
            },
            'portfolio_value': result['portfolio_value'],
            'dates': result['dates'],
        }
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in calculate_dca: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict-stocks', methods=['POST'])
def predict_stocks():
    """Predict 5-day stock prices for multiple stocks"""
    try:
        data = request.json
        symbols = data.get('symbols', [])
        
        predictions = []
        
        for symbol in symbols[:50]:  # Limit to 50 stocks
            try:
                # Get recent price data
                prices = download_stock_prices(symbol, '2024-01-01', '2024-04-20')
                
                if prices is None or len(prices) == 0:
                    continue
                
                price_values = prices.values.tolist()
                current_price = float(price_values[-1])
                
                # Predict next 5 days
                predicted_prices = predict_stock_prices(price_values, 5)
                
                # Calculate metrics
                final_predicted_price = predicted_prices[-1]
                potential_gain = ((final_predicted_price - current_price) / current_price) * 100
                
                # Calculate volatility
                recent_prices = price_values[-20:] if len(price_values) >= 20 else price_values
                volatility = (np.std(recent_prices) / np.mean(recent_prices)) * 100 if len(recent_prices) > 1 else 5
                
                # Determine trend
                trend = 'bullish' if potential_gain > 0 else 'bearish'
                
                # Calculate confidence based on data quality
                confidence = min(95, max(60, 75 + (len(price_values) / 100)))
                
                predictions.append({
                    'symbol': symbol,
                    'currentPrice': round(current_price, 2),
                    'predictedPrice': round(final_predicted_price, 2),
                    'potentialGain': round(potential_gain, 2),
                    'volatility': round(volatility, 2),
                    'trend': trend,
                    'confidence': int(confidence),
                    'predictions5Days': [
                        {
                            'day': f'Day {i+1}',
                            'price': round(p, 2),
                            'date': (pd.Timestamp.now() + pd.Timedelta(days=i+1)).strftime('%m-%d')
                        }
                        for i, p in enumerate(predicted_prices)
                    ]
                })
            except Exception as e:
                print(f"Error predicting {symbol}: {e}")
                continue
        
        # Sort by potential gain
        predictions.sort(key=lambda x: x['potentialGain'], reverse=True)
        
        return jsonify({'predictions': predictions})
    
    except Exception as e:
        print(f"Error in predict_stocks: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-analysis', methods=['POST'])
def generate_analysis():
    """Generate an HTML analysis report with DCA backtest results"""
    try:
        data = request.json
        ticker = data.get('ticker', 'SPY')
        start_date = data.get('start_date', '2021-04-21')
        end_date = data.get('end_date', '2026-04-21')
        daily_invest = float(data.get('daily_invest', 100))
        
        # Download prices
        prices = download_stock_prices(ticker, start_date, end_date)
        
        if prices is None or len(prices) == 0:
            return jsonify({'error': 'Could not fetch price data'}), 400
        
        # Run DCA backtest
        result = dca_backtest(prices, daily_invest)
        
        if result is None:
            return jsonify({'error': 'Could not calculate DCA'}), 400
        
        # Generate HTML
        html_content = generate_html_report(ticker, result, start_date, end_date, daily_invest)
        
        # Save to file
        filename = f'analysis_{ticker}_{start_date}_{end_date}.html'
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'summary': {
                'ticker': ticker,
                'total_invested': result['total_invested'],
                'final_value': result['final_value'],
                'total_return': result['total_return'],
                'cagr': result['cagr'],
                'n_days': result['n_days'],
            }
        })
    
    except Exception as e:
        print(f"Error in generate_analysis: {e}")
        return jsonify({'error': str(e)}), 500

def generate_html_report(ticker, dca_result, start_date, end_date, daily_invest):
    """Generate HTML report for DCA analysis"""
    
    dates = dca_result.get('dates', [])
    prices = dca_result.get('portfolio_value', [])
    price_history = download_stock_prices(ticker, start_date, end_date)
    
    if price_history is not None:
        price_data = price_history.tolist()
    else:
        price_data = [dca_result['final_value']] * len(dates)
    
    total_return = dca_result.get('total_return', 0)
    cagr = dca_result.get('cagr', 0)
    
    html_template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DCA 分析 - {ticker}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}
        
        .metric {{
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }}
        
        .metric h3 {{
            color: #333;
            font-size: 0.9em;
            text-transform: uppercase;
            margin-bottom: 10px;
            opacity: 0.7;
        }}
        
        .metric p {{
            color: #667eea;
            font-size: 1.8em;
            font-weight: bold;
        }}
        
        .positive {{
            color: #27ae60;
        }}
        
        .negative {{
            color: #e74c3c;
        }}
        
        .charts {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }}
        
        .chart-container {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }}
        
        .chart-container h2 {{
            color: #333;
            margin-bottom: 20px;
            font-size: 1.3em;
        }}
        
        .footer {{
            background: #f5f7fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
        }}
        
        .info {{
            background: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            color: #0066cc;
            margin-bottom: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 DCA 投资分析</h1>
            <p>定期定额(DCA)投资回测分析 - {ticker}</p>
        </div>
        
        <div class="content">
            <div class="info">
                <strong>分析说明:</strong> 本分析基于历史数据展示了定期定额投资策略的潜在回报。
                请注意，过去的表现不代表未来的结果。
            </div>
            
            <div class="summary">
                <div class="metric">
                    <h3>投资标的</h3>
                    <p>{ticker}</p>
                </div>
                
                <div class="metric">
                    <h3>总投资额</h3>
                    <p>${dca_result['total_invested']:,.2f}</p>
                </div>
                
                <div class="metric">
                    <h3>最终价值</h3>
                    <p>${dca_result['final_value']:,.2f}</p>
                </div>
                
                <div class="metric">
                    <h3>总收益率</h3>
                    <p class="{('positive' if total_return >= 0 else 'negative')}">
                        {total_return:.2f}%
                    </p>
                </div>
                
                <div class="metric">
                    <h3>年化收益率 (CAGR)</h3>
                    <p class="{('positive' if cagr >= 0 else 'negative')}">
                        {cagr:.2f}%
                    </p>
                </div>
                
                <div class="metric">
                    <h3>投资天数</h3>
                    <p>{dca_result['n_days']} 天</p>
                </div>
            </div>
            
            <div class="charts">
                <div class="chart-container">
                    <h2>投资组合价值变化</h2>
                    <canvas id="portfolioChart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h2>股票价格变化</h2>
                    <canvas id="priceChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>分析生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>分析周期: {start_date} 至 {end_date}</p>
            <p>每日投资额: ${daily_invest:.2f}</p>
            <p>© 2026 金融大数据分析 - ETF500</p>
        </div>
    </div>
    
    <script>
        const portfolioData = {json.dumps(prices)};
        const priceData = {json.dumps(price_data)};
        const dateData = {json.dumps(dates)};
        
        // Portfolio Value Chart
        const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
        new Chart(portfolioCtx, {{
            type: 'line',
            data: {{
                labels: dateData,
                datasets: [
                    {{
                        label: '投资组合价值',
                        data: portfolioData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }}
                ]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{
                        display: true,
                        position: 'top'
                    }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: false
                    }}
                }}
            }}
        }});
        
        // Price Chart
        const priceCtx = document.getElementById('priceChart').getContext('2d');
        new Chart(priceCtx, {{
            type: 'line',
            data: {{
                labels: dateData,
                datasets: [
                    {{
                        label: '股票价格',
                        data: priceData,
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }}
                ]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{
                        display: true,
                        position: 'top'
                    }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: false
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>"""
    
    return html_template

@app.route('/api/market-news', methods=['GET'])
def get_market_news():
    """Get market news headlines for the News dashboard."""
    try:
        category = request.args.get('category', 'all').lower()
        symbols_arg = request.args.get('symbols', '')
        limit = min(max(int(request.args.get('limit', 18)), 1), 30)
        symbols = [symbol.strip().upper() for symbol in symbols_arg.split(',') if symbol.strip()]

        payload = get_market_news_payload(category=category, symbols=symbols, limit=limit)
        return jsonify(payload)
    except Exception as e:
        print(f"Error in get_market_news: {e}")
        fallback_payload = {
            'news': generate_mock_news(limit=12),
            'meta': {
                'category': 'all',
                'symbols': [],
                'count': 12,
                'sourceMode': 'fallback',
                'updatedAt': datetime.utcnow().isoformat(timespec='seconds'),
                'sentimentBreakdown': {'positive': 4, 'neutral': 4, 'negative': 4},
                'categoryBreakdown': {'market': 3, 'macro': 3, 'earnings': 3, 'etf': 3}
            }
        }
        return jsonify(fallback_payload)


def _read_agent_csv(path, limit=None):
    if not os.path.exists(path):
        return []
    df = pd.read_csv(path)
    df = df.replace({np.nan: None})
    if limit:
        df = df.tail(limit)
    return df.to_dict(orient='records')


@app.route('/api/agent-results/<ticker>', methods=['GET'])
def get_agent_results(ticker):
    """Return saved DeepSeek multi-agent backtest outputs for the ETF Agent page."""
    ticker = ticker.upper()
    supported_tickers = {'SPY', 'VOO', 'IVV', 'AAPL', 'MSFT', 'NVDA', 'TSLA'}
    if ticker not in supported_tickers:
        return jsonify({'error': 'Unsupported ticker. Use SPY, AAPL, MSFT, NVDA, or TSLA.'}), 400

    try:
        summary_path = os.path.join(AGENT_OUTPUT_DIR, f'{ticker}_agent_trust_summary.json')
        if not os.path.exists(summary_path):
            return jsonify({
                'error': 'Agent output files not found',
                'ticker': ticker,
                'agentOutputDir': AGENT_OUTPUT_DIR
            }), 404

        with open(summary_path, 'r', encoding='utf-8') as file:
            summary = json.load(file)

        payload = {
            'ticker': ticker,
            'summary': summary,
            'daily': _read_agent_csv(os.path.join(AGENT_OUTPUT_DIR, f'{ticker}_agent_trust_daily.csv')),
            'trades': _read_agent_csv(os.path.join(AGENT_OUTPUT_DIR, f'{ticker}_agent_trust_trades.csv'), limit=120),
            'memory': _read_agent_csv(os.path.join(AGENT_OUTPUT_DIR, f'{ticker}_agent_memory.csv'), limit=120),
            'weights': _read_agent_csv(os.path.join(AGENT_OUTPUT_DIR, f'{ticker}_agent_weights.csv'), limit=120),
            'ablation': _read_agent_csv(os.path.join(AGENT_OUTPUT_DIR, f'{ticker}_ablation_summary.csv')),
            'source': 'deepseek_agent_system_outputs'
        }
        return jsonify(payload)
    except Exception as e:
        print(f"Error in get_agent_results: {e}")
        return jsonify({'error': str(e), 'ticker': ticker}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'frontendBuilt': os.path.exists(os.path.join(BUILD_DIR, 'index.html'))})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the built React app for non-API routes."""
    if path.startswith('api/') or path == 'health':
        return jsonify({'error': 'Not found'}), 404

    asset_path = os.path.join(BUILD_DIR, path)
    if path and os.path.exists(asset_path):
        return send_from_directory(BUILD_DIR, path)

    index_path = os.path.join(BUILD_DIR, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(BUILD_DIR, 'index.html')

    return jsonify({
        'error': 'Frontend build not found',
        'message': 'Run `npm run build` before starting the production server.'
    }), 503

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    app.run(debug=debug, port=port, host='0.0.0.0', threaded=True)
