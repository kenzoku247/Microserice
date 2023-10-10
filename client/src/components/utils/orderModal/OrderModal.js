import React, { useEffect, useState } from "react";
import axios from 'axios'

import { BsPencilSquare } from "react-icons/bs"
import { TiTick, TiTimes } from "react-icons/ti"

import VNP from "../../../img/VNP.png"
import SE from "../../../img/SE.png"
import GHN from "../../../img/GHN.png"
import JT from "../../../img/JT.png"
import VTP from "../../../img/VTP.png"
import NV from "../../../img/NV.png"


const OrderModal = ({ order, currentPage }) => {
    const [note, setNote] = useState(order.note)
    const [onEdit, setOnEdit] = useState(false)
    const [color, setColor] = useState("")
    const newDate = order.datetime.split("-")[2] + "-" + order.datetime.split("-")[1] + "-" + order.datetime.split("-")[0]

    useEffect(() => {
        if (order.status === "Cancel") {
            setColor("red")
        } else if (order.status === "Returned") {
            setColor("black")
        } else if (order.status === "Sent") {
            setColor("yellow")
        } else if (order.status === "Sending") {
            setColor("green")
        }

    }, [order.status])



    const handleSave = async (id) => {
        document.getElementById("inputNote_" + id).disabled = !document.getElementById("inputNote_" + id).disabled
        setOnEdit(!onEdit)
        try {
            await axios.put(`/api_order/order`, { orderCode: order.orderCode, note: note, status: order.status })
        } catch (error) {
            alert(error.response.data.msg)
        }
    };

    const handleEdit = (id) => {
        document.getElementById("inputNote_" + id).disabled = !document.getElementById("inputNote_" + id).disabled
        setOnEdit(!onEdit)
    }

    const handleCancel = (id) => {
        setNote(order.note)
        document.getElementById("inputNote_" + id).disabled = !document.getElementById("inputNote_" + id).disabled
        setOnEdit(!onEdit)
    }

    return (
        <div key={order._id} className="order_row">
            <div className="order_date">
                <span><b>{newDate}</b> </span>
            </div>
            <div className="order_code" >
                {order.orderCode}
            </div>
            <div className="order_platform">
                {order.platform}
                <img src={
                    order.platform === "Vietnam Post" ? VNP :
                        order.platform === "Shopee Express" ? SE :
                            order.platform === "Ninja Van" ? NV :
                                order.platform === "Giao Hang Nhanh" ? GHN :
                                    order.platform === "JT Express" ? JT : VTP

                } alt="" className="icon_platform" />
            </div>
            <div className={"order_status order_status_color_" + color}>
                {currentPage === "Returned"
                    ? <b>Khiếu nại</b>
                    : <b>{order.status === 'Sending' ? 'Đang gửi' : order.status === 'Sent' ? 'Đã gửi' : order.status === 'Created' ? 'Đã tạo đơn' : order.status === 'Returned' ? 'Hoàn' : 'Huỷ'}</b>
                }
            </div>
            <div className="order_link">
                <a href={order.link}>{order.link}</a>
            </div>
            <div className="order_note">
                <textarea
                    name=""
                    id={"inputNote_" + order._id.slice(-4)}
                    rows="3"
                    cols="30"
                    onChange={(e) => setNote(e.target.value)}
                    value={note}
                    disabled={true}
                />
                <div className="order_note_icon">
                    {onEdit ? <><TiTick cursor={"pointer"} onClick={() => handleSave(order._id.slice(-4))} /> <TiTimes cursor={"pointer"} onClick={() => handleCancel(order._id.slice(-4))} /></> : <BsPencilSquare cursor={"pointer"} onClick={() => handleEdit(order._id.slice(-4))} />}
                </div>

            </div>
        </div>
    )
}

export default OrderModal