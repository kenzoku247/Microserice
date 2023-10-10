import React, { useContext, useState, useEffect } from 'react'
import { GlobalState } from '../../../GlobalState'
import Loading from '../../utils/loading/Loading'
import OrderModal from "../../utils/orderModal/OrderModal"
import Filters from "./Filters"
import LoadMore from "./LoadMore"


const Dashboard = () => {
    const currentPage = 'Dashboard'
    const state = useContext(GlobalState)
    const [orders, setOrders] = state.orderAPI.orders
    const [isLogged] = state.userAPI.isLogged;
    useEffect(() => {
        if (!isLogged) {
            window.location.href = '/login'
        }
    }, [isLogged])
    
    
    const [loading, setLoading] = useState(false)
    if (loading) return <div><Loading /></div>
    return (
        <div className='dashboard'>
            <Filters orders={orders} setOrders={setOrders} setLoading={setLoading} currentPage={currentPage} />
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
                            <OrderModal order={order} />
                        )
                        )}
                </div>
            }
            <LoadMore currentPage={currentPage}/>
        </div>
    )
}

export default Dashboard