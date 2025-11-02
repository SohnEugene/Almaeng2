import pandas as pd
import matplotlib.pyplot as plt

# CSV 파일 읽기
df = pd.read_csv("fff1-v2.csv")

# timestamp를 datetime으로 변환
df['timestamp'] = pd.to_datetime(df['timestamp_iso'])

# 중간 바이트만 추출 (예: 9~12번째 바이트)
def extract_middle_value(hex_str):
    # 17바이트 기준, 9~12번째 바이트
    middle_hex = hex_str[16:24]  # hex string은 두 글자가 1바이트
    return int(middle_hex, 16)   # 16진수 → 10진수

df['weight_val'] = df['hex'].apply(extract_middle_value)

# 그래프 그리기
plt.figure(figsize=(10,4))
plt.plot(df['timestamp'], df['weight_val'], marker='o')
plt.xlabel("Time")
plt.ylabel("Weight (raw value)")
plt.title("Weight changes over time")
plt.grid(True)
plt.show()
