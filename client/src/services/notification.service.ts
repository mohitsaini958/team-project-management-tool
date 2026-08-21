import axios from "../api/axios"

import type { AppNotification } from "../types"

export const getUnreadNotificationa=async():Promise<AppNotification[]> =>{
    const res=await axios.get('/notifications/unread');
    return res.data.data;
}

export const markNotificationAsRead = async (notificationId:string):Promise<AppNotification>=>{
    const res=await axios.patch(`/notification/${notificationId}/read`);
    return res.data.data;
}

