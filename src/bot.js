const { ActivityTypes } = require('botbuilder');
const StopwordsFilter = require('node-stopwords-filter');
const axios = require('axios');

class GithubBot {
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            
            let filtredMessage = this.filterNaturalLanguage(turnContext.activity.text);

            let programmingLanguages = this.filterProgrammingLanguage(filtredMessage);

            let response = await this.githubRequest(filtredMessage, programmingLanguages);

            if(response == undefined || response.length == 0) {
                await turnContext.sendActivity('Oops, I didnt find any projects. :(');
            } else {
                let firstItem = response[0];
                await turnContext.sendActivity(`Hey! I've discovered a cool project for you:\nRepository name: '${ firstItem.full_name }'\nDescription: ${firstItem.description}\nOpen issues you can contribute to: ${firstItem.open_issues_count}\nURL: ${firstItem.html_url}`);
            }
            
        } else {
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
    }

    /**
     *
     * @param {string} message
     * @returns {string[]} Array of string that contains the keywords of message 
     */
    filterNaturalLanguage(message) {
        let stopwords = new StopwordsFilter();
        return stopwords.filter(message);
    }

    /**
     *
     * @param {string[]} arrayOfStrings
     * @returns {string[]} Array of string that contains only programming languagues found in the given array
     */
    filterProgrammingLanguage(arrayOfStrings) {
        let languages = [ "javascript", "java", "python", "css", "php", "ruby", "c++", "c", "shell", "c#", "objective c", "r", "viml", "go", "perl", "typescript", "scala", "haskell", "lua", "clojure", "rust", "tex", "arduino"];
        return arrayOfStrings.filter(word => languages.includes(word));
    }

    /**
     *
     * @param {string[]} keywords
     * @param {string[]} programmingLanguages
     * @returns {Promise} Promise object that represents the result of the request
     * */
    githubRequest(keywords, programmingLanguages) {
        
        let query = 'q=' + keywords.join('+');
        
        if (programmingLanguages.length > 0) {
            query += 'language:' + programmingLanguages[0];
        }

        let endpoint = `https://api.github.com/search/repositories?${query}&sort=stars&order=desc`;

        return axios.get(endpoint).then(async response => {
            return response.data.items;
        }).catch(e => { });

    }

}

module.exports.GithubBot = GithubBot;
