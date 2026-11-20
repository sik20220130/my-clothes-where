// 演示数据：衣橱柜
const wardrobes = [
  {
    id: 'w-1001',
    name: '主卧大衣橱',
    cover: '/assets/wardrobe/default-cover.png',
    location: '主卧靠窗',
    isShared: true
  },
  {
    id: 'w-1002',
    name: '次卧衣橱',
    cover: '/assets/wardrobe/default-cover.png',
    location: '次卧',
    isShared: false
  },
  {
    id: 'w-1003',
    name: '玄关衣帽架',
    cover: '/assets/wardrobe/default-cover.png',
    location: '入户玄关',
    isShared: false
  }
];

module.exports = {
  wardrobes
};
