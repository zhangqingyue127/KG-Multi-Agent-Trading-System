/**
 * API Configuration
 * Central location for API URL and configuration
 */

// Use relative API paths by default so production can run from a single origin.
// The local static preview server on 4173 cannot proxy /api, so point it to Flask.
const LOCAL_STATIC_API =
  typeof window !== 'undefined' && window.location.port === '4173'
    ? 'http://127.0.0.1:5000'
    : '';
const API_BASE_URL = process.env.REACT_APP_API_URL || LOCAL_STATIC_API;

const STATIC_DATA_BASE = `${process.env.PUBLIC_URL || ''}/data`;

export const API_ENDPOINTS = {
  // Stock endpoints
  GET_STOCKS: `${API_BASE_URL}/api/stocks`,
  GET_STOCK_HISTORY: (ticker) => `${API_BASE_URL}/api/stock-history/${ticker}`,
  
  // DCA endpoints
  CALCULATE_DCA: `${API_BASE_URL}/api/calculate-dca`,
  
  // Prediction endpoints
  PREDICT_STOCKS: `${API_BASE_URL}/api/predict-stocks`,
  
  // Analysis endpoints
  GENERATE_ANALYSIS: `${API_BASE_URL}/api/generate-analysis`,

  // News endpoints
  GET_MARKET_NEWS: `${API_BASE_URL}/api/market-news`,

  // DeepSeek multi-agent endpoints
  GET_AGENT_RESULTS: (ticker) => `${API_BASE_URL}/api/agent-results/${ticker}`,

  // Live knowledge graph endpoint
  GET_LIVE_KG: (ticker) => `${API_BASE_URL}/api/live-kg/${ticker}`,
  
  // Health check
  HEALTH_CHECK: `${API_BASE_URL}/health`
};

/**
 * Fetch data from API with error handling
 */
export const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Check if API is available
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH_CHECK);
    return response.ok;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

/**
 * Get stocks list
 */
export const getStocks = async () => {
  return fetchAPI(API_ENDPOINTS.GET_STOCKS);
};

/**
 * Get stock history
 */
export const getStockHistory = async (ticker, period = '1m', startDate = null, endDate = null) => {
  let url = API_ENDPOINTS.GET_STOCK_HISTORY(ticker) + `?period=${period}`;
  
  if (startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  
  return fetchAPI(url);
};

/**
 * Calculate DCA
 */
export const calculateDCA = async (ticker, startDate, endDate, dailyInvest) => {
  return fetchAPI(API_ENDPOINTS.CALCULATE_DCA, {
    method: 'POST',
    body: JSON.stringify({
      ticker,
      start_date: startDate,
      end_date: endDate,
      daily_invest: dailyInvest
    })
  });
};

/**
 * Predict stocks
 */
export const predictStocks = async (symbols) => {
  return fetchAPI(API_ENDPOINTS.PREDICT_STOCKS, {
    method: 'POST',
    body: JSON.stringify({
      symbols
    })
  });
};

/**
 * Generate analysis report
 */
export const generateAnalysis = async (ticker, startDate, endDate, dailyInvest) => {
  return fetchAPI(API_ENDPOINTS.GENERATE_ANALYSIS, {
    method: 'POST',
    body: JSON.stringify({
      ticker,
      start_date: startDate,
      end_date: endDate,
      daily_invest: dailyInvest
    })
  });
};

/**
 * Get market news feed
 */
export const getMarketNews = async ({ category = 'all', symbols = [], limit = 18 } = {}) => {
  const params = new URLSearchParams();
  params.set('category', category);
  params.set('limit', `${limit}`);

  if (symbols.length) {
    params.set('symbols', symbols.join(','));
  }

  return fetchAPI(`${API_ENDPOINTS.GET_MARKET_NEWS}?${params.toString()}`);
};

/**
 * Get saved DeepSeek multi-agent backtest results
 */
export const getAgentResults = async (ticker = 'SPY') => {
  try {
    return await fetchAPI(API_ENDPOINTS.GET_AGENT_RESULTS(ticker));
  } catch (error) {
    return fetchAPI(`${STATIC_DATA_BASE}/agent-results/${ticker.toUpperCase()}.json`);
  }
};

/**
 * Get dynamic live KG snapshot for a ticker
 */
export const getLiveKg = async (ticker = 'SPY') => {
  return fetchAPI(API_ENDPOINTS.GET_LIVE_KG(ticker));
};

export default {
  API_ENDPOINTS,
  fetchAPI,
  checkAPIHealth,
  getStocks,
  getStockHistory,
  calculateDCA,
  predictStocks,
  generateAnalysis,
  getMarketNews,
  getAgentResults,
  getLiveKg
};
