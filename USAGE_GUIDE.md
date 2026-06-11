# 金融大数据分析平台 - 使用文档

## 项目概述

这是一个集成的金融数据分析和可视化平台，提供以下主要功能：
- **股票数据浏览** - 查看热门股票的实时价格和行情数据
- **DCA 回测分析** - 定期定额投资回测和模拟分析
- **股价预测** - 基于历史数据的短期股价趋势预测
- **投资分析报告** - 生成可视化的投资分析报告

## 系统架构

### 后端
- **Flask API 服务器** (`api_server.py`) - 运行在 `http://localhost:5000`
- 主要 API 端点：
  - `GET /api/stocks` - 获取热门股票列表
  - `GET /api/stock-history/<ticker>` - 获取股票历史价格
  - `POST /api/calculate-dca` - 计算 DCA 投资回报
  - `POST /api/predict-stocks` - 预测股票价格
  - `POST /api/generate-analysis` - 生成分析报告
  - `GET /health` - 健康检查

### 前端
- **React 应用** (`src/App.js`) - 运行在 `http://localhost:3000`
- 用户界面包括：
  - 股票浏览和搜索
  - DCA 计算器
  - 价格预测展示
  - 分析报告查看

## 启动项目

### 方式 1：使用启动脚本

#### Windows 用户
```bash
./start.bat
```

#### Linux/Mac 用户
```bash
bash start.sh
```

### 方式 2：手动启动

#### 启动后端 Flask 服务器
```bash
cd huluntunzao
python api_server.py
```
服务器运行在 `http://localhost:5000`

#### 启动前端 React 应用（在新的终端中）
```bash
cd huluntunzao
npm start
```
应用运行在 `http://localhost:3000`

## 主要功能说明

### 1. 股票数据浏览

#### API 示例
```bash
curl http://localhost:5000/api/stocks
```

#### 返回数据格式
```json
{
  "stocks": [
    {
      "id": 1,
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 175.25,
      "change": 2.50,
      "changePercent": 1.45,
      "volume": 52000000,
      "marketCap": "$2800.0B"
    }
  ]
}
```

### 2. DCA 投资回测

DCA（定期定额投资）是一种风险较低的投资策略，定期投资固定金额。

#### 示例计算
```bash
curl -X POST http://localhost:5000/api/calculate-dca \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "SPY",
    "start_date": "2019-01-01",
    "end_date": "2024-01-01",
    "daily_invest": 100
  }'
```

#### 返回数据
```json
{
  "ticker": "SPY",
  "summary": {
    "total_invested": 182700.00,
    "final_value": 202896.36,
    "total_return": 11.05,
    "cagr": "2.12%",
    "n_days": 1826
  },
  "portfolio_value": [...],
  "dates": [...]
}
```

### 3. 股价预测

基于历史价格数据进行短期趋势预测。

#### 示例请求
```bash
curl -X POST http://localhost:5000/api/predict-stocks \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "MSFT", "GOOGL"]
  }'
```

### 4. 生成分析报告

生成包含图表和详细分析的 HTML 报告。

#### 示例请求
```bash
curl -X POST http://localhost:5000/api/generate-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "SPY",
    "start_date": "2019-01-01",
    "end_date": "2024-01-01",
    "daily_invest": 100
  }'
```

#### 返回结果
```json
{
  "success": true,
  "filename": "analysis_SPY_2019-01-01_2024-01-01.html",
  "summary": {
    "ticker": "SPY",
    "total_invested": 182700.00,
    "final_value": 202896.36,
    "total_return": 11.05,
    "cagr": 2.12,
    "n_days": 1826
  }
}
```

## 预生成的分析页面

项目包含一个预生成的分析页面示例：

- **文件位置**: `analysis.html`
- **打开方式**: 直接用浏览器打开文件，或通过 Flask 服务器访问

### 预生成数据示例
- 投资标的：SPY (S&P 500 ETF)
- 投资周期：2019-01-01 至 2024-01-01
- 每日投资额：$100.00
- 总投资额：$182,700.00
- 最终价值：$202,896.36
- 总收益率：11.05%
- 年化收益率 (CAGR)：2.12%

## 测试 API

### 使用 curl 测试

#### 1. 健康检查
```bash
curl http://localhost:5000/health
```

#### 2. 获取股票列表
```bash
curl http://localhost:5000/api/stocks
```

#### 3. 获取股票历史数据
```bash
curl "http://localhost:5000/api/stock-history/AAPL?period=1m"
```

### 使用 Python 脚本测试

```python
import requests

# 测试 API
response = requests.post('http://localhost:5000/api/calculate-dca', json={
    'ticker': 'SPY',
    'start_date': '2019-01-01',
    'end_date': '2024-01-01',
    'daily_invest': 100
})

print(response.json())
```

## 项目结构

```
huluntunzao/
├── api_server.py              # Flask API 服务器
├── generate_sample_analysis.py # 分析页面生成脚本
├── analysis.html              # 预生成的分析示例
├── src/
│   ├── App.js                 # React 主组件
│   ├── App.css                # 应用样式
│   ├── index.js               # React 入口
│   └── index.css              # 全局样式
├── public/
│   └── index.html             # HTML 模板
├── package.json               # npm 依赖配置
├── requirements.txt           # Python 依赖
├── start.bat                  # Windows 启动脚本
├── start.sh                   # Linux/Mac 启动脚本
└── README.md                  # 项目说明
```

## 依赖和要求

### 系统要求
- Python 3.7+
- Node.js 12+
- npm 6+

### Python 依赖
```
Flask
Flask-CORS
pandas
pandas-datareader
numpy
```

### JavaScript 依赖
```
React
React-DOM
Axios (for API calls)
Chart.js (for visualizations)
```

## 常见问题

### 问题 1：Yahoo Finance 无法访问
**解决方案**：
- 检查网络连接
- 尝试使用 VPN
- 使用本地生成的模拟数据（通过 `generate_sample_analysis.py`）

### 问题 2：CORS 错误
**原因**：前端和后端跨域请求
**解决方案**：Flask 已配置 CORS 支持，确保后端正在运行

### 问题 3：端口已被占用
**解决方案**：
- 更改端口号（编辑 `api_server.py` 中的 port 参数）
- 或终止占用端口的进程

## 开发和扩展

### 添加新的 API 端点

在 `api_server.py` 中添加新的路由：

```python
@app.route('/api/your-endpoint', methods=['GET', 'POST'])
def your_endpoint():
    """Your endpoint description"""
    try:
        # Your logic here
        return jsonify({'result': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 修改分析页面

编辑 `generate_sample_analysis.py` 或 `api_server.py` 中的 `generate_html_report` 函数来自定义报告样式和内容。

## 许可证

© 2024 金融大数据分析 - 葫芦囤皂

## 联系和支持

如有任何问题或建议，请查看项目文档或提出 issue。

---

**最后更新**：2024-01-01
