import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addWebsocketData } from '../../features/websocket/websocketSlice';
import './websocket.css';

const WS_STATUS = ['🟡', '🟢', '🔴'];
const WS_STATUS_CLR = ['orange', 'green', 'red'];
const TTL = 120;
const LAT_1KM_FROM_DEG = 0.00841;
const LON_1KM_FROM_DEG = 0.01426;
const LON_KM_MAX = 60;
const LAT_KM_MAX = 40;
const INTERVAL = 30 * 1000;
const base_lon = 36.5878326600486;
const base_lat = 50.591351115388164;
let startDate = new Date();
const seconds = new Date(startDate).getSeconds() > 30 ? 30 : 0;
startDate = new Date(startDate).setSeconds(seconds);
startDate = new Date(startDate).setMilliseconds(0);

const Websocket = () => {
  const [wsStatus, setWsStatus] = useState(0);
  const [lastMessage, setLastMessage] = useState('');
  const tmzd = useRef(new Date().getTimezoneOffset() * 60000);
  const [lastTmst, setLastTmst] = useState(
    (Date.now() - tmzd.current - TTL * 60000) / 1000
  );
  const dispatch = useDispatch();

  useEffect(() => {
    for (let i = 0; i < data.length; i++) dispatch(addWebsocketData(data[i]));
    init_ws();
  }, []);

  const MS_INT = 30000;
  const DATE_NUMBERS = 0;
  const urlParams = new URLSearchParams(document.location.search);
  const timeMSec = Math.abs(parseInt(urlParams.get('t')) || MS_INT);
  const dateNumbers = Math.abs(parseInt(urlParams.get('d')) || DATE_NUMBERS);
  // const WSS_URL = `wss://sanya.408dev.com/alrts/${timeMSec}`;
  const WSS_URL = `ws://localhost:8081/alrts/${timeMSec}`;
  let websocket = null;

  const data = Array.from({ length: dateNumbers }, (value, index) => {
    const currentDate = startDate - (index + 1) * INTERVAL;
    let coords = [];
    coords.unshift([
      base_lat + LAT_1KM_FROM_DEG * LAT_KM_MAX * (Math.random() - 0.5),
      base_lon + LON_1KM_FROM_DEG * LON_KM_MAX * (Math.random() - 0.5),
    ]);

    return {
      timestamp: Math.floor(currentDate / 1000),
      date: new Date(currentDate).toISOString().split('T')[0],
      time: new Date(currentDate).toISOString().split('T')[1].split('.')[0],
      frequency: Math.random() * 100 + 350,
      coords,
    };
  }).reverse();

  function init_ws() {
    if (websocket) websocket = null;
    setWsStatus(0);
    websocket = new WebSocket(WSS_URL);
    websocket.onmessage = messageIn;
    websocket.onopen = () => {
      setWsStatus(1);
      setLastTmst((Date.now() - tmzd.current - TTL * 60000) / 1000);
      websocket.send(lastTmst.toString());
    };
    websocket.onclose = () => {
      setWsStatus(2);
      setTimeout(init_ws, 1000);
    };
  }

  function messageIn(msg) {
    let now = new Date().toLocaleString('uk-UA', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    setLastMessage(now);
    dispatch(addWebsocketData(JSON.parse(msg.data)));
  }

  return (
    <div className="controls" style={{ display: 'none' }}>
      <p id="std" style={{ color: WS_STATUS_CLR[wsStatus] }}>
        <small>
          <span id="sti">{wsStatus ? WS_STATUS[wsStatus] : '?'} </span>
          Last Message: <span id="lmd">{lastMessage ? lastMessage : '?'}</span>
        </small>
      </p>
    </div>
  );
};

export default Websocket;
