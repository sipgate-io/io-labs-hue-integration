const v3 = require('node-hue-api').v3
    , discovery = v3.discovery
    , hueApi = v3.api
;
const LightState = v3.lightStates.LightState;

const appName = 'node-hue-api';
const deviceName = 'example-code';
let username = "";
const ipAddress = "localhost";
const port = 8000;

async function createUser() {

    // Create an unauthenticated instance of the Hue API so that we can create a new user
    console.log("Create connection");
    const unauthenticatedApi = await hueApi.createInsecureLocal(ipAddress, port).connect();
    console.log("Connection established");

    let createdUser;
    try {
        createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);
	username = createdUser.username;
        console.log('*******************************************************************************\n');
        console.log('User has been created on the Hue Bridge. The following username can be used to\n' +
            'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
            'YOU SHOULD TREAT THIS LIKE A PASSWORD\n');
        console.log(`Hue Bridge User: ${createdUser.username}`);
        console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
        console.log('*******************************************************************************\n');
        console.log(createdUser);

        // Create a new API instance that is authenticated with the new user we created
        const authenticatedApi = await hueApi.createInsecureLocal(ipAddress, port).connect(createdUser.username);

        // Do something with the authenticated user/api
        const bridgeConfig = await authenticatedApi.configuration.get();
        console.log(`Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`);

    } catch(err) {
        if (err.getHueErrorType() === 101) {
            console.error('The Link button on the bridge was not pressed. Please press the Link button and try again.');
        } else {
            console.error(`Unexpected Error: ${err.message}`);
        }
    }
}

const connectToBridge = (ip, port, username) => {
    return hueApi.createInsecureLocal(ip, port).connect(username);
}

const turnOff = (api, lightId) => {
    return api.lights.setLightState(lightId, new LightState().off());
};

const turnOn = (api, lightId) => {
    return api.lights.setLightState(lightId, new LightState().on());
}

//createUser().then(console.log).catch(console.error);
connectToBridge(ipAddress, port, username).then(turnOff).then(console.log);

