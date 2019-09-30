const cheerio = require('cheerio');
const request = require('request');
const nodemailer = require('nodemailer');

let intervalId = undefined;

const gmailAddress = "user@gmail.com";
const gmailPassword= "<password>";

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailAddress,
        pass: gmailPassword
    }
});

var mailOptions = {
    from: gmailAddress,
    to: gmailAddress,
    subject: 'Blizzcon Virtual Ticket sales are live!',
    text: 'Buy a virtual ticket naow! https://blizzcon.com/en-us/'
};

function getCurrentDate() {
    const date = new Date();
    date.setHours(date.getHours() + 2);
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

function notifyOwnerOfTicketAvailability() {
    console.log("Sending mail");
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("error: ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function checkIfVirtualTicketIsAvailable() {
    request('https://blizzcon.com/en-us/', function (error, response, body) {
        if (error) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log(" -- Unable to fetch blizzcon site, waiting for next fetch")
        } else {
            const $ = cheerio.load(body)
            const buyButton = $(".nav-link-item.nav-mobile-callout.nav-special a[data-analytics='virtual-ticket']");
            if (buyButton.hasClass("disabled")) {
                console.log(getCurrentDate(), "-- Ticket unavailable still");
            } else {
                console.log(getCurrentDate(), "-- TICKET AVAILABLE!");
                notifyOwnerOfTicketAvailability();
                console.log("Shutting down!");
                if (intervalId) {
                    clearInterval(intervalId);
                }
            }
        }

    });
}
const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const intervalTimeout = hour;

checkIfVirtualTicketIsAvailable();
intervalId = setInterval(checkIfVirtualTicketIsAvailable, intervalTimeout);