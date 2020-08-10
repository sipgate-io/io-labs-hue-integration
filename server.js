const path = require('path');
const fs = require('fs');

const readlineSync = require('readline-sync');

const v3 = require('node-hue-api').v3;
const hueApi = v3.api;
const LightState = v3.lightStates.LightState;

const { createWebhookModule } = require('sipgateio');

const appName = 'io-labs-hue-integration';
const deviceName = 'call-light';

const configFile = path.resolve(__dirname, '.config.json');

const defaultColor = [255, 0, 0];

const personColors = {
	'<some phone number>': [255, 0, 255],
};

let configuration;

try {
	configuration = JSON.parse(fs.readFileSync(configFile).toString());
} catch (e) {
	console.error(
		'Please provide a .config.json file with an bridgeIpAddress and bridgePort.'
	);
	console.error(e);
	return;
}

const createUser = async () => {
	const unauthenticatedApi = await hueApi
		.createLocal(
			configuration.bridgeIpAddress,
			configuration.bridgePort
		)
		.connect();

	return await unauthenticatedApi.users.createUser(appName, deviceName);
};

if (!configuration.credentials) {
	console.log('No existing credentials detected.');

	readlineSync.question(
		'Please push the Link button on your Hue Bridge and then press enter to proceed >'
	);
	createUser()
		.then((createdUser) => {
			console.log(`username: ${createdUser.username}`);
			configuration.credentials = createdUser;
			fs.writeFileSync(configFile, JSON.stringify(configuration));
			return createdUser;
		})
		.then(runServer)
		.catch((err) => {
			console.error(err.message);
		});
} else {
	runServer(configuration.credentials).catch(console.error);
}

const delay = (duration) =>
	new Promise((resolve) => setTimeout(resolve, duration));

const connectToBridge = (ip, port, userCredentials) => {
	return hueApi.createLocal(ip, port).connect(userCredentials.username);
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

async function runServer(userCredentials) {
	let bridge;
	try {
		bridge = await connectToBridge(
			configuration.bridgeIpAddress,
			configuration.bridgePort,
			userCredentials
		);
		await bridge.configuration.getConfiguration();
	} catch (e) {
		console.error(e.message);
		return;
	}

	const allLightIds = await bridge.lights.getAll();

	const webhookServerOptions = {
		port: configuration.webhookPort,
		serverAddress: configuration.webhookURL,
	};
	const server = await createWebhookModule().createServer(webhookServerOptions);
	console.log(`Server running at ${configuration.webhookURL}`);

	server.onNewCall(async (newCallEvent) => {
		console.log(`incoming call from ${newCallEvent.from}`);
		const color = personColors[newCallEvent.from] || defaultColor;

		await Promise.all(
			allLightIds.map((lightId) => blinkLight(bridge, lightId, 200, 10, color))
		);
	});
}
