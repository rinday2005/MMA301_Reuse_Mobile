import api from './api';

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

/**
 * Lấy danh sách thông báo của user (phân trang & lọc isRead)
 * GET /api/notifications
 */
export const getNotificationsApi = async (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}): Promise<NotificationItem[]> => {
  try {
    const res = await api.get('/notifications', { params });
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return data;
    if (data?.notifications && Array.isArray(data.notifications)) return data.notifications;
    return [];
  } catch (error) {
    console.warn('Could not fetch notifications:', error);
    return [];
  }
};

/**
 * Lấy số lượng thông báo chưa đọc
 * GET /api/notifications/unread-count
 */
export const getUnreadNotificationCountApi = async (): Promise<number> => {
  try {
    const res = await api.get('/notifications/unread-count');
    const data = res.data?.data || res.data;
    return typeof data?.unreadCount === 'number' ? data.unreadCount : Number(data) || 0;
  } catch (error) {
    console.warn('Could not fetch unread notification count:', error);
    return 0;
  }
};

/**
 * Đánh dấu một thông báo là đã đọc
 * PATCH /api/notifications/:id/read
 */
export const markNotificationAsReadApi = async (id: string): Promise<boolean> => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return true;
  } catch (error) {
    console.warn('Could not mark notification as read:', error);
    return false;
  }
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 * PATCH /api/notifications/read-all
 */
export const markAllNotificationsAsReadApi = async (): Promise<boolean> => {
  try {
    await api.patch('/notifications/read-all');
    return true;
  } catch (error) {
    console.warn('Could not mark all notifications as read:', error);
    return false;
  }
};

export default {
  getNotificationsApi,
  getUnreadNotificationCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
};
