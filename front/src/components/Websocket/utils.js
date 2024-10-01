export const SOCKET_INT = 30;

export function findAbsentTimestamps(websocket) {
  const diffTime = websocket[0]?.timestamp - websocket[1]?.timestamp;
  if (diffTime > SOCKET_INT) {
    const stamps = [];
    for (let i = 1; i < Math.trunc(diffTime / SOCKET_INT); i++) {
      stamps.push({
        timestamp: websocket[0]?.timestamp - i * SOCKET_INT,
        coords: null,
      });
    }
    const result = [].concat(
      websocket[0],
      stamps,
      websocket.slice(-1 * (websocket.length - 1))
    );
    return result;
  } else {
    return;
  }
}
