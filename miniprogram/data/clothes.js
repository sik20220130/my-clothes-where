// 演示数据：衣橱单品
// 说明：不记录穿着次数；favorite 表示「喜欢」，喜欢单品在列表中优先展示
const clothes = [
  {
    id: 'c-1001',
    name: '云朵针织开衫',
    category: 'top',
    color: '奶油白',
    colorHex: '#f5f1e8',
    seasons: ['春', '秋'],
    image: '/assets/demo/item-1.png',
    brand: 'CHUU',
    favorite: true,
    addedAt: '2026-11-02',
    wardrobeId: 'w-1001',
    note: '柔软亲肤，空调房必备'
  },
  {
    id: 'c-1002',
    name: '法式碎花衬衫',
    category: 'top',
    color: '雾霾蓝',
    colorHex: '#8fa9c9',
    seasons: ['春', '夏'],
    image: '/assets/demo/item-2.png',
    brand: 'Simple Retro',
    favorite: false,
    addedAt: '2026-11-05',
    wardrobeId: 'w-1001'
  },
  {
    id: 'c-1003',
    name: '柔软高领打底衫',
    category: 'top',
    color: '魔法黑',
    colorHex: '#2b2440',
    seasons: ['秋', '冬'],
    image: '/assets/demo/item-3.png',
    brand: 'UNIQLO',
    favorite: false,
    addedAt: '2026-10-18',
    wardrobeId: 'w-1002'
  },
  {
    id: 'c-1004',
    name: '泡泡袖雪纺上衣',
    category: 'top',
    color: '樱花粉',
    colorHex: '#f4a7b9',
    seasons: ['夏'],
    image: '/assets/demo/item-4.png',
    brand: 'ZARA',
    favorite: false,
    addedAt: '2026-11-11',
    wardrobeId: 'w-1003'
  },
  {
    id: 'c-1005',
    name: '直筒复古牛仔裤',
    category: 'bottom',
    color: '牛仔蓝',
    colorHex: '#6b8cae',
    seasons: ['春', '秋', '冬'],
    image: '/assets/demo/item-5.png',
    brand: 'Levi’s',
    favorite: true,
    addedAt: '2026-10-09',
    wardrobeId: 'w-1001'
  },
  {
    id: 'c-1006',
    name: '高腰百褶半裙',
    category: 'bottom',
    color: '燕麦色',
    colorHex: '#d9c8a9',
    seasons: ['春', '秋'],
    image: '/assets/demo/item-6.png',
    brand: 'MOUSSY',
    favorite: false,
    addedAt: '2026-11-08',
    wardrobeId: 'w-1002'
  },
  {
    id: 'c-1007',
    name: '丝绒吊带长裙',
    category: 'dress',
    color: '魔法紫',
    colorHex: '#7b5bd6',
    seasons: ['夏'],
    image: '/assets/demo/item-1.png',
    brand: 'Réalisation',
    favorite: true,
    addedAt: '2026-11-14',
    wardrobeId: 'w-1001',
    note: '约会战袍，搭配金色耳饰'
  },
  {
    id: 'c-1008',
    name: '焦糖格纹连衣裙',
    category: 'dress',
    color: '焦糖色',
    colorHex: '#b48048',
    seasons: ['秋'],
    image: '/assets/demo/item-2.png',
    brand: 'BURBERRY',
    favorite: false,
    addedAt: '2026-10-27',
    wardrobeId: 'w-1002'
  },
  {
    id: 'c-1009',
    name: '小香风短外套',
    category: 'outer',
    color: '奶油白',
    colorHex: '#f5f1e8',
    seasons: ['春', '秋'],
    image: '/assets/demo/item-3.png',
    brand: 'CHANEL',
    favorite: false,
    addedAt: '2026-10-05',
    wardrobeId: 'w-1001'
  },
  {
    id: 'c-1010',
    name: '复古机车皮夹克',
    category: 'outer',
    color: '魔法黑',
    colorHex: '#2b2440',
    seasons: ['秋', '冬'],
    image: '/assets/demo/item-4.png',
    brand: 'ACNE',
    favorite: false,
    addedAt: '2026-11-01',
    wardrobeId: 'w-1001'
  },
  {
    id: 'c-1011',
    name: '白色厚底小白鞋',
    category: 'shoes',
    color: '奶油白',
    colorHex: '#f5f1e8',
    seasons: ['春', '夏', '秋', '冬'],
    image: '/assets/demo/item-5.png',
    brand: 'PUMA',
    favorite: true,
    addedAt: '2026-09-12',
    wardrobeId: 'w-1003'
  },
  {
    id: 'c-1012',
    name: '腋下法棍包',
    category: 'bag',
    color: '焦糖色',
    colorHex: '#b48048',
    seasons: ['春', '夏', '秋', '冬'],
    image: '/assets/demo/item-6.png',
    brand: 'BY FAR',
    favorite: false,
    addedAt: '2026-10-21',
    wardrobeId: 'w-1002'
  },
  {
    id: 'c-1013',
    name: '珍珠贝壳发夹',
    category: 'accessory',
    color: '珍珠白',
    colorHex: '#efe6dd',
    seasons: ['春', '夏', '秋', '冬'],
    image: '/assets/demo/item-1.png',
    brand: 'Simone Rocha',
    favorite: false,
    addedAt: '2026-11-16',
    wardrobeId: 'w-1001'
  }
];

module.exports = {
  clothes
};
