import api from './api';

export interface AvailabilityCalendarDay {
  date: string;
  availableUnits: number;
  totalUnits: number;
  isAvailable: boolean;
}

/**
 * Kiểm tra tính khả dụng của sản phẩm thuê trong khoảng ngày
 * GET /api/rent/availability/check
 */
export const checkProductAvailabilityApi = async (
  productId: string,
  startDate: string,
  endDate: string,
  quantity: number = 1
): Promise<{ isAvailable: boolean; remainingUnits?: number }> => {
  try {
    const res = await api.get('/rent/availability/check', {
      params: { productId, startDate, endDate, quantity },
    });
    return res.data?.data || res.data || { isAvailable: false };
  } catch (error) {
    console.warn('Could not check product availability:', error);
    return { isAvailable: true };
  }
};

/**
 * Lấy lịch tình trạng khả dụng theo tháng
 * GET /api/rent/availability/calendar
 */
export const getMonthlyAvailabilityCalendarApi = async (
  productId: string,
  month: number,
  year: number
): Promise<AvailabilityCalendarDay[]> => {
  try {
    const res = await api.get('/rent/availability/calendar', {
      params: { productId, month, year },
    });
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Could not fetch availability calendar:', error);
    return [];
  }
};

export default {
  checkProductAvailabilityApi,
  getMonthlyAvailabilityCalendarApi,
};
