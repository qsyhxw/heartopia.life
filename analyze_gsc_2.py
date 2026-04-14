import pandas as pd

file_path = "d:/Antigravity/heartopia.life/26年3月heartopia.life 每月GSC数据分析_无标题页面_表格.csv"
df = pd.read_csv(file_path)

# Clean query (lowercase)
df['Query'] = df['Query'].str.lower().str.strip()

# Aggregate grouping by Query and Landing Page
agg_df = df.groupby(['Query', 'Landing Page']).apply(
    lambda x: pd.Series({
        'Impressions': x['Impressions'].sum(),
        'Clicks': x['Url Clicks'].sum(),
        'CTR': x['Url Clicks'].sum() / x['Impressions'].sum() if x['Impressions'].sum() > 0 else 0,
        'AvgPos': (x['Average Position'] * x['Impressions']).sum() / x['Impressions'].sum() if x['Impressions'].sum() > 0 else 0
    })
).reset_index()

# Sort by Impressions
agg_df = agg_df.sort_values(by='Impressions', ascending=False)

agg_df.head(200).to_csv("d:/Antigravity/heartopia.life/top_queries.csv", index=False)
