import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

# Generate synthetic financial data for 226 companies across 81 industries
companies = [
    "Apple Inc", "Microsoft Corp", "Amazon.com Inc", "Alphabet Inc", "Meta Platforms",
    "Tesla Inc", "Berkshire Hathaway", "NVIDIA Corp", "JPMorgan Chase", "Johnson & Johnson",
    "Visa Inc", "Procter & Gamble", "UnitedHealth Group", "Home Depot", "Mastercard Inc",
    "Bank of America", "Pfizer Inc", "Coca-Cola Co", "PepsiCo Inc", "Abbott Labs",
    "Cisco Systems", "Merck & Co", "Thermo Fisher", "Adobe Inc", "Netflix Inc",
    "Comcast Corp", "Walmart Inc", "Walt Disney Co", "Intel Corp", "Verizon Communications",
    "AT&T Inc", "Oracle Corp", "Salesforce Inc", "Accenture PLC", "Nike Inc",
    "McDonald's Corp", "Boeing Co", "IBM Corp", "Qualcomm Inc", "Texas Instruments",
    "American Express", "Lowe's Companies", "Caterpillar Inc", "Goldman Sachs", "Morgan Stanley",
    "Starbucks Corp", "3M Company", "General Electric", "Honeywell Intl", "Lockheed Martin",
    "Raytheon Technologies", "United Parcel Service", "FedEx Corp", "General Motors", "Ford Motor",
    "CVS Health", "Walgreens Boots", "Target Corp", "Costco Wholesale", "TJX Companies",
    "Marriott Intl", "Hilton Worldwide", "Booking Holdings", "Airbnb Inc", "Uber Technologies",
    "Lyft Inc", "DoorDash Inc", "Square Inc", "PayPal Holdings", "Intuit Inc",
    "ServiceNow Inc", "Workday Inc", "Zoom Video", "Slack Technologies", "Snowflake Inc",
    "Palantir Technologies", "CrowdStrike Holdings", "Datadog Inc", "MongoDB Inc", "Splunk Inc",
    "Twilio Inc", "Okta Inc", "DocuSign Inc", "HubSpot Inc", "Zendesk Inc",
    "Atlassian Corp", "Shopify Inc", "Spotify Technology", "Pinterest Inc", "Snap Inc",
    "Twitter Inc", "Roku Inc", "Peloton Interactive", "Beyond Meat", "Impossible Foods",
    "Moderna Inc", "BioNTech SE", "Gilead Sciences", "Regeneron Pharma", "Vertex Pharma",
    "Biogen Inc", "Amgen Inc", "Bristol-Myers Squibb", "AstraZeneca PLC", "Novo Nordisk",
    "Sanofi SA", "GlaxoSmithKline", "Novartis AG", "Roche Holding", "Bayer AG",
    "BASF SE", "Siemens AG", "Volkswagen AG", "Daimler AG", "BMW AG",
    "Toyota Motor", "Honda Motor", "Nissan Motor", "Sony Corp", "Samsung Electronics",
    "LG Electronics", "Panasonic Corp", "Canon Inc", "Nikon Corp", "Fujifilm Holdings",
    "Toshiba Corp", "Hitachi Ltd", "Mitsubishi Electric", "Sumitomo Corp", "Mitsui & Co",
    "Marubeni Corp", "Itochu Corp", "CITIC Group", "Alibaba Group", "Tencent Holdings",
    "Baidu Inc", "JD.com Inc", "Pinduoduo Inc", "Meituan", "Xiaomi Corp",
    "ByteDance Ltd", "Didi Chuxing", "Grab Holdings", "Sea Limited", "Shopee",
    "Reliance Industries", "Tata Consultancy", "Infosys Ltd", "Wipro Ltd", "HCL Technologies",
    "Tech Mahindra", "HDFC Bank", "ICICI Bank", "Axis Bank", "State Bank of India",
    "Bharti Airtel", "Vodafone Idea", "Maruti Suzuki", "Mahindra & Mahindra", "Tata Motors",
    "Hero MotoCorp", "Bajaj Auto", "TVS Motor", "Asian Paints", "UltraTech Cement",
    "Larsen & Toubro", "Adani Enterprises", "Adani Green Energy", "Adani Ports", "JSW Steel",
    "Tata Steel", "Coal India", "NTPC Ltd", "Power Grid Corp", "GAIL India",
    "Oil & Natural Gas", "Indian Oil Corp", "Bharat Petroleum", "Hindustan Petroleum", "Exxon Mobil",
    "Chevron Corp", "Shell PLC", "BP PLC", "TotalEnergies SE", "ConocoPhillips",
    "Schlumberger NV", "Halliburton Co", "Baker Hughes", "Occidental Petroleum", "Marathon Petroleum",
    "Phillips 66", "Valero Energy", "Delta Air Lines", "American Airlines", "United Airlines",
    "Southwest Airlines", "JetBlue Airways", "Spirit Airlines", "Alaska Air Group", "Carnival Corp",
    "Royal Caribbean", "Norwegian Cruise", "Las Vegas Sands", "MGM Resorts", "Wynn Resorts",
    "Caesars Entertainment", "Penn National Gaming", "DraftKings Inc", "FanDuel Group", "Barstool Sports",
    "Electronic Arts", "Activision Blizzard", "Take-Two Interactive", "Roblox Corp", "Unity Software",
    "Epic Games", "Riot Games", "Valve Corp", "Bungie Inc", "Ubisoft Entertainment",
    "Square Enix", "Capcom Co", "Bandai Namco", "Konami Holdings", "Sega Sammy",
    "Nintendo Co", "Red Bull GmbH", "Monster Beverage", "Constellation Brands", "Anheuser-Busch InBev",
    "Diageo PLC", "Heineken NV", "Carlsberg Group", "Molson Coors", "Boston Beer",
    "Kraft Heinz", "General Mills", "Kellogg Co", "Mondelez Intl", "Nestle SA",
    "Unilever PLC", "Colgate-Palmolive", "Kimberly-Clark", "Estee Lauder", "L'Oreal SA"
]

industries = [
    "Technology", "Software", "E-commerce", "Internet Services", "Social Media",
    "Electric Vehicles", "Financial Services", "Semiconductors", "Banking", "Pharmaceuticals",
    "Payment Processing", "Consumer Goods", "Healthcare", "Retail", "Insurance",
    "Biotechnology", "Beverages", "Food & Beverage", "Medical Devices", "Networking",
    "Cloud Computing", "Streaming", "Media & Entertainment", "Telecommunications", "Enterprise Software",
    "Consulting", "Sportswear", "Fast Food", "Aerospace", "IT Services",
    "Credit Services", "Home Improvement", "Industrial", "Investment Banking", "Coffee & Restaurants",
    "Conglomerate", "Manufacturing", "Defense", "Logistics", "Transportation",
    "Automotive", "Healthcare Services", "Department Stores", "Wholesale", "Discount Stores",
    "Hospitality", "Hotels", "Online Travel", "Vacation Rentals", "Ride Sharing",
    "Food Delivery", "Fintech", "Accounting Software", "IT Management", "Video Conferencing",
    "Collaboration Tools", "Data Analytics", "Big Data", "Cybersecurity", "Databases",
    "Developer Tools", "API Services", "Identity Management", "E-Signature", "Marketing Software",
    "Customer Support", "Project Management", "E-commerce Platforms", "Music Streaming", "Photo Sharing",
    "Short-form Video", "Microblogging", "Connected TV", "Fitness Equipment", "Alternative Protein",
    "Vaccine Development", "Gene Therapy", "Antiviral Drugs", "Rare Diseases", "Oncology",
    "Neuroscience", "Immunology", "Cardiovascular", "Respiratory", "Diabetes Care"
]

# Map companies to industries
company_industry = {}
for i, company in enumerate(companies):
    company_industry[company] = industries[i % len(industries)]

# Generate 40 raw financial features
data = []
for company in companies:
    industry = company_industry[company]
    
    # Generate realistic financial metrics with some variability
    base_revenue = np.random.uniform(1e9, 500e9)
    base_profit = base_revenue * np.random.uniform(-0.1, 0.4)
    
    row = {
        'Company': company,
        'Industry': industry,
        'totalRevenue': base_revenue,
        'grossProfit': base_revenue * np.random.uniform(0.2, 0.7),
        'ebitda': base_revenue * np.random.uniform(0.1, 0.5),
        'netIncome': base_profit,
        'totalAssets': base_revenue * np.random.uniform(0.5, 5.0),
        'totalLiabilities': base_revenue * np.random.uniform(0.3, 3.0),
        'totalDebt': base_revenue * np.random.uniform(0, 2.0),
        'totalEquity': base_revenue * np.random.uniform(0.2, 2.0),
        'currentAssets': base_revenue * np.random.uniform(0.3, 2.0),
        'currentLiabilities': base_revenue * np.random.uniform(0.2, 1.5),
        'cashAndCashEquivalents': base_revenue * np.random.uniform(0.1, 1.0),
        'operatingCashFlow': base_revenue * np.random.uniform(-0.1, 0.4),
        'freeCashFlow': base_revenue * np.random.uniform(-0.2, 0.3),
        'revenueGrowth': np.random.uniform(-0.3, 0.5),
        'earningsGrowth': np.random.uniform(-0.4, 0.6),
        'earningsQuarterlyGrowth': np.random.uniform(-0.5, 0.7),
        'returnOnAssets': np.random.uniform(-0.1, 0.25),
        'returnOnEquity': np.random.uniform(-0.2, 0.5),
        'profitMargins': np.random.uniform(-0.15, 0.4),
        'grossMargins': np.random.uniform(0.1, 0.7),
        'operatingMargins': np.random.uniform(-0.1, 0.4),
        'ebitdaMargins': np.random.uniform(-0.1, 0.5),
        'debtToEquity': np.random.uniform(0, 4.0),
        'currentRatio': np.random.uniform(0.5, 3.0),
        'quickRatio': np.random.uniform(0.3, 2.5),
        'priceToBook': np.random.uniform(0.5, 50.0),
        'priceToSales': np.random.uniform(0.1, 20.0),
        'forwardPE': np.random.uniform(5.0, 100.0),
        'trailingPE': np.random.uniform(5.0, 120.0),
        'pegRatio': np.random.uniform(0.5, 5.0),
        'enterpriseToRevenue': np.random.uniform(0.5, 15.0),
        'enterpriseToEbitda': np.random.uniform(2.0, 30.0),
        'bookValue': base_revenue * np.random.uniform(0.1, 2.0),
        'marketCap': base_revenue * np.random.uniform(0.5, 20.0),
        'enterpriseValue': base_revenue * np.random.uniform(0.7, 22.0),
        'sharesOutstanding': np.random.uniform(1e8, 1e10),
        'beta': np.random.uniform(0.5, 2.5),
        'fiftyTwoWeekHigh': np.random.uniform(50, 500)
    }
    data.append(row)

df = pd.DataFrame(data)

# Introduce some missing values (5-10% missing)
for col in df.columns:
    if col not in ['Company', 'Industry']:
        mask = np.random.random(len(df)) < 0.07
        df.loc[mask, col] = np.nan

# Save to Excel
output_path = Path(__file__).parent / 'financialdata.xlsx'
df.to_excel(output_path, index=False, engine='openpyxl')

print(f"Generated synthetic financial data: {len(df)} companies, {len(df.columns)} features")
print(f"Saved to: {output_path}")
print(f"Missing values: {df.isnull().sum().sum()} ({df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100:.2f}%)")
