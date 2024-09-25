const base_lon = 36.5878326600486; // Longitude: [-180...180]
const base_lat = 50.591351115388164; // Latitude:  [-90...90]

// process.env.TZ = 'Europe/Kyiv';
const tmzd = new Date().getTimezoneOffset() * 60000;
// MS between messages
const MS_INT = 30000;
const LAT_1KM_FROM_DEG = 0.00841;
const LON_1KM_FROM_DEG = 0.01426;
const LON_KM_MAX = 60;
const LAT_KM_MAX = 40;

var port = 8081,
  WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ port });
const msg =
  'Deprecated: This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the compatibility table at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.'.split(
    ' '
  );
const shuffle = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

console.log('listening on port: ' + port);

wss.on('connection', function connection(ws, req) {
  let timeout = req.url.split('/')[2]
  ? parseInt(req.url.split('/')[2])
  : MS_INT;
  const tSec = timeout / 1000; // time t between sending messages (sec)

  let tmrPep = null;

  const generateDataObject = () => {
    let message = [];
    let coords = [];

    for (let i = 0; i < 1; i++) {
      let s = Math.floor((Math.random() * msg.length) / 2);
      message.push(
        '- ' +
          shuffle(msg)
            .slice(s, s + 1 + Math.floor(Math.random() * 5))
            .join(' ')
      );
    }

    for (let i = 0; i < 1; i++)
      coords.push([
        base_lat + LAT_1KM_FROM_DEG * LAT_KM_MAX * (Math.random() - 0.5),
        base_lon + LON_1KM_FROM_DEG * LON_KM_MAX * (Math.random() - 0.5),
      ]);
    
    let startDate = new Date();
    const seconds = new Date(startDate).getSeconds() > 30 ? 30 : 0;
    startDate = new Date(startDate).setSeconds(seconds);
    startDate = new Date(startDate).setMilliseconds(0);

    return {
      timestamp: Math.floor(startDate / 1000),
      date: new Date(startDate).toISOString().split('T')[0],
      time: new Date(startDate).toISOString().split('T')[1].split('.')[0],
      coords,
      frequency: 400 + 100 * Math.random(),
    };
  };

  const sendDataPep = () => {
    /*
		type pep_message = {
			frequency: string;      (* частота *)
			timestamp: float;       (* timestamp з дати і часу *)
			date: string;           (* дата з заголовків *)
			time: string;           (* час з заголовків *)
			district: string;       (* район *)
			division: string;       (* підрозділ *)
			abons: string list;     (* абоненти *)
			nicknames: string list; (* позивні *)
			message: string list;   (* мессадж по-рядково *)
			?coords: coords option; (* координати з повідомлення *)
			?prio : bool option;    (* пріорітетне повідомлення *)
			?ttl: float;			      (* в с час життя *)
		}		
	*/

    try {
      let data = generateDataObject();
      ws.send(JSON.stringify(data));
      tmrPep = setTimeout(sendDataPep, timeout);
    } catch (e) {
      console.log(e);
    }
  };

  const clearAllTimers = () => {
    if (tmrPep) clearTimeout(tmrPep);
    tmr = null;
  };

  ws.on('message', function (message) {
    try {
      let m = JSON.parse(message);
      console.log('Hello');
      sendDataPep();
    } catch (e) {
      console.log('Wrong request: ' + message);
    }
  });
  ws.on('error', () => {
    clearAllTimers();
  });
  ws.on('close', () => {
    clearAllTimers();
  });

  console.log('new client connected!');
});
