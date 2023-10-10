import React, { useState, useContext } from 'react'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'


import OrderModal from "../../utils/orderModal/OrderModal"
import Filter from "../dashboard/Filters"
import LoadMore from "../dashboard/LoadMore"
import Loading from "../../utils/loading/Loading"

import { BsArrowRight } from "react-icons/bs";


const Returned = () => {
  const currentPage = "Returned"
  const [orderCode, setOrderCode] = useState("")
  const state = useContext(GlobalState)
  const [orders, setOrders] = state.orderAPI.orders
  const [loading, setLoading] = useState(false)

  console.log(orders)
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      setLoading(true)
      if (orders.filter(order => order.orderCode === orderCode).length !== 0) {
        orders.find(order => order.orderCode === orderCode).status = "Returned"
        await axios.put(`/api_order/order`, { orderCode: orderCode, note: orders.find(order => order.orderCode === orderCode).note, status: "Returned" })
      } else {
        alert("Mã vận đơn này không có trong hệ thống!")
      }
      setOrderCode("")
      setLoading(false)
    } catch (error) {
      alert(error.response.data.msg)
    }
  }

  return (
    <div className='returned'>
      <form onSubmit={handleSubmit} className='import_box'>
        <input type="text" name="" id="input_order_code" value={orderCode} placeholder="Nhập mã vận đơn!"
          onChange={e => setOrderCode(e.target.value)}
        />
        <BsArrowRight className='import_box_icon' type='submit' disabled={orderCode.length === 0} />
      </form>
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

          {
            orders.map(order => (
              order.status === "Cancel" &&
              <OrderModal order={order} currentPage={currentPage} />
            )
            )}
        </div>
      }
      <LoadMore currentPage={currentPage} />
    </div>
  )
}

export default Returned