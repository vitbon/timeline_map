import { Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';
import './mapview.css';

export function addMarker(marker, fillColor = '#f20') {
  const [pos] = marker.coords;
  const SCALE_MULTI = 15;
  const svgContent = `
      <span style="font-size: 12px; font-weight: 700; margin-left: -16px;
        text-shadow: 0px 0px 2px black, 1px 1px 1px black"
      >
        ${marker.time}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        fill="${fillColor}"
      >
        <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
      </svg>
  `;
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  markerElement.innerHTML = svgContent;
  markerElement.style.width = `${SCALE_MULTI * 2}px`;
  markerElement.style.height = `${SCALE_MULTI * 2}px`;

  const markerOverlay = new Overlay({
    position: fromLonLat([pos[1], pos[0]]),
    positioning: 'bottom-center',
    element: markerElement,
    stopEvent: false,
  });
  return markerOverlay;
}
