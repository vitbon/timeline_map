const base_lon = 36.5878326600486; // Longitude: [-180...180]
const base_lat = 50.591351115388164; // Latitude:  [-90...90]

process.env.TZ = "Europe/Kyiv";
const tmzd = new Date().getTimezoneOffset() * 60000;
// MS between messages (10000)
const MS_INT = 10000;
const LAT_1KM_FROM_DEG = 0.00841;
const LON_1KM_FROM_DEG = 0.01426;
const LON_KM_MAX = 60;
const LAT_KM_MAX = 40;
const STATIC_OBJECTS = 50;
const PLAINS_PER_SQUARE = 60;
const SQUARES_FOR_PLAINS = 3;

var port = 8081,
  WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port });
const msg =
  "Deprecated: This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the compatibility table at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.".split(
    " "
  );
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
const random360 = () => Math.random() * 360;

console.log("listening on port: " + port);

wss.on("connection", function connection(ws, req) {
  let timeout = req.url.split("/")[2]
    ? parseInt(req.url.split("/")[2])
    : MS_INT;
  const tSec = timeout / 1000; // time t between sending messages (sec)
  let tmrPep = null;
  let tmrStatic = null;
  let tmrPlains = null;
  let staticData = [];
  let plainsData = [];

  const generateDataObject = () => {
    let message = [];
    let coords = [];

    for (let i = 0; i < 1; i++) {
      let s = Math.floor((Math.random() * msg.length) / 2);
      message.push(
        "- " +
          shuffle(msg)
            .slice(s, s + 1 + Math.floor(Math.random() * 5))
            .join(" ")
      );
    }

    for (let i = 0; i < 1; i++)
      coords.push([
        base_lat + LAT_1KM_FROM_DEG * LAT_KM_MAX * (Math.random() - 0.5),
        base_lon + LON_1KM_FROM_DEG * LON_KM_MAX * (Math.random() - 0.5),
      ]);

    return {
      frequency: 400 + 100 * Math.random(),
      timestamp: Math.floor((Date.now() - tmzd) / 1000),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toISOString().split("T")[1].split(".")[0],
      district: "",
      division: "",
      abons: [],
      nicknames: [],
      message,
      coords,
      prio: Math.random() > 0.5,
    };
  };

  const manipulateStaticData = () => {
    if (!staticData.length) {
      for (let i = 0; i < STATIC_OBJECTS; i++)
        staticData.push(generateDataObject());
      return staticData;
    } else {
      const uniqueArray = [];
      const uniqueSet = new Set();
      while (uniqueSet.size < STATIC_OBJECTS / 5) {
        const item = parseInt((STATIC_OBJECTS - 1) * Math.random());
        uniqueSet.add(item);
        staticData[item].timestamp = Math.floor((Date.now() - tmzd) / 1000);
        staticData[item].date = new Date().toISOString().split("T")[0];
        staticData[item].time = new Date()
          .toISOString()
          .split("T")[1]
          .split(".")[0];
      }
      for (const elem of uniqueSet) {
        uniqueArray.push(staticData[elem]);
      }
      return uniqueArray;
    }
  };

  const manipulatePlainsData = () => {
    if (!plainsData.length) {
      for (let s = 0; s < SQUARES_FOR_PLAINS; s++)
        for (let p = 0; p < PLAINS_PER_SQUARE; p++) {
          const v = Math.floor(50 + 150 * Math.random());
          const plain = {
            id: `${s}_${p}`,
            title: `Square ${s}, Plain ${p}, v=${v}`,
            v,
            coords: [
              base_lat +
                LAT_1KM_FROM_DEG * LAT_KM_MAX * (Math.random() - 0.5 + s - 1),
              base_lon + LON_1KM_FROM_DEG * LON_KM_MAX * (Math.random() - 0.5),
            ],
            timestamp: Math.floor((Date.now() - tmzd) / 1000),
          };
          plainsData.push(plain);
        }
    } else {
      for (let p = 0; p < plainsData.length; p++) {
        const path = plainsData[p].v * (MS_INT / 3600000);
        const angle = random360();
        const deltaLat = path * Math.cos(angle) * LAT_1KM_FROM_DEG;
        const deltaLon = path * Math.sin(angle) * LON_1KM_FROM_DEG;
        plainsData[p].coords = [
          plainsData[p].coords[0] + deltaLat,
          plainsData[p].coords[1] + deltaLon,
        ];
        plainsData[p].timestamp = Math.floor((Date.now() - tmzd) / 1000);
      }
    }
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
      ws.send(JSON.stringify({ type: "pep", data }));
      tmrPep = setTimeout(sendDataPep, timeout);
    } catch (e) {
      console.log(e);
    }
  };

  const sendDataStatic = () => {
    try {
      let data = manipulateStaticData();
      ws.send(JSON.stringify({ type: "static", data }));
      tmrStatic = setTimeout(sendDataStatic, MS_INT);
    } catch (e) {
      console.log(e);
    }
  };

  const sendDataPlains = () => {
    try {
      manipulatePlainsData();
      ws.send(JSON.stringify({ type: "plains", data: plainsData }));
      tmrPlains = setTimeout(sendDataPlains, MS_INT);
    } catch (e) {
      console.log(e);
    }
  };

  const clearAllTimers = () => {
    if (tmrPep) clearTimeout(tmrPep);
    tmr = null;
    if (tmrStatic) clearTimeout(tmrStatic);
    tmrStatic = null;
    if (tmrPlains) clearTimeout(tmrPlains);
    tmrPlains = null;
  };

  ws.on("message", function (message) {
    try {
      let m = JSON.parse(message);
      console.log("Hello");
      sendDataPep();
      sendDataStatic();
      sendDataPlains();
    } catch (e) {
      console.log("Wrong request: " + message);
    }
  });
  ws.on("error", () => {
    clearAllTimers();
  });
  ws.on("close", () => {
    clearAllTimers();
  });

  console.log("new client connected!");
});
