import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  STATUS,
  changeStatusLive,
  setStatusLiveOff,
  setStatusSelectionOn,
  setStatusSelectionOff,
  setStatusRangeStart,
  setStatusRangeEnd,
  statusRangeClear,
  setStatusStretchRange,
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
  const [isPlusBtnDisabled, setIsPlusBtnDisabled] = useState(true);
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

  useEffect(() => {
    setIsPlusBtnDisabled(
      scaleFactor === SCALE_MAX ||
        getScaleInfo(scaleFactor + 1)?.step > storeWebsocket.length
    );
  }, [scaleFactor, storeWebsocket.length]);

  const showScaler = () => {
    const TL_LINES_TIME = 'tl-lines-time';
    const TL_LINES_HR = 'tl-lines-hr';
    const TL_LINES_HR__ACTIVE = 'tl-lines-hr_active';
    const TL_LINES_SPAN_HR = 'tl-lines-span-hr';
    const { multiplBigLine, interval, step, ruler } = scaleInfo.current;
    let layout = [];
    let idxRuler = 0;
    let start = 0;
    let rulerCounter = 0;

    const showTime = (index, timestamp) => {
      if (
        storeStatus.isSelection &&
        storeStatus.stretchRange === STATUS.STRETCH_RANGE_END &&
        storeStatus.rangeEnd - scaleInfo.current.interval === timestamp
      ) {
        const range =
          (rangeSelect.current.max - rangeSelect.current.min) /
            scaleInfo.current.interval +
          1;
        return `${((range * scaleInfo.current.interval) / 60).toFixed(1)} хв`;
      }
      if (rulerCounter) return '';
      return scaleFactor
        ? storeWebsocket[index]?.time.slice(0, -3)
        : storeWebsocket[index]?.time;
    };

    const getClassesTime = (index, timestamp) => {
      let classes = TL_LINES_TIME;
      if (!rulerCounter && elementHovered === timestamp)
        return (classes += ` ${TL_LINES_TIME}_hover`);
      if (storeStatus.isLive && index === 0)
        classes += ` active-bg ${TL_LINES_TIME}_hover `;
      if (
        !storeStatus.isLive &&
        // !scaleFactor &&
        rangeSelect.current?.max === timestamp
      ) {
        classes += ` active-bg ${TL_LINES_TIME}_hover `;
      }
      if (
        storeStatus.isSelection &&
        storeStatus.stretchRange === STATUS.STRETCH_RANGE_END &&
        storeStatus.rangeEnd - scaleInfo.current.interval === timestamp
      ) {
        classes += ` ${TL_LINES_TIME}_hover`;
      }

      return classes;
    };

    const getClassesSpan = (index, timestamp, secondRow = false) => {
      let classes = TL_LINES_SPAN_HR;
      if (storeStatus.isLive) {
        if (index === 0 && (secondRow || isPanelFull))
          return classes + ` active-bg-transp`;
        if (index === 1 && !secondRow) return classes + ` active-bg-transp`;
      }
      if (!storeStatus.isLive && rangeSelect.current.max) {
        if (
          (rangeSelect.current.min <= timestamp &&
            rangeSelect.current.max >= timestamp) ||
          (!secondRow &&
            rangeSelect.current.min - scaleInfo.current.interval <= timestamp &&
            rangeSelect.current.max >= timestamp)
        ) {
          classes += ` active-bg-transp`;
        }
      }
      return classes;
    };

    const getClassesSpanHr = (index, timestamp) => {
      let classes = TL_LINES_HR;
      if (storeStatus.isLive && (index === 0 || index === 1))
        classes += ` ${TL_LINES_HR__ACTIVE}`;
      if (elementHovered === timestamp)
        return classes + ` ${TL_LINES_HR}_hover`;
      if (
        storeStatus.isSelection &&
        storeStatus.stretchRange === STATUS.STRETCH_RANGE_END &&
        storeStatus.rangeEnd - scaleInfo.current.interval === timestamp
      ) {
        return classes + ` ${TL_LINES_HR}_hover`;
      }
      if (
        !storeStatus.isLive &&
        rangeSelect.current.max &&
        rangeSelect.current.min - scaleInfo.current.interval <= timestamp &&
        rangeSelect.current.max >= timestamp
      ) {
        classes += ` ${TL_LINES_HR__ACTIVE}`;
      }

      return classes;
    };

    // calculate a start's index of the websocket's data
    for (let i = 0; i < storeWebsocket.length; i++) {
      if (storeWebsocket[i]?.timestamp % interval === 0) {
        start = i;
        break;
      }
    }
    // get the multiplBigLine's index
    for (idxRuler = start; idxRuler < storeWebsocket.length; idxRuler++) {
      if (storeWebsocket[idxRuler].timestamp % multiplBigLine === 0) break;
    }
    // rulerCounter's index using the current scale
    for (let rev = idxRuler; rev > 0; rev--) {
      if (storeWebsocket[rev]?.timestamp % interval === 0) {
        rulerCounter = ruler.length - Math.round((rev - start) / step);
        break;
      }
    }

    for (
      let index = start;
      index < storeWebsocket.length;
      index += scaleInfo.current?.step
    ) {
      if (index >= storeWebsocket.length) break;
      const timestamp = storeWebsocket[index]?.timestamp;
      layout.push(
        <div
          onMouseDown={e => handleOnMouseDown(e, index, timestamp)}
          onMouseMove={e => handleOnMouseMove(e, timestamp)}
          onMouseUp={e => handleOnMouseUp(e, timestamp)}
          key={timestamp + storeWebsocket[index]?.frequency}
        >
          <div
            className="tl-lines-wrapper"
            onMouseOver={() => setElementHovered(timestamp)}
            onMouseOut={() => setElementHovered(null)}
          >
            {isPanelFull && (
              <span className={getClassesTime(index, timestamp)}>
                {showTime(index, timestamp)}
              </span>
            )}
            <span
              className={getClassesSpan(index, timestamp)}
              style={{
                width: isPanelFull
                  ? `${scaleInfo.current.ruler[rulerCounter] * 12.5}%`
                  : '100%',
                zIndex: index === 0 ? 1 : null,
              }}
            >
              {!isPanelFull && storeStatus.isLive && !index ? (
                <span className={getClassesTime(index, timestamp)}>
                  {showTime(index, timestamp)}
                </span>
              ) : (
                <hr className={getClassesSpanHr(index, timestamp)} />
              )}
            </span>
          </div>
          <div className="tl-lines-wrapper" style={{ zIndex: 1 }}>
            {isPanelFull && <span></span>}
            <span
              className={getClassesSpan(index, timestamp, true)}
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

  const handleOnMouseDown = (e, index, timestamp) => {
    e.preventDefault();
    if (
      storeStatus.rangeStart &&
      storeStatus.rangeEnd &&
      timestamp + scaleInfo.current.interval === storeStatus.rangeEnd
    ) {
      dispatch(setStatusLiveOff());
      dispatch(setStatusRangeEnd(timestamp + scaleInfo.current.interval));
      dispatch(setStatusStretchRange(STATUS.STRETCH_RANGE_END));
      dispatch(setStatusSelectionOn());
    } else {
      dispatch(setStatusLiveOff());
      dispatch(setStatusRangeStart(timestamp));
      if (
        scaleFactor &&
        storeWebsocket.findIndex(i => i.timestamp === timestamp) <
          storeWebsocket.length - 2
      ) {
        dispatch(
          setStatusRangeEnd(
            storeWebsocket[index + scaleInfo.current.step].timestamp
          )
        );
      } else {
        dispatch(setStatusRangeEnd(timestamp));
      }
      dispatch(setStatusSelectionOn());
    }
  };

  const handleOnMouseMove = (e, timestamp) => {
    e.preventDefault();
    if (
      storeStatus.isSelection ||
      storeStatus.stretchRange === STATUS.STRETCH_RANGE_END
    )
      dispatch(setStatusRangeEnd(timestamp));
  };

  const handleOnMouseUp = e => {
    e.preventDefault();
    dispatch(setStatusSelectionOff());
  };

  const handleOnMouseLeaveContainer = e => {
    e.preventDefault();
    setIsPanelFull(false);
    dispatch(setStatusSelectionOff());
  };

  const handlePlusButton = () => {
    if (scaleFactor >= SCALE_MAX) return;
    scaleInfo.current = getScaleInfo(scaleFactor + 1);
    setScaleFactor(scaleFactor + 1);
  };

  const handleMinusButton = () => {
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
      // onMouseLeave={handleOnMouseLeaveContainer}
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
          <button
            onClick={handleMinusButton}
            disabled={scaleFactor === SCALE_MIN}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} size="xs" />
          </button>
          <button onClick={handlePlusButton} disabled={isPlusBtnDisabled}>
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} size="xs" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Timeline;
