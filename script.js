/* ********************************************************************************	
    Copyright (c) 2023 CodePen | Maycon Luiz (https://codepen.io/mycnlz/pen/XKbEgo)	
   ********************************************************************************	
    code has been slightly customized/modified for the purpose of this exercise  		
   ********************************************************************************	*/
$(document).ready(function () {
    // when a send button is clicked to send a message
    $('button').on('click', function () {
        // capture the message value from the textbox
        var text = $('#message').val();
        // output on the console window for debugging purposes
        console.log(text);

        // get the current date and time and format time in terms of hours:minutes format
        var hnow = new Date().getHours();
        var mnow = new Date().getMinutes();
        mnow = (mnow < 10) ? ('0' + mnow) : mnow;
        var d = hnow + ":" + mnow;

        // check if the message entered by the user is not empty
        if (text.length > 0) {

            // set teh border color to to this style
            $('#message').css("border", "1px solid #f4f5f9");

            // append the converation element to include a new list item containing the (a) message, (b) time
            $('#conversation').append("<li class='message-right'><div class='message-avatar'><div class='avatar ion-ios-person'></div><div class='name'>You</div></div><div class='message-text'>" + text + "</div><div class='message-hour'>" + d + " <span class='ion-android-done-all'></span></div></li>");

            // clear the message textbox 
            $('#message').val('');

            // *********************************************************************************
            // ChatGPT integration: Please READ!
            // We would like to connec to ChatGPT
            // Hence, we will call a function called openAPIConnect to initiate a web service
            // request. However, we need to ensure that we process the request and wait for the
            // response such that once the response is completed, we append the HTML with the
            // results. Hence, we use Promise method which acts as a proxy for a value that is 
            // not necessarily known yet but promised to be created. That is, we are simply
            // associating a handler with an asynchronous action that we hope will successfully
            // complete without failure.That asyncrhnous action is connecting to ChatGPT and
            // passing our request and awaiting a response. When the response arrives, we then
            // append the list of messages in the converation! 
            // If there is an error, we catch the error and provide the reason. 
            // console.log is used for debugging purposes (use Developer Tool in browser)
            // *********************************************************************************
            openAPIConnect(text, d).then(function (responseData) {
                console.log(responseData);
                // if response is successful, append the list and show the result from ChatGPT
                $('#message').css("border", "1px solid #f4f5f9");
                $('#conversation').append("<li class='message-left'><div class='message-avatar'><div class='avatar ion-ios-person'></div><div class='name'>chatGPT</div></div><div class='message-text'>" + responseData + "</div><div class='message-hour'>" + d + " <span class='ion-android-done-all'></span></div></li>");
                $('#message').val('');
            }).catch(function (reason) {
                console.log(reason);
            });

            // adjust the widget converation such that it the recent messages are shown below and earlier ones scroll up
            $('.widget-conversation').scrollTop($('ul li').last().position().top + $('ul li').last().height());
        } else {
            // show animation for handling invalid or empty message
            $('#message').css("border", "1px solid #eb9f9f");
            $('#message').animate({ opacity: '0.1' }, "slow");
            $('#message').animate({ opacity: '1' }, "slow");
            $('#message').animate({ opacity: '0.1' }, "slow");
            $('#message').animate({ opacity: '1' }, "slow");
        }
    });
});

// *********************************************************************************
// ChatGPT Web Service Request: Please READ!
// This code segment was based on the API reference of OpenAI API: 
// https://platform.openai.com/docs/api-reference
// openAPIConnect is a function that returns a Promise (see above). The function
// processes the response which can then be integrated into HTML. 
// *********************************************************************************
function openAPIConnect(processText) {
    return new Promise(function (resolve, reject) {
        // ADD YOUR API KEY BELOW
        var openAIKey = "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";  // ADD YOU OPENAPI KEY KEY HERE

        // Specify the model to use: https://platform.openai.com/docs/models/
        // You may try: text-davinci-002, code-davinci-002 (different training models)
        var serviceModel = "text-davinci-003";
        // service endpoint                       
        var serviceEndpoint = 'https://api.openai.com/v1/completions';

        // when an input is sent to ChatGPT, it is broken into chunks or tokens. 
        // Similarly, we can request ChatGPT to limit the number of tokens in the response. 
        // In this case, we are using 2048. 
        // Reducing the maxTokens reduces network bandwidth and can be useful for smaller devices (e.g., mobile)
        // since answers will be shorter and brief. 
        var maxTokens = 1024;

        // Begin establishing the HTTP Request to web service endpoint
        var serviceRequest = new XMLHttpRequest();
        serviceRequest.open("POST", serviceEndpoint);
        // specify the headers required for the request
        serviceRequest.setRequestHeader("Accept", "application/json");
        serviceRequest.setRequestHeader("Content-Type", "application/json");
        serviceRequest.setRequestHeader("Authorization", "Bearer " + openAIKey)

        // when the request is ready, check its status
        serviceRequest.onreadystatechange = function () {
            // When request is ready, we can begin parsing response
            // response is in JSON. Hence, we use JSON.parse function
            if (serviceRequest.readyState === 4) { // 4 means request is completed
                var responseJSON = {};
                try {
                    // parse the JSON response from service request
                    responseJSON = JSON.parse(serviceRequest.responseText);
                } catch (ex) {
                    // output error message on console
                    console.log("Error: " + ex.message);
                }

                // check to see if the response contains any errors
                if (responseJSON.error && responseJSON.error.message) {
                    // output error message on console
                    console.log("Error: " + responseJSON.error.message);
                    // let Promise be aware of the failure
                    reject("something failed");

                    // If there are no errors, parse the response. 
                    // ChatGPT response may provide multiple choices. 
                    // For simplicity, we only use the first response element. 
                } else if (responseJSON.choices) {
                    // pasrse the first response element and apply a trim
                    var responseMessage = JSON.parse(serviceRequest.responseText);
                    var responseText = responseMessage.choices[0].text.trim();
                    // Let promise be aware of what was successfully resolved
                    resolve(responseText);
                }
            }
        };

        // Web service request require data to be sent in JSON format in the body.
        // Hence, we construct the data element to send along with the URL using POST method.
        // Data simply consist of service model, the text to processed, the maximum number of tokens, etc.
        // based on OpenAI Example: https://platform.openai.com/docs/quickstart/build-your-application
        const data = {
            model: serviceModel,
            prompt: processText,
            temperature: 0.5,
            max_tokens: maxTokens
        };

        // convert data into JSON format 
        serviceRequest.send(JSON.stringify(data));
    });
}