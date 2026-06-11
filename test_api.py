"""
Test script for the new analysis generation endpoint
"""
import requests
import json
import time

# Flask API URL
API_URL = "http://localhost:5000"

def test_generate_analysis():
    """Test the /api/generate-analysis endpoint"""
    print("测试分析生成端点...")
    
    # Wait for Flask to be ready
    time.sleep(2)
    
    payload = {
        'ticker': 'SPY',
        'start_date': '2019-01-01',
        'end_date': '2024-01-01',
        'daily_invest': 100
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/generate-analysis",
            json=payload,
            timeout=30
        )
        
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✓ 分析页面生成成功！")
        else:
            print("✗ 生成失败")
            
    except Exception as e:
        print(f"✗ 错误: {e}")

def test_health():
    """Test the health endpoint"""
    print("\n测试健康检查端点...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"✗ 错误: {e}")

if __name__ == '__main__':
    test_health()
    test_generate_analysis()
