import { useState, useEffect } from 'react';
import axios from 'axios';


function OrderAPI() {
    const [orders, setOrders] = useState([])
    const [callback, setCallback] = useState(false)
    const [status, setStatus] = useState([])
    const [platform, setPlatform] = useState([])
    const [datetime, setDatetime] = useState('')
    const [sort, setSort] = useState('')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [result, setResult] = useState(0)


    useEffect(() => {
        const getOrders = async () => {
            
            var res = null
            var orders = []
            var orders1 = []
            if (status.length === 0 && platform.length === 0 && datetime === "") {
                res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&orderCode[regex]=${search}`)
                orders = res.data.orders
            } else if (status.length === 0 && platform.length !== 0 && datetime === '') {
                orders = await Promise.all(platform.map(async element => {
                    res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&platform=${element}&orderCode[regex]=${search}`)
                    return res.data.orders
                }));
            } else if (status.length !== 0 && platform.length === 0 && datetime === '') {
                orders = await Promise.all(status.map(async element => {
                    res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&status=${element}&orderCode[regex]=${search}`)
                    return res.data.orders
                }));
            } else if (status.length === 0 && platform.length === 0 && datetime !== '') {
                res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&datetime=${datetime}&orderCode[regex]=${search}`)
                orders = res.data.orders
            } else if (status.length === 0 && platform.length !== 0 && datetime !== '') {
                orders = await Promise.all(platform.map(async element => {
                    res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&datetime=${datetime}&platform=${element}&orderCode[regex]=${search}`)
                    return res.data.orders
                }));
            } else if (status.length !== 0 && platform.length === 0 && datetime !== '') {
                orders = await Promise.all(status.map(async element => {
                    res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&datetime=${datetime}&status=${element}&orderCode[regex]=${search}`)
                    return res.data.orders
                }));
            } else if (status.length !== 0 && platform.length !== 0 && datetime === '') {
                orders = await Promise.all(status.map(async element => {
                    orders1 = await Promise.all(platform.map(async element1 => {
                        res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&status=${element}&platform=${element1}&orderCode[regex]=${search}`)
                        return res.data.orders
                    }))
                    return orders1.flat()
                }));
            } else {
                orders = await Promise.all(status.map(async element => {
                    orders1 = await Promise.all(platform.map(async element1 => {
                        res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&status=${element}&platform=${element1}&datetime=${datetime}&orderCode[regex]=${search}`)
                        return res.data.orders
                    }))
                    return orders1.flat()
                }));
                res = await axios.get(`/api_order/orders?${sort}&limit=${page * 20}&status=${status}&platform=${platform}&datetime=${datetime}&orderCode[regex]=${search}`)
            }
            setOrders(orders.flat())
            setResult(orders.flat().length)
            
        }
        getOrders()
        
    }, [callback, status, search, page, platform, sort, datetime])

    return {
        orders: [orders, setOrders],
        callback: [callback, setCallback],
        status: [status, setStatus],
        platform: [platform, setPlatform],
        datetime: [datetime, setDatetime],
        sort: [sort, setSort],
        search: [search, setSearch],
        page: [page, setPage],
        result: [result, setResult]
    }
}

export default OrderAPI