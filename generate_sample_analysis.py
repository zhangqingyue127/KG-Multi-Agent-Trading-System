"""
Generate a sample analysis.html with mock DCA data
"""
from datetime import datetime, timedelta
import json

def generate_sample_analysis():
    """Generate a sample analysis page with mock data"""
    
    # Generate sample data - last 5 years
    end_date = datetime(2026, 4, 21)
    start_date = datetime(2021, 4, 21)
    
    dates = []
    prices = []
    portfolio_values = []
    
    current_date = start_date
    share_count = 0
    total_invested = 0
    
    while current_date <= end_date:
        dates.append(current_date.strftime('%Y-%m-%d'))
        
        # Generate a realistic stock price
        days_diff = (current_date - start_date).days
        price = 200 + (days_diff / 1000) + (days_diff % 30) * 2
        prices.append(round(price, 2))
        
        # Calculate DCA
        daily_invest = 100
        share_count += daily_invest / price
        total_invested += daily_invest
        portfolio_value = share_count * price
        portfolio_values.append(round(portfolio_value, 2))
        
        current_date += timedelta(days=1)
    
    # Calculate metrics
    total_return = ((portfolio_values[-1] - total_invested) / total_invested) * 100 if total_invested > 0 else 0
    years = (end_date - start_date).days / 365.25
    cagr = ((portfolio_values[-1] / total_invested) ** (1 / years) - 1) * 100 if years > 0 and total_invested > 0 else 0
    
    # Generate HTML
    html_content = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DCA 分析 - SPY</title>
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
            <p>定期定额(DCA)投资回测分析 - SPY</p>
        </div>
        
        <div class="content">
            <div class="info">
                <strong>分析说明:</strong> 本分析基于历史数据展示了定期定额投资策略的潜在回报。
                请注意，过去的表现不代表未来的结果。
            </div>
            
            <div class="summary">
                <div class="metric">
                    <h3>投资标的</h3>
                    <p>SPY (S&P 500 ETF)</p>
                </div>
                
                <div class="metric">
                    <h3>总投资额</h3>
                    <p>${total_invested:,.2f}</p>
                </div>
                
                <div class="metric">
                    <h3>最终价值</h3>
                    <p>${portfolio_values[-1]:,.2f}</p>
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
                    <p>{len(dates)} 天</p>
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
            <p>分析周期: 2021-04-21 至 2026-04-21</p>
            <p>每日投资额: $100.00</p>
            <p>© 2026 金融大数据分析 - ETF500</p>
        </div>
    </div>
    
    <script>
        const portfolioData = {json.dumps(portfolio_values)};
        const priceData = {json.dumps(prices)};
        const dateData = {json.dumps(dates)};
        
        // 只显示每30天的数据以便图表清晰
        const displayDates = [];
        const displayPortfolio = [];
        const displayPrices = [];
        
        for (let i = 0; i < dateData.length; i += 30) {{
            displayDates.push(dateData[i]);
            displayPortfolio.push(portfolioData[i]);
            displayPrices.push(priceData[i]);
        }}
        
        // Portfolio Value Chart
        const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
        new Chart(portfolioCtx, {{
            type: 'line',
            data: {{
                labels: displayDates,
                datasets: [
                    {{
                        label: '投资组合价值',
                        data: displayPortfolio,
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
                        beginAtZero: false,
                        ticks: {{
                            callback: function(value) {{
                                return '$' + value.toFixed(0);
                            }}
                        }}
                    }}
                }}
            }}
        }});
        
        // Price Chart
        const priceCtx = document.getElementById('priceChart').getContext('2d');
        new Chart(priceCtx, {{
            type: 'line',
            data: {{
                labels: displayDates,
                datasets: [
                    {{
                        label: '股票价格',
                        data: displayPrices,
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
                        beginAtZero: false,
                        ticks: {{
                            callback: function(value) {{
                                return '$' + value.toFixed(2);
                            }}
                        }}
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>"""
    
    # Save to file
    with open('analysis.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✓ 分析页面已生成: analysis.html")
    print(f"  总投资额: ${total_invested:,.2f}")
    print(f"  最终价值: ${portfolio_values[-1]:,.2f}")
    print(f"  总收益率: {total_return:.2f}%")
    print(f"  年化收益率 (CAGR): {cagr:.2f}%")

if __name__ == '__main__':
    generate_sample_analysis()
