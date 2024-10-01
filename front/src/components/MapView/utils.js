import { Fill, Stroke, Text, Style } from 'ol/style';
import { mapInstance } from './index';

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
