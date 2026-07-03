import pandas as pd
p = r'C:\Users\alex\Downloads\heartopia_broad-match_us_2026-07-03.xlsx'
df = pd.read_excel(p, sheet_name='heartopia')
df = df.sort_values('Volume', ascending=False)
print(df.head(150).to_string(index=False))
