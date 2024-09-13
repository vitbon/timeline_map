import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  changeStatusLive,
  setStatusLiveOff,
  setStatusSelectionOn,
  setStatusSelectionOff,
  setStatusRangeStart,
  setStatusRangeEnd,
  statusRangeClear,
} from '../../features/status/statusSlice';
import { getScaleInfo } from '../../app/utils';
import './timeline.css';

const PANEL_WIDTH = 56;
const LIVE = 'LIVE';
const SCALE_MIN = 0;
const SCALE_MAX = 5;

function Timeline() {
  const [isPanelFull, setIsPanelFull] = useState(true);
  const [scaleFactor, setScaleFactor] = useState(0);
  const [elementHovered, setElementHovered] = useState(null);
  const scaleInfo = useRef(getScaleInfo(scaleFactor));
  const rangeSelect = useRef({});
  const storeWebsocket = useSelector(state => state.websocket);
  const storeStatus = useSelector(state => state.status);
  const dispatch = useDispatch();

  useEffect(() => {
    rangeSelect.current.min = Math.min(
      storeStatus.rangeStart,
      storeStatus.rangeEnd
    );
    rangeSelect.current.max = Math.max(
      storeStatus.rangeStart,
      storeStatus.rangeEnd
    );
  }, [storeStatus.rangeStart, storeStatus.rangeEnd]);

  const showScaler = () => {
    const TL_LINES_TIME = 'tl-lines-time';
    const TL_LINES_HR = 'tl-lines-hr';
    const TL_LINES_HR__ACTIVE = 'tl-lines-hr_active';
    const TL_LINES_SPAN_HR = 'tl-lines-span-hr';
    const TL_LINES_SPAN_HR__ACTIVE = 'tl-lines-span-hr_active';
    let layout = [];
    let rulerCounter = 0;

    const showTime = index => {
      if (rulerCounter) return '';
      return scaleFactor
        ? storeWebsocket[index]?.time.slice(0, -3) // without seconds
        : storeWebsocket[index]?.time; // with seconds
    };

    const getClassesTime = index => {
      let classes = TL_LINES_TIME;
      if (!rulerCounter && elementHovered === index)
        classes += ` ${TL_LINES_TIME}_hover`;
      if (storeStatus.isLive && index === 0)
        classes += ` active-bg ${TL_LINES_TIME}_hover `;
      if (
        !storeStatus.isLive &&
        rangeSelect.current.max &&
        rangeSelect.current.min <= index &&
        rangeSelect.current.max >= index
      ) {
        classes += ` active-bg ${TL_LINES_TIME}_hover `;
      }
      return classes;
    };

    const getClassesSpan = (index, secondRow = false) => {
      let classes = TL_LINES_SPAN_HR;
      if (storeStatus.isLive) {
        if (index === 0 && (secondRow || isPanelFull))
          return classes + ` active-bg-transp`;
        if (index === 1 && !secondRow) return classes + ` active-bg-transp`;
      }
      if (!storeStatus.isLive && rangeSelect.current.max) {
        if (
          (rangeSelect.current.min <= index &&
            rangeSelect.current.max >= index) ||
          (!secondRow &&
            rangeSelect.current.min <= index &&
            rangeSelect.current.max + 1 >= index)
        ) {
          classes += ` active-bg-transp`;
        }
      }
      return classes;
    };

    const getClassesSpanHr = index => {
      let classes = TL_LINES_HR;
      if (storeStatus.isLive && (index === 0 || index === 1))
        classes = `${TL_LINES_HR__ACTIVE}`;
      if (elementHovered === index) classes += ` ${TL_LINES_HR}_hover`;
      if (
        !storeStatus.isLive &&
        rangeSelect.current.max &&
        rangeSelect.current.min <= index &&
        rangeSelect.current.max + 1 >= index
      ) {
        classes = ` ${TL_LINES_HR__ACTIVE}`;
      }
      return classes;
    };

    for (let i = 0; i < storeWebsocket.length; i++) {
      const index = i * scaleInfo.current.step;
      if (index >= storeWebsocket.length) break;

      layout.push(
        <div
          onMouseDown={e => handleOnMouseDown(e, index)}
          onMouseMove={e => handleOnMouseMove(e, index)}
          onMouseUp={e => handleOnMouseUp(e, index)}
          key={
            storeWebsocket[index]?.timestamp + storeWebsocket[index]?.frequency
          }
        >
          <div
            className="tl-lines-wrapper"
            onMouseOver={() => setElementHovered(index)}
            onMouseOut={() => setElementHovered(null)}
          >
            {isPanelFull && (
              <span className={getClassesTime(index)}>{showTime(index)}</span>
            )}
            <span
              className={getClassesSpan(index)}
              style={{
                width: isPanelFull
                  ? `${scaleInfo.current.ruler[rulerCounter] * 12.5}%`
                  : '100%',
                zIndex: index === 0 ? 1 : null,
              }}
            >
              {!isPanelFull && storeStatus.isLive && !index ? (
                <span className={getClassesTime(index)}>{showTime(index)}</span>
              ) : (
                <hr className={getClassesSpanHr(index)} />
              )}
            </span>
          </div>
          <div className="tl-lines-wrapper" style={{ zIndex: 1 }}>
            {isPanelFull && <span></span>}
            <span
              className={getClassesSpan(index, true)}
              style={{
                height: scaleInfo.current.marginBottom,
                width: isPanelFull
                  ? `${scaleInfo.current.ruler[rulerCounter] * 12.5}%`
                  : '100%',
              }}
            ></span>
          </div>
        </div>
      );
      if (++rulerCounter >= scaleInfo.current.ruler.length) rulerCounter = 0;
    }
    return layout;
  };

  const handleOnMouseDown = (e, index) => {
    e.preventDefault();
    dispatch(setStatusLiveOff());
    dispatch(setStatusRangeStart(index));
    dispatch(setStatusRangeEnd(index));
    dispatch(setStatusSelectionOn());
  };

  const handleOnMouseMove = (e, index) => {
    e.preventDefault();
    if (storeStatus.isSelection) dispatch(setStatusRangeEnd(index));
  };
  const handleOnMouseUp = e => {
    e.preventDefault();
    dispatch(setStatusSelectionOff());
  };

  const handlePlusButton = () => {
    if (scaleFactor >= SCALE_MAX) return;
    scaleInfo.current = getScaleInfo(scaleFactor + 1);
    setScaleFactor(scaleFactor + 1);
  };

  const handleMinusButton = () => {
    if (scaleFactor <= SCALE_MIN) return;
    scaleInfo.current = getScaleInfo(scaleFactor - 1);
    setScaleFactor(scaleFactor - 1);
  };

  const handleLiveButton = () => {
    dispatch(statusRangeClear());
    dispatch(changeStatusLive());
  };

  return (
    <div
      className="timeline-container"
      onMouseEnter={() => setIsPanelFull(true)}
      // onMouseLeave={() => setIsPanelFull(false)}
      style={{
        width: isPanelFull ? `${PANEL_WIDTH * 2}px` : `${PANEL_WIDTH}px`,
      }}
    >
      <div
        className="timeline-wrapper"
        style={{ height: isPanelFull ? 'calc(100% - 30px)' : '100%' }}
      >
        <button
          className={
            `tl-live-button ` +
            (!storeStatus.isLive && 'tl-live-button_inactive')
          }
          style={{ width: isPanelFull && `100%` }}
          onClick={handleLiveButton}
        >
          {LIVE} {isPanelFull && (storeStatus.isLive ? `ON` : `OFF`)}
        </button>
        <div className="tl-lines">{showScaler()}</div>
      </div>
      {isPanelFull && (
        <div className="tl-scale">
          <button onClick={handleMinusButton}>
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} size="xs" />
          </button>
          <button onClick={handlePlusButton}>
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} size="xs" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Timeline;
