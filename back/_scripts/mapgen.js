const base_lon = 38.2041616;
const base_lat = 49.0824812;

process.env.TZ = 'Europe/Kyiv';
const tmzd = (new Date().getTimezoneOffset()) * 60000;
// MS between messages (200)
const msInt = 200

var port = 8081,
	WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ port });
const msg = "Deprecated: This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible; see the compatibility table at the bottom of this page to guide your decision. Be aware that this feature may cease to work at any time.".split(" ");
const shuffle = array => { 
  for (let i = array.length - 1; i > 0; i--) { 
    const j = Math.floor(Math.random() * (i + 1)); 
    [array[i], array[j]] = [array[j], array[i]]; 
  } 
  return array; 
}; 

console.log('listening on port: ' + port);
wss.on('connection', function connection(ws, req)
{
	let timeout = req.url.split("/")[2] ? parseInt(req.url.split("/")[2]) : msInt;
	let tmr = null;
	let sendData = () => 
	{
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
			  ?ttl: float;			  (* в с час життя *)
			}		
		*/

		try
		{
			let message = [];
			let coords = [];
			for (let i = 0; i < 5; i++)
			{
				let s = Math.floor(Math.random() * msg.length / 2);
				message.push("- " + shuffle(msg).slice(s, s + 1 + Math.floor(Math.random() * 5)).join(" "));
			}
			for (let i = 0; i < 1 + Math.floor(Math.random() * 5); i++)
				coords.push([base_lat*(0.95 + 0.1*Math.random()), base_lon*(0.95 + 0.1*Math.random())]);
			let data = {
				frequency: 400 + 100 * Math.random(),
				timestamp: Math.floor((Date.now() - tmzd)/1000),
				date: (new Date()).toISOString().split("T")[0],
				time: (new Date()).toISOString().split("T")[1].split(".")[0],
				district: "",
				division: "",
				abons: [],
				nicknames: [],
				message,
				coords,
				prio: Math.random() > 0.5
			};
			ws.send(JSON.stringify(data));
			tmr = setTimeout(sendData, timeout);
		}
		catch (e)
		{
			console.log(e);
		}
	};

	ws.on('message', function(message)
	{
		try
		{
			let m = JSON.parse(message);
			console.log('Hello');
			sendData();
		}
		catch(e)
		{
			console.log('Wrong request: ' + message);
		}
	});
	ws.on('error', () => {if (tmr) clearTimeout(tmr); tmr = null});
	ws.on('close', () => {if (tmr) clearTimeout(tmr); tmr = null});

	console.log('new client connected!');
});

