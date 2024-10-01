// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FixedSizeList } from 'react-window';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
} from '@fortawesome/free-solid-svg-icons';

import {
  changeStatusLive,
  setStatusLiveOff,
  setStatusSelectionOn,
  setStatusSelectionOff,
  setStatusRangeStart,
  setStatusRangeEnd,
  statusRangeClear,
} from '../../features/slices/status';
import { getScaleInfo, localFromUTC } from './utils';
import './timeline.css';

const PANEL_WIDTH = 56;
const LIVE = 'LIVE';
const SCALE_MIN = 0;
const SCALE_MAX = 5;
const STATUS = {
  STRETCH_RANGE_START: 'start',
  STRETCH_RANGE_END: 'end',
};

function Timeline() {
  const [isPanelFull, setIsPanelFull] = useState(true);
  const [scaleFactor, setScaleFactor] = useState(0);
  const [elementHovered, setElementHovered] = useState(null);
  const stretchRangeRef = useRef(null);
  const firstSelectElemRef = useRef(null);
  const scaleInfoRef = useRef(getScaleInfo(scaleFactor));
  const rangeSelectRef = useRef({});
  const scaleFactorIDsRef = useRef([]);
  const scaleFactorFirstElementRef = useRef(null);
  const storeWebsocket = useSelector(state => state.websocket);
  const storeStatus = useSelector(state => state.status);
  const dispatch = useDispatch();
  let layout = [];

  useEffect(() => {
    rangeSelectRef.current.min = Math.min(
      storeStatus.rangeStart,
      storeStatus.rangeEnd
    );
    rangeSelectRef.current.max = Math.max(
      storeStatus.rangeStart,
      storeStatus.rangeEnd
    );
  }, [storeStatus.rangeStart, storeStatus.rangeEnd]);

  const showScaler = () => {
    const TL_LINES_TIME = 'tl-lines-time';
    const TL_LINES_HR = 'tl-lines-hr';
    const TL_LINES_HR__ACTIVE = 'tl-lines-hr_active';
    const TL_LINES_SPAN_HR = 'tl-lines-span-hr';

    const { multiplBigLine, interval, step, ruler } = scaleInfoRef.current;
    // let layout = [];
    let idxRuler = 0;
    let start = 0;
    let rulerCounter = 0;

    const isSelectionStretchRangeEnd = timestamp =>
      storeStatus.isSelection &&
      stretchRangeRef.current === STATUS.STRETCH_RANGE_END &&
      storeStatus.rangeEnd === timestamp;

    const isScaleFactorFirstSelect = timestamp =>
      scaleFactor && firstSelectElemRef.current === timestamp;

    const isScaleFactorIsliveFirstEl = timestamp =>
      storeStatus.isLive &&
      scaleFactor &&
      scaleFactorFirstElementRef.current === timestamp;

    const showTime = (index, timestamp) => {
      if (isSelectionStretchRangeEnd(timestamp)) {
        const range =
          (rangeSelectRef.current.max - rangeSelectRef.current.min) / interval;
        return `${((range * interval) / 60).toFixed(1)} хв`;
      }
      if (isScaleFactorFirstSelect(timestamp)) {
        return localFromUTC(storeStatus.rangeStart).slice(-8);
      }
      if (isScaleFactorIsliveFirstEl(timestamp)) {
        return localFromUTC(storeWebsocket[0]?.timestamp).slice(-8);
      }
      if (rulerCounter) return '';
      return scaleFactor
        ? localFromUTC(storeWebsocket[index]?.timestamp).slice(-8).slice(0, -3)
        : localFromUTC(storeWebsocket[index]?.timestamp).slice(-8);
      // return String(storeWebsocket[index]?.timestamp).slice(-7);
    };

    const getClassesTime = (index, timestamp) => {
      let classes = TL_LINES_TIME;
      if (!rulerCounter && elementHovered === timestamp)
        return (classes += ` ${TL_LINES_TIME}_hover`);

      if (storeStatus.isLive && index === 0)
        classes += ` active-bg ${TL_LINES_TIME}_hover `;
      if (!scaleFactor && storeStatus.rangeStart === timestamp) {
        classes += ` active-bg ${TL_LINES_TIME}_hover`;
      }
      if (
        isScaleFactorFirstSelect(timestamp) ||
        isScaleFactorIsliveFirstEl(timestamp)
      ) {
        classes += ` active-bg ${TL_LINES_TIME}_hover`;
      }
      if (isSelectionStretchRangeEnd(timestamp)) {
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
      if (!storeStatus.isLive && rangeSelectRef.current.max) {
        if (
          (rangeSelectRef.current.max >= timestamp &&
            rangeSelectRef.current.min + interval <= timestamp) ||
          (!secondRow &&
            rangeSelectRef.current.max >= timestamp &&
            rangeSelectRef.current.min <= timestamp)
        ) {
          classes += ` active-bg-transp`;
        }
      }
      if (isScaleFactorFirstSelect(timestamp)) {
        classes += ` active-bg-transp`;
      }
      return classes;
    };

    const getClassesSpanHr = (index, timestamp) => {
      let classes = TL_LINES_HR;
      if (
        (storeStatus.isLive && (index === 0 || index === 1)) ||
        isScaleFactorIsliveFirstEl(timestamp)
      )
        classes += ` ${TL_LINES_HR__ACTIVE}`;
      if (elementHovered === timestamp)
        return classes + ` ${TL_LINES_HR}_hover`;
      if (isSelectionStretchRangeEnd(timestamp)) {
        return classes + ` ${TL_LINES_HR}_hover`;
      }
      if (
        isScaleFactorFirstSelect(timestamp) ||
        (!storeStatus.isLive &&
          rangeSelectRef.current.max &&
          rangeSelectRef.current.max >= timestamp &&
          rangeSelectRef.current.min <= timestamp)
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
      if (storeWebsocket[idxRuler]?.timestamp % multiplBigLine === 0) break;
    }
    // rulerCounter's index using the current scale
    for (let rev = idxRuler; rev > 0; rev--) {
      if (storeWebsocket[rev]?.timestamp % interval === 0) {
        rulerCounter = ruler.length - Math.round((rev - start) / step);
        break;
      }
    }
    scaleFactorFirstElementRef.current = storeWebsocket[start]?.timestamp;
    if (scaleFactor && storeStatus.rangeStart) {
      scaleFactorIDsRef.current = [];
      for (
        let index = start;
        index < storeWebsocket.length;
        index += scaleInfoRef.current?.step
      ) {
        if (index >= storeWebsocket.length) break;
        const timestamp = storeWebsocket[index]?.timestamp;
        scaleFactorIDsRef.current.push(timestamp);
      }
      firstSelectElemRef.current = scaleFactorIDsRef?.current[0];
      for (let i = 0; i < scaleFactorIDsRef?.current.length; i++) {
        const diffScaleFactorIDs =
          scaleFactorIDsRef?.current[i] - storeStatus.rangeStart;
        const diffFirstSelect =
          firstSelectElemRef.current - storeStatus.rangeStart;

        if (diffScaleFactorIDs < 0) break;
        if (diffScaleFactorIDs < diffFirstSelect) {
          firstSelectElemRef.current = scaleFactorIDsRef?.current[i];
        }
      }
    }

    // layout
    for (
      let index = start;
      index < storeWebsocket.length;
      index += scaleInfoRef.current?.step
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
                  ? `${scaleInfoRef.current.ruler[rulerCounter] * 12.5}%`
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
                height: scaleInfoRef.current.marginBottom,
                width: isPanelFull
                  ? `${scaleInfoRef.current.ruler[rulerCounter] * 12.5}%`
                  : '100%',
              }}
            ></span>
          </div>
        </div>
      );
      if (++rulerCounter >= scaleInfoRef.current.ruler.length) rulerCounter = 0;
    }
    return layout;
  };

  const handleOnMouseDown = (e, index, timestamp) => {
    e.preventDefault();
    if (storeStatus.rangeEnd && timestamp === storeStatus.rangeEnd) {
      dispatch(setStatusLiveOff());
      dispatch(setStatusRangeEnd(timestamp));
      stretchRangeRef.current = STATUS.STRETCH_RANGE_END;
      dispatch(setStatusSelectionOn());
    } else {
      dispatch(setStatusLiveOff());
      dispatch(setStatusRangeStart(timestamp));
      dispatch(setStatusRangeEnd(timestamp - scaleInfoRef.current.interval));
      dispatch(setStatusSelectionOn());
    }
  };

  const handleOnMouseMove = (e, timestamp) => {
    e.preventDefault();
    if (
      storeStatus.rangeEnd !== timestamp &&
      (storeStatus.isSelection ||
        stretchRangeRef.current === STATUS.STRETCH_RANGE_END)
    ) {
      dispatch(setStatusRangeEnd(timestamp));
    }
  };

  const handleOnMouseUp = e => {
    e.preventDefault();
    stretchRangeRef.current = null;
    dispatch(setStatusSelectionOff());
  };

  const handleOnMouseLeaveContainer = e => {
    e.preventDefault();
    setIsPanelFull(false);
    dispatch(setStatusSelectionOff());
  };

  const handlePlusButton = () => {
    firstSelectElemRef.current = null;
    scaleInfoRef.current = getScaleInfo(scaleFactor + 1);
    setScaleFactor(scaleFactor + 1);
  };

  const handleMinusButton = () => {
    firstSelectElemRef.current = null;
    scaleInfoRef.current = getScaleInfo(scaleFactor - 1);
    setScaleFactor(scaleFactor - 1);
  };

  const handleLiveButton = () => {
    dispatch(statusRangeClear());
    dispatch(changeStatusLive());
  };

  const isPlusBtnDisabled =
    scaleFactor >= SCALE_MAX ||
    getScaleInfo(scaleFactor + 1)?.step > storeWebsocket.length;

  const virtualizerHeight =
    document.querySelector('.tl-lines')?.offsetHeight ?? 800;

  showScaler();

  return (
    <div
      className="timeline-container"
      onMouseEnter={() => setIsPanelFull(true)}
      onMouseLeave={handleOnMouseLeaveContainer}
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
        <div className="tl-lines">
          <FixedSizeList
            height={virtualizerHeight}
            width={112}
            itemCount={layout.length}
            itemSize={scaleInfoRef.current.heightElement}
          >
            {({ index, style }) => {
              return <div style={style}>{layout[index]}</div>;
            }}
          </FixedSizeList>
        </div>
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
