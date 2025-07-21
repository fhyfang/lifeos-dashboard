// 日期辅助工具
import { differenceInDays, format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 计算剩余天数
export function calculateDaysRemaining(targetDays) {
    const today = new Date();
    const startDate = new Date('2024-01-01'); // 可以根据需要调整起始日期
    const targetDate = addDays(startDate, targetDays);
    return differenceInDays(targetDate, today);
}

// 格式化日期
export function formatDate(date, formatString = 'yyyy-MM-dd') {
    return format(new Date(date), formatString, { locale: zhCN });
}

// 获取本周开始和结束日期
export function getWeekRange() {
    const now = new Date();
    return {
        start: startOfWeek(now, { weekStartsOn: 1 }), // 周一开始
        end: endOfWeek(now, { weekStartsOn: 1 })
    };
}

// 计算两个日期之间的天数
export function daysBetween(date1, date2) {
    return Math.abs(differenceInDays(new Date(date1), new Date(date2)));
}

// 判断是否是今天
export function isToday(date) {
    const today = new Date();
    const compareDate = new Date(date);
    return today.toDateString() === compareDate.toDateString();
}

// 判断是否是本周
export function isThisWeek(date) {
    const { start, end } = getWeekRange();
    const compareDate = new Date(date);
    return compareDate >= start && compareDate <= end;
}

// 获取日期的中文星期
export function getWeekdayChinese(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[new Date(date).getDay()];
}
