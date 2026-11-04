import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { BookedDateRange } from '../../data/rent/rentOrderDetailData';
import { findEarliestAvailableRentalRange } from '../../data/rent/rentOrderDetailData';

export interface RentalCalendarPickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (startDate: string, endDate: string, days: number) => void;
  bookedRanges?: BookedDateRange[];
}

const formatYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseYMD = (ymd: string): Date => {
  if (!ymd) return new Date();
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const formatDisplayDateVN = (ymd: string): { dayMonth: string; weekday: string } => {
  if (!ymd) return { dayMonth: '--/--', weekday: 'Chưa chọn' };
  const d = parseYMD(ymd);
  if (isNaN(d.getTime())) return { dayMonth: '--/--', weekday: 'Chưa chọn' };

  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return {
    dayMonth: `${day}/${month}/${year}`,
    weekday: weekdays[d.getDay()],
  };
};

export const RentalCalendarPicker: React.FC<RentalCalendarPickerProps> = ({
  startDate,
  endDate,
  onChange,
  bookedRanges = [],
}) => {
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Month navigation view
  const initialDate = startDate ? parseYMD(startDate) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-indexed

  // Tomorrow is the minimum selectable date
  const minSelectableDateStr = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatYMD(tomorrow);
  }, []);

  // Map booked ranges into a lookup set
  const bookedDatesMap = useMemo(() => {
    const map = new Map<string, string>();
    bookedRanges.forEach((range) => {
      if (!range.startDate || !range.endDate) return;
      const cur = parseYMD(range.startDate);
      const end = parseYMD(range.endDate);
      while (cur <= end) {
        const ymd = formatYMD(cur);
        map.set(ymd, range.note || range.customerName || 'Đã có khách đặt thuê trước');
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [bookedRanges]);

  const hasBookedConflict = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    const cur = parseYMD(start <= end ? start : end);
    const stop = parseYMD(start <= end ? end : start);
    while (cur <= stop) {
      if (bookedDatesMap.has(formatYMD(cur))) {
        return true;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  };

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const s = parseYMD(start);
    const e = parseYMD(end);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  // Sync internal state when external props change
  useEffect(() => {
    if (startDate) setTempStart(startDate);
    if (endDate) setTempEnd(endDate);
  }, [startDate, endDate]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday as 0: (getDay() + 6) % 7
    const startingDayIndex = (firstDay.getDay() + 6) % 7;

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isBooked: boolean;
      bookedNote?: string;
    }> = [];

    // Preceding days from previous month
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(viewYear, viewMonth - 1, prevMonthLastDay - i);
      const str = formatYMD(prevDate);
      days.push({
        dateStr: str,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isPast: str < minSelectableDateStr,
        isBooked: bookedDatesMap.has(str),
        bookedNote: bookedDatesMap.get(str),
      });
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(viewYear, viewMonth, i);
      const str = formatYMD(curDate);
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: true,
        isPast: str < minSelectableDateStr,
        isBooked: bookedDatesMap.has(str),
        bookedNote: bookedDatesMap.get(str),
      });
    }

    // Trailing days to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(viewYear, viewMonth + 1, i);
      const str = formatYMD(nextDate);
      days.push({
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: false,
        isPast: str < minSelectableDateStr,
        isBooked: bookedDatesMap.has(str),
        bookedNote: bookedDatesMap.get(str),
      });
    }

    return days;
  }, [viewYear, viewMonth, minSelectableDateStr, bookedDatesMap]);

  const handleDayClick = (dateStr: string, isPast: boolean, isBooked: boolean) => {
    if (isPast || dateStr < minSelectableDateStr) {
      setErrorMessage('Lịch thuê cần cách thời gian hiện tại ít nhất 1 ngày (từ ngày mai trở đi)!');
      return;
    }
    if (isBooked || bookedDatesMap.has(dateStr)) {
      setErrorMessage(`Thiết bị đã được thuê vào ngày ${formatDisplayDateVN(dateStr).dayMonth}. Vui lòng chọn ngày còn trống!`);
      return;
    }

    setErrorMessage(null);

    if (selectionStep === 'start' || !tempStart || (tempStart && tempEnd) || bookedDatesMap.has(tempStart) || tempStart < minSelectableDateStr) {
      setTempStart(dateStr);
      setTempEnd('');
      setSelectionStep('end');
    } else {
      if (dateStr < tempStart) {
        setTempStart(dateStr);
        setTempEnd('');
      } else {
        if (hasBookedConflict(tempStart, dateStr)) {
          setErrorMessage('Khoảng thời gian bạn chọn có ngày thiết bị đã được khách khác đặt thuê. Vui lòng chọn lại khoảng ngày trống liên tục!');
          return;
        }

        setTempEnd(dateStr);
        const days = calculateDays(tempStart, dateStr);
        onChange(tempStart, dateStr, days);
        setSelectionStep('start');
      }
    }
  };

  const handlePresetSelect = (presetDays: number) => {
    setErrorMessage(null);
    let start = tempStart;
    if (!start || start < minSelectableDateStr || bookedDatesMap.has(start)) {
      const earliest = findEarliestAvailableRentalRange(bookedRanges, presetDays, minSelectableDateStr);
      start = earliest.startDate;
    }

    const sDate = parseYMD(start);
    const eDate = new Date(sDate);
    eDate.setDate(eDate.getDate() + presetDays);
    const newEnd = formatYMD(eDate);

    if (hasBookedConflict(start, newEnd)) {
      const earliest = findEarliestAvailableRentalRange(bookedRanges, presetDays, minSelectableDateStr);
      setTempStart(earliest.startDate);
      setTempEnd(earliest.endDate);
      onChange(earliest.startDate, earliest.endDate, presetDays);
    } else {
      setTempStart(start);
      setTempEnd(newEnd);
      onChange(start, newEnd, presetDays);
    }
  };

  const startInfo = formatDisplayDateVN(tempStart || startDate);
  const endInfo = formatDisplayDateVN(tempEnd || endDate);
  const totalDays = calculateDays(tempStart || startDate, tempEnd || endDate);
  const isStartBooked = Boolean(tempStart && bookedDatesMap.has(tempStart));

  return (
    <View style={styles.container}>
      {/* ── Duration Quick Selector Pills ── */}
      <View style={styles.presetsRow}>
        <Text style={styles.presetLabel}>Chọn nhanh số ngày:</Text>
        <View style={styles.presetButtons}>
          {[3, 5, 7, 14].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.presetPill, totalDays === d && styles.presetPillActive]}
              onPress={() => handlePresetSelect(d)}
            >
              <Text style={[styles.presetPillText, totalDays === d && styles.presetPillTextActive]}>
                {d} ngày
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Trigger Bar: Two Interactive Cards ── */}
      <View style={styles.triggerRow}>
        <TouchableOpacity
          style={[
            styles.triggerCard,
            selectionStep === 'start' && styles.triggerCardActive,
            isStartBooked && styles.triggerCardBooked,
          ]}
          onPress={() => setSelectionStep('start')}
          activeOpacity={0.8}
        >
          <View style={styles.triggerCardHeader}>
            <Text style={styles.triggerCardTitle}>NGÀY NHẬN MÁY</Text>
            <Feather name="calendar" size={14} color="#1C1A18" />
          </View>
          <Text style={[styles.triggerDateText, isStartBooked && styles.triggerDateTextBooked]}>
            {startInfo.dayMonth}
          </Text>
          <Text style={styles.triggerWeekdayText}>{startInfo.weekday}</Text>
          {isStartBooked && (
            <View style={styles.bookedBadge}>
              <Text style={styles.bookedBadgeText}>ĐÃ ĐẶT</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.triggerCard, selectionStep === 'end' && styles.triggerCardActive]}
          onPress={() => setSelectionStep('end')}
          activeOpacity={0.8}
        >
          <View style={styles.triggerCardHeader}>
            <Text style={styles.triggerCardTitle}>NGÀY HOÀN TRẢ</Text>
            <Feather name="check-circle" size={14} color="#1C1A18" />
          </View>
          <Text style={styles.triggerDateText}>{endInfo.dayMonth}</Text>
          <Text style={styles.triggerWeekdayText}>
            {endInfo.weekday} ({totalDays} ngày)
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Calendar Box ── */}
      <View style={styles.calendarCard}>
        {/* Month Navigation */}
        <View style={styles.monthNavRow}>
          <View style={styles.monthTitleWrapper}>
            <Text style={styles.monthTitle}>
              Tháng {viewMonth + 1}, {viewYear}
            </Text>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>{totalDays} ngày thuê</Text>
            </View>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Feather name="chevron-left" size={18} color="#1C1A18" />
            </TouchableOpacity>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Feather name="chevron-right" size={18} color="#1C1A18" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Step Guide / Alert Banner */}
        <View style={[styles.guideBanner, isStartBooked && styles.guideBannerError]}>
          <Feather
            name={isStartBooked ? 'alert-triangle' : 'info'}
            size={14}
            color={isStartBooked ? '#DC2626' : '#D97706'}
          />
          <Text style={[styles.guideBannerText, isStartBooked && styles.guideBannerTextError]}>
            {isStartBooked
              ? 'Ngày nhận đã có người thuê. Vui lòng bấm chọn ngày khác!'
              : selectionStep === 'start' || !tempStart
              ? 'Bước 1: Chọn ngày nhận (từ ngày mai trở đi)'
              : 'Bước 2: Chọn ngày hoàn trả'}
          </Text>
        </View>

        {/* Error message */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Weekday headers */}
        <View style={styles.weekdaysRow}>
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, idx) => (
            <Text
              key={w}
              style={[styles.weekdayCol, idx === 6 && styles.sundayCol]}
            >
              {w}
            </Text>
          ))}
        </View>

        {/* Calendar Day Grid */}
        <View style={styles.gridContainer}>
          {calendarDays.map((cell) => {
            const isStart = cell.dateStr === tempStart;
            const isEnd = cell.dateStr === tempEnd;
            const isInRange =
              tempStart &&
              tempEnd &&
              cell.dateStr > tempStart &&
              cell.dateStr < tempEnd;

            let cellBg = 'transparent';
            let textColor = '#1C1A18';
            let isBold = false;
            let isStrikethrough = false;
            let borderColor = 'transparent';

            if (cell.isPast) {
              textColor = '#CBD5E1';
            } else if (cell.isBooked) {
              cellBg = '#FEE2E2';
              textColor = '#DC2626';
              borderColor = '#FCA5A5';
              isBold = true;
              isStrikethrough = true;
            } else if (isStart || isEnd) {
              cellBg = '#1C1A18';
              textColor = '#FFFFFF';
              isBold = true;
            } else if (isInRange) {
              cellBg = '#EAE5DC';
              textColor = '#1C1A18';
              isBold = true;
            } else if (!cell.isCurrentMonth) {
              textColor = '#94A3B8';
            }

            return (
              <TouchableOpacity
                key={cell.dateStr}
                disabled={cell.isPast || cell.isBooked}
                onPress={() => handleDayClick(cell.dateStr, cell.isPast, cell.isBooked)}
                style={[
                  styles.dayCell,
                  { backgroundColor: cellBg, borderColor },
                  cell.isBooked && styles.dayCellBooked,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    { color: textColor },
                    isBold && { fontWeight: '700' },
                    isStrikethrough && { textDecorationLine: 'line-through' },
                  ]}
                >
                  {cell.dayNumber}
                </Text>
                {cell.isBooked && (
                  <Text style={styles.dayBookedLabel}>ĐÃ ĐẶT</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
            <Text style={[styles.legendText, { color: '#DC2626', fontWeight: '700' }]}>
              In đỏ: Đã có khách thuê
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1C1A18' }]} />
            <Text style={styles.legendText}>Đang chọn</Text>
          </View>
        </View>
      </View>

      {/* ── Booked Date Ranges List (if any) ── */}
      {bookedRanges && bookedRanges.length > 0 && (
        <View style={styles.bookedListCard}>
          <View style={styles.bookedListHeader}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#DC2626" />
            <Text style={styles.bookedListTitle}>Lịch đã có khách đặt thuê trước</Text>
          </View>
          <Text style={styles.bookedListSubtitle}>
            Các khoảng thời gian dưới đây đang bận giao dịch hoặc đã bàn giao máy:
          </Text>
          {bookedRanges.map((range, idx) => (
            <View key={idx} style={styles.bookedItemRow}>
              <View style={styles.bookedBadgeMini}>
                <Text style={styles.bookedBadgeMiniText}>ĐÃ KHÓA</Text>
              </View>
              <Text style={styles.bookedItemDates}>
                {range.startDate} → {range.endDate}
              </Text>
              <Text style={styles.bookedItemNote} numberOfLines={1}>
                {range.note || range.customerName || 'Đã có khách thuê'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  presetsRow: {
    marginBottom: 10,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78736A',
    marginBottom: 6,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  presetPillActive: {
    backgroundColor: '#1C1A18',
    borderColor: '#1C1A18',
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1A18',
  },
  presetPillTextActive: {
    color: '#FFFFFF',
  },
  triggerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  triggerCard: {
    flex: 1,
    backgroundColor: '#F8F6F0',
    borderWidth: 1.5,
    borderColor: '#E7E2DA',
    borderRadius: 14,
    padding: 12,
    position: 'relative',
  },
  triggerCardActive: {
    borderColor: '#1C1A18',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerCardBooked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  triggerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  triggerCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#78736A',
    letterSpacing: 0.5,
  },
  triggerDateText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1A18',
    fontFamily: 'monospace',
  },
  triggerDateTextBooked: {
    color: '#DC2626',
    textDecorationLine: 'line-through',
  },
  triggerWeekdayText: {
    fontSize: 11,
    color: '#78736A',
    marginTop: 2,
  },
  bookedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 16,
    padding: 14,
  },
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F0EA',
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1A18',
  },
  daysBadge: {
    backgroundColor: '#F4F0EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  daysBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#78736A',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F4F0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FBF9F5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  guideBannerError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  guideBannerText: {
    fontSize: 11,
    color: '#78736A',
    flex: 1,
  },
  guideBannerTextError: {
    color: '#DC2626',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    flex: 1,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 6,
  },
  weekdayCol: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#78736A',
  },
  sundayCol: {
    color: '#D97706',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 1,
    borderWidth: 1,
  },
  dayCellBooked: {
    borderWidth: 1,
  },
  dayCellText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayBookedLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#DC2626',
    lineHeight: 8,
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F4F0EA',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#78736A',
  },
  bookedListCard: {
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  bookedListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bookedListTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  bookedListSubtitle: {
    fontSize: 11,
    color: '#7F1D1D',
    marginBottom: 8,
  },
  bookedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 4,
    gap: 6,
  },
  bookedBadgeMini: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookedBadgeMiniText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },
  bookedItemDates: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1A18',
    fontFamily: 'monospace',
  },
  bookedItemNote: {
    fontSize: 10,
    color: '#78736A',
    flex: 1,
  },
});
