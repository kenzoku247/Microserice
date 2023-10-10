import React, { useContext, useEffect, useState, useMemo } from 'react'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import images from "../../../img"
import { FcShipped, FcCheckmark, FcCancel, FcUndo, FcClearFilters } from "react-icons/fc"
import { RxUpdate } from "react-icons/rx"
import { TiTick } from "react-icons/ti"




function Filters({ setOrders, orders, setLoading, currentPage }) {
    const state = useContext(GlobalState)
    const days = useMemo(() => [], []);
    const [status, setStatus] = state.orderAPI.status
    const [platform, setPlatform] = state.orderAPI.platform
    const [datetime, setDatetime] = state.orderAPI.datetime
    const [sort, setSort] = state.orderAPI.sort
    const [search, setSearch] = state.orderAPI.search
    const [d, setD] = useState("")
    const [stts, setStts] = useState([])
    const [plfs, setPlfs] = useState([])


    const statusArr = [
        {
            statusV: 'Đã gửi',
            statusE: 'Sent',
            icon: <FcCheckmark />
        }, {
            statusV: 'Đang gửi',
            statusE: 'Sending',
            icon: <FcShipped />
        }, {
            statusV: 'Huỷ',
            statusE: 'Cancel',
            icon: <FcCancel />
        }, {
            statusV: 'Hoàn',
            statusE: 'Returned',
            icon: <FcUndo />
        }
    ]

    const platformArr = [
        {
            name: "Shopee Express",
            sign: "SE",
            image: images.SE
        },
        {
            name: "JT Express",
            sign: "JT",
            image: images.JT
        },
        {
            name: "Ninja Van",
            sign: "NV",
            image: images.NV
        },
        {
            name: "Giao Hang Nhanh",
            sign: "GHN",
            image: images.GHN
        },
        {
            name: "Vietnam Post",
            sign: "VNP",
            image: images.VNP
        },
        {
            name: "Viettel Post",
            sign: "VTP",
            image: images.VTP
        },
    ]

    const handleDate = e => {
        setD(e.target.value)
    }

    const handlePlfs = (platform) => {
        if (!plfs.includes(platform)) {
            setPlfs([...plfs, platform])
        } else {
            setPlfs((plfs) => plfs.filter(plf => plf !== platform))
        }
    }

    const handleStts = (status) => {
        if (!stts.includes(status)) {
            setStts([...stts, status])
        } else {
            setStts((stts) => stts.filter(stt => stt !== status))
        }
    }

    const handleSort = e => {
        setSort(e.target.value)
        if (currentPage === 'Import') {
            setDatetime(new Date().toISOString().split('T')[0])
        }
    }

    const handleClear = () => {
        if (currentPage === "Dashboard") {
            document.getElementById("date").value = "";
        } 
        setD("")
        setPlfs([])
        setStts([])
    }

    useEffect(() => {
        const handleChange = () => {
            if (plfs !== []) {
                setPlatform(plfs)
            }
            if (stts !== []) {
                setStatus(stts)
            }

            if (d !== "") {
                setDatetime(d)
            } else {
                setDatetime("")
            }
            setSearch("")
        }
        handleChange()


    }, [d, platform, plfs, setDatetime, setPlatform, setSearch, setStatus, status, stts])

    // console.log(plfs)
    const handleUpdate = async () => {
        setLoading(true)
        var list_order_update = []
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].status === "Sending" || orders[i].status === "Created") {
                list_order_update.push(orders[i].orderCode)
            }
        }

        try {

            await axios.put(`/api_order/orders`, { orderCodes: list_order_update })
            const res = await axios.get(`/api_order/orders`)
            setOrders(res.data.orders)
            setLoading(false)
        } catch (error) {
            alert(error.response.data.msg)
        }
    }

    useEffect(() => {
        const listDays = () => {
            orders.map((order) =>
                !days.includes(order.datetime) && days.push(order.datetime)
            )
        }
        listDays()
    }, [days, orders])

    return (
        <div className='filters'>
            <div className='filters_search_and_update'>

                <div className='filters_search'>
                    <input type="text" value={search} placeholder="Tìm kiếm mã vận đơn:"
                        onChange={e => setSearch(e.target.value)} />
                </div>
                
                <button className="filters_update" onClick={handleUpdate} disabled={currentPage === "Returned"}>
                    <span>Cập nhật trạng thái </span>
                    <RxUpdate />
                </button>
            </div>
            <div className='filters_box'>

                <div className='filters_box_left'>

                    {(currentPage !== "Import" && currentPage !== "Returned") &&
                        <>
                            <div className="filter">
                                <b><span>Ngày: </span></b>
                                <input type="date" name="date" id="date" onChange={handleDate} />
                            </div>
                            <div className="filter">
                                <b><span>Trạng thái: </span></b>
                                <div className='status_platform'>
                                    {statusArr.map(el => (
                                        <div className={`filter_platform_box ${status.includes(el.statusE) ? el.statusE + "_active" : ""}`} onClick={() => handleStts(el.statusE)}>
                                            {el.statusV}
                                            {el.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    }
                    <div className="filter">
                        <b><span>Đơn vị vận chuyển: </span></b>
                        <div className='filter_platform'>
                            {platformArr.map(el => (
                                <div className={`filter_platform_box ${platform.includes(el.name) ? el.sign + "_active" : ""}`} onClick={() => handlePlfs(el.name)}>
                                    <img src={el.image} alt="platform" />
                                    <TiTick />
                                </div>
                            ))}
                        </div>

                    </div>
                    <div className="filter">
                        <button className="filters_update" onClick={handleClear} >
                            <span>Đặt lại </span>
                            <FcClearFilters />
                        </button>
                    </div>
                </div>
                <div className='filters_box_right'>



                    <div className="filter">
                        <b><span>Sắp xếp theo: </span></b>
                        <select value={sort} onChange={handleSort} >
                            {/* {currentPage === 'Import' && setDatetime(new Date().toISOString().split('T')[0])} */}
                            <option value=''>Mới nhất</option>
                            <option value='sort=-datetime'>Cũ nhất</option>
                        </select>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default Filters
