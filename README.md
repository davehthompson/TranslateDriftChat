# Drift Translator App

Server side application written in Node that listens for message events and translates them in accordance to a site visitors language.

### Application Logic

When a site visitor engages with a bot in a specific language the application will detect the language, listen for any messages sent by the site visitor, translate them, and write an internal note inside of the conversation to the target language (English in this example). Additionally, when a chat agent writes back to the chat the application will translate the message into the visitors identified language. 

### Installation and Setup

There are _three_ core components of this application
* Access to Google's Translation API
* Two Drift Developer Applications for listening for specific message events (```new_message``` and ```new_command_message```)
* Node.js runtime with appropriate dependencies executing serverside logic

#### Google Translation API
Before you can start using the Cloud Translation API, you must have a project that has the Cloud Translation API enabled, and you must have a private key with the appropriate credentials. You can also install client libraries for common programming languages to help you make calls to the API. This [setup page](https://cloud.google.com/translate/docs/setup) will walk you through getting it setup properly.

#### Drift Developer Applications
In order for Drift to expose data to the application we need to create two drift developer applications with the appropriate scopes. [This guide](https://devdocs.drift.com/docs/quick-start) will walk you through setting an dev application up. One app will require a subscription to the ```new_message``` webhook and the second will require a subscription to the ```new_command_message``` webhook.

#### Node and core dependencies

This project leverages core libraries/dependencies that are listed below:

* @google-cloud/translate (https://cloud.google.com/translate/docs/reference/libraries/v2/nodejs)
* body-parser (https://www.npmjs.com/package/body-parser)
* dotenv (https://www.npmjs.com/package/dotenv)
* express (https://www.npmjs.com/package/express)
* ngrok (https://www.npmjs.com/package/ngrok)
* node (https://nodejs.org/en/)
* npm (https://www.npmjs.com/package/npm)
* superagent (https://www.npmjs.com/package/superagent)

Install Node.js first (npm should be included) locally or in the cloud depending on where you are developing. Then simply clone/download the repo locally and install the relevant dependences listed. For a one line command to install the dependencies see below:

```
npm i @google-cloud/translate body-parser dotenv express ngrok superagent
```

Once installed navigate to the root directoy where the files resides and run the following command in the IDE of your choice 
```
node index.js
```

## Demo of Site Visitor Experience (German)
![DRIFT-VIDEO-3045136-3149711-1643082412](https://user-images.githubusercontent.com/57994411/150907452-797a7a1c-af96-494c-ab3f-7843565143fa.gif)

## Demo of Chat Agent Experience (German --> English & English --> German)
![DRIFT-VIDEO-3045144-3149719-1643082779](https://user-images.githubusercontent.com/57994411/150907900-8a127672-049f-47b8-bdce-fac5d84c3500.gif)


