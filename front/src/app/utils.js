// import { getMap } from '../components/MapView/mapSingleton';
import { Fill, Stroke, Text, Style } from 'ol/style';
import { mapInstance } from '../components/MapView/index';

export const BOUNDARY = {
  country: { color: '#ffffffaa', width: 2 },
  state: { color: '#ffffffdd', width: 1, lineDash: [2, 4] },
  city: { color: '#eeeeeebb', width: 1, lineDash: [3, 6] },
};

export function vectorStyleNaming(feature) {
  function drawBoundary() {
    switch (feature.get('admin_level')) {
      case 2:
        return BOUNDARY.country;
      case 3:
      case 4:
      case 5:
      case 6:
        return BOUNDARY.state;
      default:
        return BOUNDARY.city;
    }
  }
  const zoom = mapInstance.getView().getZoom();
  const cityRank = feature.get('rank');
  let fontSize = '10px';

  switch (feature.get('layer')) {
    case 'place': // name of the cities
      if (cityRank >= 1 && cityRank <= 3) {
        fontSize = '16px';
      } else if (cityRank >= 4 && cityRank <= 6) {
        fontSize = '14px';
      } else if (cityRank >= 7 && cityRank <= 12) {
        fontSize = '12px';
      }
      return new Style({
        text: new Text({
          text: feature.get('name'),
          font: `${fontSize} Arial`,
          fill: new Fill({
            color: '#fff',
          }),
          stroke: new Stroke({
            color: '#000',
            width: 2,
          }),
        }),
      });
    case 'transportation': // Roads
      return new Style({
        stroke: new Stroke({
          color: '#ffff5577',
          width: 2,
        }),
      });
    case 'transportation_name': // Road name
      // const ref = feature.get("ref");
      return new Style({
        text: new Text({
          text: feature.get('name'),
          font: '13px Calibri,sans-serif',
          placement: 'line',
          textAlign: 'center',
          fill: new Fill({
            color: '#ffffee',
          }),
          stroke: new Stroke({
            color: '#481F01',
            width: 3,
          }),
        }),
      });
    case 'waterway': // River name
      return new Style({
        text: new Text({
          font: 'italic 12px Calibri,sans-serif',
          text: feature.get('name'),
          placement: 'line',
          textAlign: 'center',
          fill: new Fill({ color: '#ADF' }),
          stroke: new Stroke({ color: '#000', width: 1 }),
        }),
      });
    case 'aerodrome_label': // airport name
      return new Style({
        text: new Text({
          text: feature.get('name'),
          font: 'bold 12px Calibri,sans-serif',
          fill: new Fill({
            color: '#ccddff',
          }),
          stroke: new Stroke({
            color: '#000',
            width: 2,
          }),
        }),
      });
    case 'housenumber':
      if (zoom > 15.5) {
        const housenumber = feature.get('housenumber');
        return new Style({
          text: new Text({
            text: housenumber ? housenumber.toString() : '',
            font: 'bold 12px Arial',
            fill: new Fill({
              color: '#fff',
            }),
            stroke: new Stroke({
              color: '#000',
              width: 2,
            }),
          }),
        });
      }
      break;
    case 'boundary': // Administrative borders
      return new Style({
        stroke: new Stroke(drawBoundary()),
      });
    default:
      return null;
  }
}

export function getScaleInfo(scale) {
  switch (scale) {
    case 0:
      return {
        step: 1,
        interval: 30,
        marginBottom: '24px',
        ruler: [4],
        multiplBigLine: 30,
      };
    case 1:
      return {
        step: 2,
        interval: 60,
        marginBottom: '0',
        ruler: [4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        multiplBigLine: 900,
      };
    case 2:
      return {
        step: 10,
        interval: 300,
        marginBottom: '9px',
        ruler: [4, 2, 2, 3, 2, 2],
        multiplBigLine: 1800,
      };
    case 3:
      return {
        step: 30,
        interval: 900,
        marginBottom: '11px',
        ruler: [4, 2, 3, 2],
        multiplBigLine: 3600,
      };
    case 4:
      return {
        step: 60,
        interval: 1800,
        marginBottom: '4px',
        ruler: [4, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2],
        multiplBigLine: 21600,
      };
    case 5:
      return {
        step: 120,
        interval: 3600,
        marginBottom: '10px',
        ruler: [4, 4, 4, 4, 4, 4],
        multiplBigLine: 21600,
      };
  }
}

export function localFromUTC(seconds) {
  const utcDate = new Date(seconds * 1000);
  return utcDate.toLocaleString('en-GB')
}
