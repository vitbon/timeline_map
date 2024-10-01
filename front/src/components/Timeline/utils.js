export function localFromUTC(seconds) {
  const utcDate = new Date(seconds * 1000);
  return utcDate.toLocaleString('en-GB');
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
        heightElement: 36,
      };
    case 1:
      return {
        step: 2,
        interval: 60,
        marginBottom: '0',
        ruler: [4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        multiplBigLine: 900,
        heightElement: 12,
      };
    case 2:
      return {
        step: 10,
        interval: 300,
        marginBottom: '9px',
        ruler: [4, 2, 2, 3, 2, 2],
        multiplBigLine: 1800,
        heightElement: 21,
      };
    case 3:
      return {
        step: 30,
        interval: 900,
        marginBottom: '11px',
        ruler: [4, 2, 3, 2],
        multiplBigLine: 3600,
        heightElement: 23,
      };
    case 4:
      return {
        step: 60,
        interval: 1800,
        marginBottom: '4px',
        ruler: [4, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2],
        multiplBigLine: 21600,
        heightElement: 16,
      };
    case 5:
      return {
        step: 120,
        interval: 3600,
        marginBottom: '10px',
        ruler: [4, 4, 4, 4, 4, 4],
        multiplBigLine: 21600,
        heightElement: 22,
      };
  }
}
