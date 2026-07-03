import pandas as pd, json
p = r'C:\Users\alex\Downloads\heartopia_broad-match_us_2026-07-03.xlsx'
x = pd.ExcelFile(p)
print(json.dumps({'sheets': x.sheet_names}, ensure_ascii=False))
for s in x.sheet_names:
    df = pd.read_excel(p, sheet_name=s)
    print('SHEET', s, 'ROWS', len(df), 'COLS', list(map(str, df.columns)))
    print(df.head(5).to_string(index=False))
