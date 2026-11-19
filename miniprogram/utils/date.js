// 轻量日期工具（不依赖任何第三方库）
const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

// YYYY-MM-DD
function formatYMD(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// M月D日
function formatMD(date) {
  const d = date || new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// 周几
function weekLabel(date) {
  const d = date || new Date();
  return WEEK_LABELS[d.getDay()];
}

// YYYY-MM（用于本月新增统计）
function monthPrefix(date) {
  const d = date || new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function greeting(date) {
  const hour = (date || new Date()).getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

module.exports = {
  formatYMD,
  formatMD,
  weekLabel,
  monthPrefix,
  greeting
};
