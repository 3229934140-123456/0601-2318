import * as echarts from 'echarts';

export const registerChinaMap = () => {
  const chinaGeoJson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: '北京市', adcode: '110000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.4, 39.9], [116.8, 39.9], [116.8, 40.2], [116.4, 40.2], [116.4, 39.9]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '天津市', adcode: '120000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[117.0, 39.0], [117.8, 39.0], [117.8, 39.4], [117.0, 39.4], [117.0, 39.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '河北省', adcode: '130000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[114.0, 36.0], [119.8, 36.0], [119.8, 42.6], [114.0, 42.6], [114.0, 36.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '山西省', adcode: '140000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[110.0, 34.5], [114.6, 34.5], [114.6, 40.8], [110.0, 40.8], [110.0, 34.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '内蒙古自治区', adcode: '150000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[97.0, 37.0], [126.0, 37.0], [126.0, 53.5], [97.0, 53.5], [97.0, 37.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '辽宁省', adcode: '210000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[119.0, 38.4], [125.9, 38.4], [125.9, 43.5], [119.0, 43.5], [119.0, 38.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '吉林省', adcode: '220000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[121.5, 40.9], [131.3, 40.9], [131.3, 46.3], [121.5, 46.3], [121.5, 40.9]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '黑龙江省', adcode: '230000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[121.5, 43.4], [135.1, 43.4], [135.1, 53.5], [121.5, 53.5], [121.5, 43.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '上海市', adcode: '310000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[120.9, 30.7], [122.1, 30.7], [122.1, 31.9], [120.9, 31.9], [120.9, 30.7]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '江苏省', adcode: '320000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.4, 30.8], [122.0, 30.8], [122.0, 35.2], [116.4, 35.2], [116.4, 30.8]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '浙江省', adcode: '330000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[118.0, 27.0], [122.6, 27.0], [122.6, 31.4], [118.0, 31.4], [118.0, 27.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '安徽省', adcode: '340000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[114.7, 29.4], [119.7, 29.4], [119.7, 34.7], [114.7, 34.7], [114.7, 29.4]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '福建省', adcode: '350000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.0, 23.5], [120.5, 23.5], [120.5, 28.3], [116.0, 28.3], [116.0, 23.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '江西省', adcode: '360000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[113.3, 24.3], [118.5, 24.3], [118.5, 30.2], [113.3, 30.2], [113.3, 24.3]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '山东省', adcode: '370000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[114.7, 34.2], [122.7, 34.2], [122.7, 38.4], [114.7, 38.4], [114.7, 34.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '河南省', adcode: '410000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[110.2, 31.2], [116.7, 31.2], [116.7, 36.4], [110.2, 36.4], [110.2, 31.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '湖北省', adcode: '420000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[108.2, 29.0], [116.2, 29.0], [116.2, 33.4], [108.2, 33.4], [108.2, 29.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '湖南省', adcode: '430000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[108.5, 24.6], [114.5, 24.6], [114.5, 30.2], [108.5, 30.2], [108.5, 24.6]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '广东省', adcode: '440000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[109.4, 20.2], [117.4, 20.2], [117.4, 25.6], [109.4, 25.6], [109.4, 20.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '广西壮族自治区', adcode: '450000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[104.2, 20.5], [112.2, 20.5], [112.2, 26.4], [104.2, 26.4], [104.2, 20.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '海南省', adcode: '460000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[108.5, 18.0], [111.2, 18.0], [111.2, 20.5], [108.5, 20.5], [108.5, 18.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '重庆市', adcode: '500000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[105.2, 28.0], [110.2, 28.0], [110.2, 32.3], [105.2, 32.3], [105.2, 28.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '四川省', adcode: '510000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[97.2, 26.0], [108.6, 26.0], [108.6, 34.4], [97.2, 34.4], [97.2, 26.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '贵州省', adcode: '520000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[103.4, 24.5], [109.6, 24.5], [109.6, 29.3], [103.4, 29.3], [103.4, 24.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '云南省', adcode: '530000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[97.3, 21.0], [106.3, 21.0], [106.3, 29.4], [97.3, 29.4], [97.3, 21.0]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '西藏自治区', adcode: '540000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[78.2, 26.7], [99.2, 26.7], [99.2, 36.6], [78.2, 36.6], [78.2, 26.7]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '陕西省', adcode: '610000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[105.3, 31.7], [111.3, 31.7], [111.3, 39.6], [105.3, 39.6], [105.3, 31.7]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '甘肃省', adcode: '620000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[92.1, 32.5], [108.8, 32.5], [108.8, 42.8], [92.1, 42.8], [92.1, 32.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '青海省', adcode: '630000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[89.2, 31.5], [103.1, 31.5], [103.1, 39.4], [89.2, 39.4], [89.2, 31.5]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '宁夏回族自治区', adcode: '640000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[104.2, 35.2], [107.8, 35.2], [107.8, 39.4], [104.2, 39.4], [104.2, 35.2]]],
        },
      },
      {
        type: 'Feature',
        properties: { name: '新疆维吾尔自治区', adcode: '650000' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[73.3, 34.2], [96.5, 34.2], [96.5, 49.3], [73.3, 49.3], [73.3, 34.2]]],
        },
      },
    ],
  };

  echarts.registerMap('china', chinaGeoJson as any);
};
