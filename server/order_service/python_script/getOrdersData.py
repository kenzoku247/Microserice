from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
# from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import sys
import json
import os

ghn = "https://donhang.ghn.vn/?order_code="
jtExpress = "https://jtexpress.vn/vi/tracking?type=track&billcode="
vnPost = "http://www.vnpost.vn/vi-vn/dinh-vi/buu-pham?key="
vtPost = "https://viettelpost.vn/viettelpost-iframe/tra-cuu-hanh-trinh-don-hang-v3-recaptcha"
ghtk = "https://i.ghtk.vn/"
bestExpress = "https://best-inc.vn/track?bills="
shopeeExpress = "https://spx.vn/m/tracking-detail/"
ninjaVan = "https://www.ninjavan.co/vi-vn/tracking?id="
zto = "https://www.ztoglobal.com/vn/Search/Search.html?dh="
lists = [jtExpress, ghtk, ghn, bestExpress, zto]
last4 = ['6150','7115','2333']


def getdata(ordercode):
    status = ""
    platform = ""
    link = ""

    option = webdriver.ChromeOptions()
    option.add_argument("--disable-gpu")
    option.add_argument("--disable-extensions")
    option.add_argument("--disable-infobars")
    # option.add_argument("--start-maximized")
    option.add_argument("--disable-notifications")
    option.add_argument('--headless')
    option.add_experimental_option('excludeSwitches', ['enable-logging'])
    option.add_argument("--disable-logging");
    option.add_argument('--log-level=3')
    option.add_argument('--no-sandbox')
    option.add_argument('--disable-dev-shm-usage')
    # option.add_experimental_option("detach", True)

    if (os.environ.get('SELE_HOST')):
        selenium_host = os.environ['SELE_HOST']
        hub_url = "http://" + selenium_host + ":4444/wd/hub"
    else:
        hub_url = "http://localhost:4444/wd/hub"

    web = webdriver.Remote(command_executor=hub_url,options=option)
    # web = webdriver.Chrome(options=option)
    if "TestOrderCode" not in ordercode:
        if ordercode[:5] == "SPXVN":    
            platform = "Shopee Express"
            link = shopeeExpress + ordercode
            web.get(link)
            web.implicitly_wait(1)
            try:
                status = web.find_element(By.XPATH, '//*[@id="root"]/div/div[2]/div[1]/div[2]/div/div/span').text
                if "Return" in status:
                    status = "Cancel"
                elif "Đã giao hàng" in status:
                    status = "Sent"
                elif "Đã hủy" in status:
                    status = "Returned"
                else:
                    status = "Sending"
            except NoSuchElementException:
                status = "Error"
        elif ordercode[:5] == "SPEVN":
            platform = "Ninja Van"
            link = ninjaVan + ordercode
            web.get(link)
            web.implicitly_wait(1)
            try:
                status = web.find_element(By.XPATH, '//*[@id="gatsby-focus-wrapper"]/div/main/div[1]/div/div/div/div/div[1]/div[2]/h1').text
                if "Cancelled" in status:
                    status = "Cancel"
                else:
                    status = "Sent"
            except NoSuchElementException:
                status = "Error"
        elif ordercode[:1] == "G":
            platform = "Giao Hang Nhanh"
            link = ghn + ordercode
            web.get(link)
            web.implicitly_wait(1)
            try:
                isValid = web.find_element(By.XPATH, '//*[@id="root"]/div[1]/div/div/div[2]/div[1]/div/div[1]').text
                if "không đúng" in isValid:
                    status = "Error"
                else:
                    status = web.find_element(By.XPATH, '//*[@id="root"]/div[1]/div/div/div[2]/div[1]/div[1]/div/div/div[1]/div/div[5]/div/div[2]/div').text
                    if ("Huỷ" in status) or ("Hoàn" in status):
                        status = "Cancel"
                    elif "Giao hàng thành công" in status:
                        status = "Sent"
                    else:
                        status = "Sending"
            except NoSuchElementException:
                status = "Error"
        elif ordercode[-2:] == "VN" and (ordercode[:5] != "SPXVN" or ordercode[:5] != "SPEVN") and ordercode[:9] != "SHOPEEVTP" and ordercode[:1] != "G":
            platform = "Vietnam Post"
            link = vnPost + ordercode
            web.get(link)
            web.get(link)
            web.implicitly_wait(1)
            try:
                status = web.find_element(By.XPATH, '//*[@id="dnn_ctr734_View_uc_divListCol"]/div[2]/div[3]/strong').text
                if "Đã phát thành công" in status:
                    status = "Sent"
                elif "hoàn" in status:
                    status = "Cancel"
                else:
                    status = "Sending"
            except NoSuchElementException:
                status = "Error"
        # elif ordercode[:9] == "SHOPEEVTP":
        #     web.get(vtPost)
        #     web.implicitly_wait(1)
        #     input_VTP = web.find_element(By.XPATH, '//*[@id="txtSearch"]')
        #     print(input_VTP)
        #     time.sleep(50)
        #     input_VTP.send_keys(ordercode)
        #     notRobot = web.find_element(By.XPATH, '//*[@id="recaptcha-anchor"]/div[1]')
        #     notRobot.click()
        
            
        else:
            for i in lists:
                if i == jtExpress:
                    platform = "JT Express"
                    link = i + ordercode
                    for i in last4:
                        web.get(link)
                        web.implicitly_wait(1)
                        try:
                            inputLast4= web.find_element(By.XPATH, '//*[@id="cellphone"]')
                            inputLast4.send_keys(i)
                            status = web.find_element(By.XPATH, '//*[@id="layout-content"]/div[2]/div[2]/div[2]/div/div/div/div/div[1]/div[2]').text
                            if "Đơn hàng đã ký nhận" in status:
                                status = "Sent"
                            elif "hoàn" in status:
                                status = "Cancel"
                            elif "Không tìm thấy dữ liệu về vận đơn" in status:
                                status = "Error"
                            else:
                                status = "Sending"
                            if status != "":
                                break
                        except NoSuchElementException:
                            status = "Error"
    else:
        status = "Sent"
        platform = "TestPlatform"
        link = "TestLink"
    web.quit()
    data = {"status": status, "platform": platform, "link": link}
    return json.dumps(data)


if __name__ == "__main__":
    print(getdata(str(sys.argv[1])))

sys.stdout.flush()
