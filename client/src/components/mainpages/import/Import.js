import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { GlobalState } from '../../../GlobalState'
import OrderModal from "../../utils/orderModal/OrderModal"
import Filter from "../dashboard/Filters"
import LoadMore from "../dashboard/LoadMore"
import Loading from "../../utils/loading/Loading";
import { BsArrowRight } from "react-icons/bs";



const Import = () => {
  const currentPage = "Import"
  const [orderCode, setOrderCode] = useState("")
  const state = useContext(GlobalState)
  const [orders, setOrders] = state.orderAPI.orders
  const [loading, setLoading] = useState(false)
  const [ordersToday, setOrdersToday] = useState([])

  const [selectedFile, setSelectedFile] = useState(null);

  

  useEffect(() => {
    setOrdersToday(orders.filter(order => (
      order.datetime === new Date().toISOString().split('T')[0])))

  }, [orders])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      const res1 = await axios.post(`/api_order/order`, { orderCode: orderCode })
      if (res1.data.success === true) {
        document.getElementById('input_order_code').innerText = ""
        const res2 = await axios.get(`/api_order/orders`)
        setOrders(res2.data.orders)

      } else {
        alert(res1.data.msg)
      }
      setOrderCode("")
      setLoading(false)
    } catch (error) {
      alert(error.response.data.msg)
    }
  }

  const handleFile = e => {
    const file = e.target.files[0];
    // Add function to validate file type
    setSelectedFile(file);
  }

  const handleUpload = async e => {
    e.preventDefault()
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        setLoading(true)
        const res = await axios.post(`/api_order/upload`, formData)
        alert(res.data.msg)
        setLoading(false)
      } else {
        alert("No file was uploaded.")
      }
    } catch (error) {
      console.log(error.response)
    }
  }

  return (
    <div className='import'>
      <div className='upload_type'>
        <form onSubmit={handleSubmit} className="single_upload">
          <input type="text" name="" id="input_order_code" value={orderCode} placeholder="Nhập mã vận đơn!"
            onChange={e => setOrderCode(e.target.value)}
          />
          <BsArrowRight className='single_upload_icon' type='submit' disabled={orderCode.length === 0} />
        </form> 

        <form onSubmit={handleUpload} enctype="multipart/form-data" className='multiple_upload'>
            <h4>Tải lên tệp dữ liệu đơn hàng</h4>
            <input type="file" name="file" accept=".csv" id='fileInput' onChange={handleFile}/>
            <button type="submit" >Upload</button>
        </form>
      </div>


      <Filter orders={orders} setOrders={setOrders} setLoading={setLoading} currentPage={currentPage} />
      {loading ? <Loading /> :
        <div className="orders_table">
          <div className='orders_header'>
            <span>Ngày, giờ tạo</span>
            <span>Mã vận đơn</span>
            <span>Đơn vị vận chuyển</span>
            <span>Trạng thái</span>
            <span>Link</span>
            <span>Ghi chú</span>
          </div>
          <h3>{ordersToday.length === 0 && "Không có đơn hàng nào!"}</h3>

          {
            orders.map(order => (
              order.datetime === new Date().toISOString().split('T')[0] &&
              <OrderModal order={order} />
            )
            )}
        </div>
      }
      <LoadMore currentPage={currentPage} />

    </div >
  )
}

export default Import