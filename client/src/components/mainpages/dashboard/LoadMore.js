import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'

function LoadMore({ currentPage }) {
    const state = useContext(GlobalState)
    const [page, setPage] = state.orderAPI.page
    const [result] = state.orderAPI.result
    const [orders] = state.orderAPI.orders
    const [length, setLength] = useState(0)

    useEffect(() => {
        if (currentPage === 'Import') {
            setLength(orders.filter(order => order.datetime === new Date().toISOString().split('T')[0]).length)
        } else if (currentPage === "Returned") {
            setLength(orders.filter(order => order.status === "Cancel").length)
        } else {
            setLength(result)
        }
    }, [currentPage, orders, result])


    return (
        <div className="load_more">
            {
                length < page * 20 ? ""
                    : <button onClick={() => setPage(page + 1)}>Load more</button>
            }
        </div>
    )
}

export default LoadMore
