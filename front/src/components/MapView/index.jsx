import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile.js';
import { VectorTile as VectorTileLayer } from 'ol/layer';
import { ScaleLine, defaults as defaultControls } from 'ol/control.js';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT.js';
import { XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { vectorStyleNaming } from '../../app/utils';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { addMarker } from './AddMarker.js';
import 'ol/ol.css';
import './mapview.css';

export let mapInstance = null;
const VECTOR_SERVER = 'http://localhost:8080';

function MapView() {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const markers = useRef({});
  const [map, setMap] = useState(null);
  const storeWebsocket = useSelector(state => state.websocket);
  const storeStatus = useSelector(state => state.status);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = new Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: `http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}`,
            // url: `${RASTER_SERVER}/{z}/{x}/{y}.jpg`,
            crossOrigin: '*',
          }),
        }),
        new VectorTileLayer({
          source: new VectorTileSource({
            format: new MVT(),
            url: `${VECTOR_SERVER}/data/v3/{z}/{x}/{y}.pbf`,
            // styleUrl: `${VECTOR_SERVER}/styles/basic-preview/style.json`,
            crossOrigin: '*',
          }),
          style: vectorStyleNaming,
        }),
      ],
      view: new View({
        center: fromLonLat([36.5878326600486, 50.591351115388164]),
        zoom: 10,
      }),
      controls: defaultControls().extend([
        new ScaleLine({
          units: 'metric',
          // bar: true,
          steps: 4,
          text: true,
          minWidth: 60,
          maxWidth: 120,
        }),
      ]),
    });
    map.setTarget(mapRef.current);
    setMap(map);
    mapInstance = map;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
    });
    map.addLayer(vectorLayer);

    return () => {
      map.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (storeStatus.isLive) {
      deleteAllMarkers();
      for (let i = 0; i < 1; i++) {
        const element = storeWebsocket[i];
        if (element) {
          showMarker(element);
        }
      }
    }
  }, [storeStatus.isLive, storeWebsocket]);

  useEffect(() => {
    deleteAllMarkers();
    const max = Math.max(storeStatus.rangeStart, storeStatus.rangeEnd);
    const min = Math.min(storeStatus.rangeStart, storeStatus.rangeEnd);
    const indexMax = storeWebsocket.findIndex(item => item.timestamp === max);
    const indexMin = storeWebsocket.findIndex(item => item.timestamp === min);
    for (let i = indexMax; i < indexMin; i++) {
      const element = storeWebsocket.at(i);
      if (element?.timestamp < min) break;
      showMarker(element);
    }
  }, [storeStatus.rangeStart, storeStatus.rangeEnd]);

  function deleteAllMarkers() {
    for (let key in markers.current) {
      markers.current[key].marker.setPosition(undefined);
      delete markers.current[key];
    }
  }

  function showMarker(element) {
    const svg = addMarker(element);
    mapInstance.addOverlay(svg);
    markers.current[element.timestamp] = {
      coords: element.coords,
      marker: svg,
    };
  }

  return <div ref={mapRef} id="map" />;
}

export default MapView;
