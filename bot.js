// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const StopwordsFilter = require('node-stopwords-filter');
const axios = require('axios');

class MyBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            var ff = this.filterText(turnContext.activity.text);

            const language = this.getLanguage(ff);

            let q = 'q=' + ff.join('+');

            if (language.length > 0) {
                q += 'language:' + language[0];
            }


            const endpoint = `https://api.github.com/search/repositories?${q}&sort=stars&order=desc`;
            console.log(endpoint);
            const items = await axios.get(endpoint).then(async response => {
                return response.data.items;   
            }).catch(e => { });

            if(items == undefined || items.length == 0) {
                await turnContext.sendActivity('Oops, I didnt find any projects :(');
            } else {
                const first = items[0];
                await turnContext.sendActivity(`Hey! I've discovered a cool project for you:\nRepository name: '${ first.full_name }'\nDescription: ${first.description}\nOpen issues you can contribute to: ${first.open_issues_count}\nURL: ${first.html_url}`);
           
            }
            
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }

    filterText(text) {
        var f = new StopwordsFilter();
        var ff = f.filter(text);
        return ff;
    }

    getLanguage(words) {
        const languages = [ "javascript", "java", "python", "css", "php", "ruby", "c++", "c", "shell", "c#", "objective c", "r", "viml", "go", "perl", "typescript", "scala", "haskell", "lua", "clojure", "rust", "tex", "arduino"];
        return words.filter(word => languages.includes(word));
    }

}

module.exports.MyBot = MyBot;
