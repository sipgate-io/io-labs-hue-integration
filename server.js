const readline = require('readline');

const v3 = require('node-hue-api').v3;
const hueApi = v3.api;
const LightState = v3.lightStates.LightState;

const { createWebhookModule } = require('sipgateio');

const serverAddress = process.env.SERVER_ADDRESS;
if (!serverAddress) {
	console.error(
		'Please provide a server address via the environment variable SERVER_ADDRESS'
	);
	return;
}

const appName = 'io-labs-hue-integration';
const deviceName = 'call-light';

const ipAddress = 'localhost';
const port = 8000;

const username = process.env.HUE_USERNAME;

const defaultColor = [255, 0, 0];

const personColors = {
	'<some phone number>': [255, 0, 255],
};

const delay = (duration) =>
	new Promise((resolve) => setTimeout(resolve, duration));

async function createUser() {
	const unauthenticatedApi = await hueApi
		.createInsecureLocal(ipAddress, port)
		.connect();

	return await unauthenticatedApi.users.createUser(appName, deviceName);
}

const performUserCreation = async () => {
	try {
		const createdUser = await createUser();
		console.log(`username: ${createdUser.username}`);
	} catch (err) {
		if (err.getHueErrorType && err.getHueErrorType() === 101) {
			console.error(
				'The Link button on the bridge was not pressed. Please press the Link button and try again.'
			);
		} else {
			console.error(`Unexpected Error: ${err.message}`);
		}
	}
};

if (!username) {
	console.log(
		"The HUE_USERNAME environment variable is not set, please press the light's button and press enter"
	);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('> ', async () => {
		await performUserCreation();
		rl.close();
	});

	return;
}

const connectToBridge = (ip, port, username) => {
	return hueApi.createInsecureLocal(ip, port).connect(username);
};

const turnOff = (api, lightId) => {
	return api.lights.setLightState(lightId, new LightState().off());
};

const turnOn = (api, lightId) => {
	return api.lights.setLightState(lightId, new LightState().on());
};

const blinkLight = async (api, lightId, duration, count, color) => {
	await api.lights.setLightState(lightId, new LightState().on().rgb(color));
	for (let i = 0; i < count; i++) {
		await turnOn(api, lightId);
		await delay(duration);
		await turnOff(api, lightId);
		await delay(duration);
	}
};

const runServer = async () => {
	const bridge = await connectToBridge(ipAddress, port, username);
	const allLightIds = await bridge.lights.getAll();

	const webhookServerOptions = {
		port: process.env.SERVER_PORT || 8080,
		serverAddress,
	};
	const server = await createWebhookModule().createServer(webhookServerOptions);
	console.log(`Server running at ${webhookServerOptions.serverAddress}`);

	server.onNewCall(async (newCallEvent) => {
		console.log(`incoming call from ${newCallEvent.from}`);
		const color = personColors[newCallEvent.from] || defaultColor;

		await Promise.all(
			allLightIds.map((lightId) => blinkLight(bridge, lightId, 200, 10, color))
		);
	});
};

runServer();
