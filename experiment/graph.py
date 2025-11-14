import pandas as pd
import matplotlib.pyplot as plt

# CSV 읽기
df = pd.read_csv("fff1-v4.csv")

# timestamp를 datetime으로 변환
df['timestamp'] = pd.to_datetime(df['timestamp_iso'])

# 'ffffffff...' 같은 초기값 제거
df = df[~df['hex'].str.startswith('ff')]

# 중간 바이트 추출 함수 (예: 9~12번째 바이트)
def extract_middle_value(hex_str):
    # 16~28번째 글자 추출 (hex string 기준)
    middle_hex = hex_str[16:28]
    
    # 앞쪽 연속된 '0' 제거
    middle_hex_trimmed = middle_hex.lstrip('0')
    
    # 10진수로 변환
    if middle_hex_trimmed == "":
        value = 0
    else:
        value = int(middle_hex_trimmed, 16)
    
    print(f"Extracted middle hex: {middle_hex_trimmed}, as decimal: {value}")
    return value

# weight_val 컬럼 생성
df['weight_val'] = df['hex'].apply(extract_middle_value)

# 그래프 그리기
plt.figure(figsize=(10,4))
plt.plot(df['timestamp'], df['weight_val'], marker='o')
plt.xlabel("Time")
plt.ylabel("Weight (raw value)")
plt.title("Weight changes over time (excluding ffffff...)")
plt.grid(True)
plt.show()
