import React, {createContext, useState, useEffect} from 'react'
import OrderAPI from './api/OrderAPI'
import UserAPI from './api/UserAPI'
import axios from 'axios'
import io from "socket.io-client";

export const GlobalState = createContext()

export const DataProvider = ({children}) =>{
    const [token, setToken] = useState(false)
    const [progress, setProgress] = useState(0);

    useEffect(() =>{
        const firstLogin = localStorage.getItem('firstLogin')
        if(firstLogin){
            const refreshToken = async () =>{
                const res = await axios.get(`/api_user/refresh_token`)
                setToken(res.data.accessToken)
    
                setTimeout(() => {
                    refreshToken()
                }, 10 * 60 * 1000)
            }
            refreshToken()
        }
        const socket = io("http://localhost:3000");
        socket.on('progress', (progressPercentage) => {
            setProgress(progressPercentage);
        });
        console.log(progress)
        return () => {
            socket.disconnect();
        };
    },[progress])

    OrderAPI()

    const state = {
        orderAPI: OrderAPI(),
        token: [token, setToken],
        userAPI: UserAPI(token),
    }

    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    )
}