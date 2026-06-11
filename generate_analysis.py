"""
Generate analysis.html with DCA backtest results and visualizations
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pandas_datareader import data as pdr
import json

def fetch_dca_data(ticker, start_date, end_date, daily_invest):
    """计算 DCA 回测数据"""
    try:
        # 下载股票价格
        prices = pdr.get_data_yahoo(ticker, start=start_date, end=end_date)['Close']
        
        if len(prices) == 0:
            return None
        
        # 计算 DCA 指标
        daily_invest_array = daily_invest / prices
        cum_shares = daily_invest_array.cumsum()
        portfolio_value = cum_shares * prices
        total_invested = daily_invest * len(prices)
        final_value = float(portfolio_value.iloc[-1])
        total_return = (final_value - total_invested) / total_invested if total_invested > 0 else 0
        
        # 计算 CAGR
        years = (prices.index[-1] - prices.index[0]).days / 365.25
        if years > 0 and total_invested > 0:
            cagr = (final_value / total_invested) ** (1 / years) - 1
        else:
            cagr = 0
        
        return {
            'ticker': ticker,
            'start_date': str(start_date),
            'end_date': str(end_date),
            'daily_invest': daily_invest,
            'n_days': len(prices),
            'total_invested': float(total_invested),
            'final_value': float(final_value),
            'total_return': float(total_return) * 100,
            'cagr': float(cagr) * 100,
            'dates': [d.strftime('%Y-%m-%d') for d in prices.index],
            'prices': prices.tolist(),
            'portfolio_values': portfolio_value.tolist(),
        }
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None

def generate_html(dca_data):
    """生成 HTML 分析页面"""
    
    if not dca_data:
        dca_data = {
            'ticker': 'SPY',
            'n_days': 0,
            'total_invested': 0,
            'final_value': 0,
            'total_return': 0,
            'cagr': 0,
        }
    
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DCA 分析 - {dca_data.get('ticker', 'SPY')}</title>
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
            <p>定期定额(DCA)投资回测分析</p>
        </div>
        
        <div class="content">
            <div class="info">
                <strong>分析说明:</strong> 本分析基于历史数据展示了定期定额投资策略的潜在回报。
                请注意，过去的表现不代表未来的结果。
            </div>
            
            <div class="summary">
                <div class="metric">
                    <h3>投资标的</h3>
                    <p>{dca_data.get('ticker', 'N/A')}</p>
                </div>
                
                <div class="metric">
                    <h3>总投资额</h3>
                    <p>${dca_data.get('total_invested', 0):,.2f}</p>
                </div>
                
                <div class="metric">
                    <h3>最终价值</h3>
                    <p>${dca_data.get('final_value', 0):,.2f}</p>
                </div>
                
                <div class="metric">
                    <h3>总收益率</h3>
                    <p class="{'positive' if dca_data.get('total_return', 0) >= 0 else 'negative'}">
                        {dca_data.get('total_return', 0):.2f}%
                    </p>
                </div>
                
                <div class="metric">
                    <h3>年化收益率 (CAGR)</h3>
                    <p class="{'positive' if dca_data.get('cagr', 0) >= 0 else 'negative'}">
                        {dca_data.get('cagr', 0):.2f}%
                    </p>
                </div>
                
                <div class="metric">
                    <h3>投资天数</h3>
                    <p>{dca_data.get('n_days', 0)} 天</p>
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
            <p>© 2024 金融大数据分析 - 葫芦囤皂</p>
        </div>
    </div>
    
    <script>
        // 图表数据
        const portfolioData = {dca_data.get('portfolio_values', []) if isinstance(dca_data.get('portfolio_values', []), list) else []};
        const priceData = {dca_data.get('prices', []) if isinstance(dca_data.get('prices', []), list) else []};
        const dateData = {json.dumps(dca_data.get('dates', []))};
        
        // 处理空数据
        if (portfolioData.length === 0 || priceData.length === 0) {{
            document.querySelector('.charts').innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">正在加载数据...</p>';
        }} else {{
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
        }}
    </script>
</body>
</html>"""
    
    return html_content

if __name__ == '__main__':
    # 获取 DCA 数据
    dca_data = fetch_dca_data('SPY', '2019-01-01', '2024-01-01', 100)
    
    # 生成 HTML
    html = generate_html(dca_data)
    
    # 保存到文件
    with open('analysis.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("分析页面已生成: analysis.html")
