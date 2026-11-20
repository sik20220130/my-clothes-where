// 分类 / 场景 / 季节 / 颜色 常量
const CATEGORY_LIST = [
  { key: 'all', label: '全部' },
  { key: 'top', label: '上衣' },
  { key: 'bottom', label: '裤装' },
  { key: 'dress', label: '裙装' },
  { key: 'outer', label: '外套' },
  { key: 'shoes', label: '鞋履' },
  { key: 'bag', label: '包袋' },
  { key: 'accessory', label: '配饰' }
];

const CATEGORY_META = {
  top: { label: '上衣', icon: 'top' },
  bottom: { label: '裤装', icon: 'bottom' },
  dress: { label: '裙装', icon: 'dress' },
  outer: { label: '外套', icon: 'outer' },
  shoes: { label: '鞋履', icon: 'shoes' },
  bag: { label: '包袋', icon: 'bag' },
  accessory: { label: '配饰', icon: 'accessory' }
};

const SCENE_META = {
  work: { label: '通勤' },
  date: { label: '约会' },
  casual: { label: '休闲' },
  travel: { label: '度假' },
  sport: { label: '运动' }
};

const SCENE_LIST = [
  { key: 'all', label: '全部' },
  { key: 'work', label: '通勤' },
  { key: 'date', label: '约会' },
  { key: 'casual', label: '休闲' },
  { key: 'travel', label: '度假' },
  { key: 'sport', label: '运动' }
];

const SEASON_LIST = ['春', '夏', '秋', '冬'];

const COLOR_OPTIONS = [
  { name: '奶油白', hex: '#f5f1e8' },
  { name: '魔法黑', hex: '#2b2440' },
  { name: '雾霾蓝', hex: '#8fa9c9' },
  { name: '樱花粉', hex: '#f4a7b9' },
  { name: '燕麦色', hex: '#d9c8a9' },
  { name: '牛油果绿', hex: '#9db68c' }
];

module.exports = {
  CATEGORY_LIST,
  CATEGORY_META,
  SCENE_META,
  SCENE_LIST,
  SEASON_LIST,
  COLOR_OPTIONS
};
