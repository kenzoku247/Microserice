import React, { useContext, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import Chart from "react-apexcharts";

const Statistical = () => {
  const state = useContext(GlobalState)
  const [orders, setOrders] = state.orderAPI.orders
  let firstDayToToday = []
  let orderCreated = []
  const today = new Date(new Date().toLocaleDateString()).getTime()
  const [format, setFormat] = useState(1)

  if (format !== null) {
    if (orders.length > 0) {
      orderCreated = orders.map(order => new Date(+order.datetime.split("/")[2], order.datetime.split("/")[1] - 1, +order.datetime.split("/")[0]).getTime())
      let firstDayOrder = new Date(+orders[orders.length - 1].datetime.split("/")[2], orders[orders.length - 1].datetime.split("/")[1] - 1, +orders[orders.length - 1].datetime.split("/")[0]).getTime()
      // console.log(firstDayOrder)
      // console.log(today)
      let x = today
      firstDayToToday.push(x)
      do {
        x -= 60 * 60 * 24 * 1000 * format
        firstDayToToday.push(x)
      } while (x >= new Date(new Date(firstDayOrder).toLocaleDateString()).getTime());
    }
    console.log(firstDayToToday.length, format)
    if (firstDayToToday.length > 0 && format === '7') {
      let last = firstDayToToday[0]
      let first = firstDayToToday[firstDayToToday.length - 1]
      firstDayToToday = []
      for (let i = first; i <= last; i += 60 * 60 * 24 * 1000) {
        // console.log(i)
        firstDayToToday.push(i)

      }
      console.log(firstDayToToday)
    } else if (firstDayToToday.length > 0 && format === '30') {
      let last = firstDayToToday[0]
      let first = firstDayToToday[firstDayToToday.length - 1]
      firstDayToToday = []
      for (let i = first; i <= last; i += 60 * 60 * 24 * 1000 * 5) {
        // console.log(i)
        firstDayToToday.push(i)

      }
      // console.log(firstDayToToday)
    }
  }

  // console.log(new Date().toLocaleDateString('vi-VN'))

  // console.log(orderCreated)
  // firstDayToToday.map(e => (
  //     console.log(new Date(e).toLocaleDateString('vi-VN'))
  //   ))
  //   orderCreated.map(e => (
  //     console.log(new Date(e).toLocaleDateString('vi-VN'))
  //   ))

  const handleFormat = e => {
    setFormat(e.target.value)
    firstDayToToday = []
    orderCreated = []
    // console.log(format)
  }

  let series = []

  if (format === '7') {
    series = [
      {
        name: "New Orders",
        data:
          firstDayToToday.map(day =>
          ({
            x: new Date(day).toLocaleDateString('vi-VN'),
            y: orderCreated.filter(date => new Date(date).toLocaleDateString() === new Date(day).toLocaleDateString()).length
          })
          )
      }
    ]

  } else if (format === '30') {
    series = [
      {
        name: "New Orders",
        data:
          firstDayToToday.map(day =>
          ({
            x: new Date(day).toLocaleDateString('vi-VN'),
            y: orderCreated.filter(date => new Date(date).toLocaleDateString() === new Date(day).toLocaleDateString()).length
          })
          )
      }
    ]

    
  } else {
    series = [
      {
        name: "New Orders",
        data:
          firstDayToToday.reverse().map(day =>
          ({
            x: new Date(day).toLocaleDateString('vi-VN'),
            y: orderCreated.filter(date => new Date(date).toLocaleDateString() === new Date(day).toLocaleDateString()).length
          })
          )
      }
    ]
  }
  console.log(firstDayToToday)
  console.log(series)

  const options = {
    chart: {
      id: 'realtime',
      height: 350,
      type: 'line',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: 'Realtime Chart',
      align: 'left'
    },
    markers: {
      size: 0
    },
    xaxis: {
      type: 'date',
      // range: XAXISRANGE,
    },
    yaxis: {
      max: 24,
      min: 0
    },
    legend: {
      show: false
    },
  }

  return (
    <div className='statistical'>
      <div className='format'>
        <button id='day' value={1} onClick={handleFormat}>Day</button>
        <button id='week' value={7} onClick={handleFormat}>Week</button>
        <button id='month' value={30} onClick={handleFormat}>Month</button>
      </div>
      <div className='chart'>
        <Chart options={options} series={series} type="line" height={350} />
      </div>
    </div>
  )
}

export default Statistical