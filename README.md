<img src="https://www.sipgatedesign.com/wp-content/uploads/wort-bildmarke_positiv_2x.jpg" alt="sipgate logo" title="sipgate" align="right" height="112" width="200"/>

# sipgate.io hue integration

This example demonstrates how to control hue lamps based on data received from [sipgate.io](https://developer.sipgate.io/) webhooks.

For further information regarding the push functionalities of sipgate.io please visit https://developer.sipgate.io/push-api/api-reference/

- [Prerequisites](#Prerequisites)
- [Enabling sipgate.io for your sipgate account](#Enabling-sipgateio-for-your-sipgate-account)
- [Install dependencies:](#Install-dependencies)
- [Execution](#Execution)
- [Common Issues](#Common-Issues)
- [Related](#Related)
- [Contact Us](#Contact-Us)
- [License](#License)
- [External Libraries](#External-Libraries)

## Prerequisites

- Node.js >= 10.15.3

## Enabling sipgate.io for your sipgate account

In order to use sipgate.io, you need to book the corresponding package in your sipgate account. The most basic package is the free **sipgate.io S** package.

If you use [sipgate basic](https://app.sipgatebasic.de/feature-store) or [simquadrat](https://app.simquadrat.de/feature-store) you can book packages in your product's feature store.
If you are a _sipgate team_ user logged in with an admin account you can find the option under **Account Administration**&nbsp;>&nbsp;**Plans & Packages**.

## Install dependencies:

Navigate to the project's root directory and run:

```bash
npm install
```

## Execution

Create a webhook in your slack control panel. Details can be found in the official [slack documentation](https://api.slack.com/messaging/webhooks).

Run the application:

```bash
SIPGATE_USERNAME=username SIPGATE_PASSWORD=password SLACK_WEBHOOK_URL=https://your.slack.webhook.url npm start
```

## Common Issues

### web app displays "Feature sipgate.io not booked."

Possible reasons are:

- the sipgate.io feature is not booked for your account

See the section [Enabling sipgate.io for your sipgate account](#enabling-sipgateio-for-your-sipgate-account) for instruction on how to book sipgate.io

## Contact Us

Please let us know how we can improve this example.
If you have a specific feature request or found a bug, please use **Issues** or fork this repository and send a **pull request** with your improvements.

## License

This project is licensed under [**The Unlicense**](https://unlicense.org/)

---

[sipgate.io](https://www.sipgate.io) | [@sipgateio](https://twitter.com/sipgateio) | [API-doc](https://api.sipgate.com/v2/doc)
