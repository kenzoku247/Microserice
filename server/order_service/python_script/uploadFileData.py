from getOrdersData import *
import pandas as pd
import numpy as np
import sys
from datetime import date, datetime, timedelta


def process_file(filePath):
    data_csv = pd.read_csv(
        filePath,
        encoding="utf-8",
        sep=",",
        usecols=['NGÀY', 'THÁNG', 'Ma VC', 'MÃ VẬN ĐƠN', 'GỬI?', 'GHI CHÚ']).drop_duplicates(subset=['MÃ VẬN ĐƠN'])
    data_csv.rename(columns={'NGÀY': 'day', 'THÁNG': 'month', 'Ma VC': 'platform', 'MÃ VẬN ĐƠN': 'orderCode', 'GỬI?': 'status', 'GHI CHÚ': 'note'}, inplace=True)
    data_csv['day'] = data_csv['day'].fillna(0).astype(int)
    data_csv['month'] = data_csv['month'].fillna(0).astype(int)
    data_csv['datetime'] = data_csv['day'].astype(str) + "/" + data_csv['month'].astype(str) + "/2023"

    data_csv.replace({'platform': '1'}, {'platform': 'Vietnam Post'}, inplace=True)
    data_csv.replace({'platform': '2'}, {'platform': 'JT Express'}, inplace=True)
    data_csv.replace({'platform': '3'}, {'platform': 'Giao Hang Nhanh'}, inplace=True)
    data_csv.replace({'platform': '4'}, {'platform': 'Ninja Van'}, inplace=True)
    data_csv.replace({'platform': '5'}, {'platform': 'Best Express'}, inplace=True)
    data_csv.replace({'platform': '6'}, {'platform': 'Shopee Express'}, inplace=True)
    data_csv.replace({'platform': '7'}, {'platform': 'Viettel Post'}, inplace=True)
    data_csv.replace({'platform': '8'}, {'platform': 'YTO Express'}, inplace=True)

    data_csv.replace('ĐÃ GỬI', 'Sent', inplace=True)
    data_csv.replace('HOÀN', 'Returned', inplace=True)

    data_csv1 = data_csv[['datetime', 'platform', 'orderCode', 'status', 'note']]

    conditions = [
        (data_csv1['platform'] == "Vietnam Post"),
        (data_csv1['platform'] == "JT Express"),
        (data_csv1['platform'] == "Giao Hang Nhanh"),
        (data_csv1['platform'] == "Ninja Van"),
        (data_csv1['platform'] == "Best Express"),
        (data_csv1['platform'] == "Shopee Express"),
        (data_csv1['platform'] == "Viettel Post")
    ]

    value = [
        "http://www.vnpost.vn/vi-vn/dinh-vi/buu-pham?key=",
        "https://jtexpress.vn/vi/tracking?type=track&billcode=",
        "https://donhang.ghn.vn/?order_code=",
        "https://www.ninjavan.co/vi-vn/tracking?id=",
        "https://best-inc.vn/track?bills=",
        "https://spx.vn/m/tracking-detail/",
        "https://viettelpost.vn/viettelpost-iframe/tra-cuu-hanh-trinh-don-hang-v3-recaptcha",
    ]

    data_csv1['link'] = np.select(conditions, value) + data_csv1['orderCode']
    data_csv1.dropna(subset=['orderCode'], inplace=True)
    # dateToCompare = (date.today() - timedelta(days=7)).strftime("%Y-%m-%d")
    dateToCompare = pd.to_datetime(date.today() - timedelta(days=7), format="%d/%m/%Y")
    data_csv1['datetime'] = pd.to_datetime(data_csv1['datetime'], format="%d/%m/%Y")
    fixed_data = data_csv1.loc[data_csv1['datetime'] <= dateToCompare]
    fixed_data['datetime'] = pd.to_datetime(fixed_data['datetime'], format="%#d/%#m/%Y").astype(str)
    uncertain_data = data_csv1.loc[data_csv1['datetime'] > dateToCompare]
    uncertain_data['datetime'] = pd.to_datetime(uncertain_data['datetime'], format="%#d/%#m/%Y").astype(str)

    fixed_json = fixed_data.to_json(orient='records')
    newFilePath = filePath[:-4] + "_fixed.json"
    with open(newFilePath, 'w') as json_file:
        json_file.write(fixed_json)

    uncertain_json = uncertain_data.to_json(orient='records')
    newFilePath = filePath[:-4] + "_uncertain.json"
    with open(newFilePath, 'w') as json_file:
        json_file.write(uncertain_json)




if __name__ == '__main__':
    filePath = sys.argv[1]
    process_file(filePath)
