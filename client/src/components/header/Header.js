import React from "react";
import "./Header.css";
import axios from 'axios'


const Header = () => {
  const logoutUser = async () =>{
    await axios.get(`/api_user/logout`)
    localStorage.removeItem('firstLogin' )
    window.location.href = "/login";
}

  return (
    <div className="header">
      <div id="main-navbar" className="navbar">
        <a href="/dashboard"><h2 className="logo">Checking Order</h2></a>
        <nav>
          <ul>
            <li>
              <a href="/dashboard">Trang chủ / Dashboard</a>
            </li>
            <li>
              <a href="/import">Nhập / Import</a>
            </li>
            <li>
              <a href="/returned">Hoàn / Returned</a>
            </li>
            {/* <li>
              <a href="/statistical">Thống kê / Statistical</a>
            </li> */}
            <li>
              <a href="/about">About / Về chúng tôi</a>
            </li>
            <li><a href="/login" onClick={logoutUser}>Logout / Đăng xuất</a></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};


export default Header