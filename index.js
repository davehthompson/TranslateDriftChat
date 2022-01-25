//Declare dependencies
require('dotenv').config()
const { TranslationServiceClient } = require('@google-cloud/translate')
const ngrok = require('ngrok')
const express = require('express')
const request = require('superagent')
const bodyParser = require('body-parser')

//Define Variables
const app = express()
const port = process.env.PORT
const conversationApiBase = 'https://driftapi.com/conversations/'
const visitorToken = process.env.VISITOR_TOKEN
const agentToken = process.env.AGENT_TOKEN
const projectId = process.env.PROJECT_ID
const location = 'global';
const db = []
const translationClient = new TranslationServiceClient();

//leverage middleware for response/request objects
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//serve server locally
app.listen(port, () => {
    console.log(`App running locally on: http://localhost:${port}`);
});
//expose local webserver to internet
startNgrok = async () => {
    const url = await ngrok.connect(port)
    console.log(`Payload digestion for translating site visitor message URL is: ${url}/translatevisitor`)
    console.log(`Payload digestion for translating site visitor message URL is: ${url}/translateagent`)
}
startNgrok()

//define overall logic for listening to Drift Events and taking translation action
app.post('/translatevisitor', async (req, res) => {
    try {
        let driftBot = req.body.data.author.bot
        let driftAuthorType = req.body.data.author.type
        if (driftAuthorType === 'contact') {
            let driftMessage = req.body.data.body
            let driftConversation = req.body.data.conversationId
            console.log(`Translating ${driftMessage} as it was entered by a contact`)
            let detectedText = await detectLanguage(driftMessage)
            let dbEntryRaw = {
                conversationId: driftConversation,
                langcode: detectedText[0]
            }
            if (db.find(element => element.conversationId === driftConversation)) {
                console.log('There is already a language identified for this connversation!')
            } else {
                db.push(dbEntryRaw)
                console.log('Adding new language!')
            }
            let translatedText = await translateText(detectedText)
            request.post(`${conversationApiBase}${driftConversation}/messages`)
                .set('Content-type', 'application/json')
                .set('Authorization', `Bearer ${visitorToken}`)
                .send({
                    "type": "private_note",
                    "body": `${driftMessage} *** Translates in English to: *** ${translatedText}`
                })
                .then(res => {
                    return res
                })
                .catch(err => {
                    return {
                        error: err.message
                    }
                })


        } else {
            console.log(`Did not process message as it was not a human writing directly into the chat`)
        }
    } catch (error) {
        console.error(error)
    }

})

app.post('/translateagent', async (req, res) => {
    try {
        let driftAuthorType = req.body.data.author.type
        let driftAuthorId = req.body.data.author.id
        let driftMessageType = req.body.data.type
        let driftMessage = req.body.data.body
        let validateNote = driftMessage.search('/translate')
        if (driftAuthorType === 'user' && driftMessageType === 'private_note' && validateNote != -1)  {
            let driftAuthorId = req.body.data.author.id
            let regex = /([/])\w+/g
            let ModifiedDriftMessage = driftMessage.replace(regex, '')
            console.log(`This is the ModifiedDriftMessage value: ${ModifiedDriftMessage}`)
            console.log(`Translating ${ModifiedDriftMessage} as it was an internal note created by a Drift User`)
            let driftConversationAgent = req.body.data.conversationId
            console.log(`This is the value of driftConversationAgent: ${driftConversationAgent}`)
            const findLang = (lang) => {
                return lang.conversationId === driftConversationAgent
            }
            let langCodeObject = db.find(findLang)
            let langCodeVisitor = langCodeObject.langcode
            let detectedText = await detectLanguage(ModifiedDriftMessage)
            let translatedText = await translateText(detectedText, langCodeVisitor)
            request.post(`${conversationApiBase}${driftConversationAgent}/messages`)
                .set('Content-type', 'application/json')
                .set('Authorization', `Bearer ${agentToken}`)
                .send({
                    "type": "chat",
                    "body": `${translatedText}`,
                    "userId": driftAuthorId
                })
                .then(res => {
                    return res
                })
                .catch(err => {
                    return {
                        error: err.message
                    }
                })


        } else {
            console.log('Internal note was not made by a user')
        }
    } catch (error) {
        console.error(error)
    }

})

//Helper Functions

//Detect language
const detectLanguage = async (driftMessage) => {
    // Construct request
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        content: driftMessage,
    };

    // Run request
    const [response] = await translationClient.detectLanguage(request);

    for (const language of response.languages) {
        let langCode = language.languageCode
        let confidence = language.confidence
        return [langCode, confidence, driftMessage]
    }
}

//Translate text 
const translateText = async (detectedText, langCodeVisitor) => {
    // Construct request
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: detectedText,
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: detectedText[0],
        targetLanguageCode: langCodeVisitor || 'en'
    };

    // Run request
    const [response] = await translationClient.translateText(request);
    let transText = response.translations[2].translatedText
    return [transText]

}

//Search db of Convo ID's and associated language code
const findLang = (lang) => {
    return lang.conversationId === driftConversationAgent
}

