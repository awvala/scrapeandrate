// Dependecies
const axios = require("axios");
// Require request and cheerio. This makes the scraping possible
const request = require("request");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const db = require("./models");

// Set mongoose to leverage Built in JavaScript ES6 Promises
mongoose.Promise = Promise;

module.exports = function (app) {
    // Landing page
    app.get("/", function (req, res) {
        res.render("index");
        console.log("I made a scrape!")
    });

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        axios.get("https://kotaku.com/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);
            var result = {};

            $(".js_post-wrapper").each(function (i, element) {

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).find(".entry-title").children("a").text();
                result.link = $(this).find(".entry-title").children("a").attr("href");
                result.author = $(element).find(".meta__byline").children("a").text();
                result.summary = $(element).find(".entry-summary").children("p").text();
                result.image = $(element).find(".lazy-image").find("img").attr("src");
                result.comment = null;

                // Check database to see if story saved previously to database
                Articles.findOne({ 'title': title }, function (err, articleRecord) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (articleRecord == null) {
                            db.Articles.create(result)
                                .then(function (dbArticle) {
                                    // View the added result in the console
                                    console.log(dbArticle);
                                })
                                .catch(function (err) {
                                    // If an error occurred, send it to the client
                                    return res.json(err);
                                });
                        } else {
                            console.log("No Record Added");
                        }
                    }
                });
            });
            // If we were able to successfully scrape and save an Article, send a message to the client
            res.send("Scrape Complete");
        });
    });

        // Retrieve all articles from the db
        app.get("/all", function (req, res) {
            // Find all results from the scrapedData collection in the db
            db.Articles.find({}, function (error, found) {
                // Throw any errors to the console
                if (error) {
                    console.log(error);
                }
                // If there are no errors, send the data to the browser as json
                else {
                    res.json(found);
                }
            });
        });

    /*
        // Scrape data from one site and place it into the mongodb db
        app.get("/scrape", function (req, res) {
            // Make a request for the news section of `kotaku`
            request("https://kotaku.com/", function (error, response, html) {
                // Load the html body from request into cheerio
                const $ = cheerio.load(html);
                // For each element with a "title" class
                $(".js_post-wrapper").each(function (i, element) {
                    // Save the text and href of each link enclosed in the current element
                    const title = $(element).find(".entry-title").children("a").text();
                    const link = $(element).find(".entry-title").children("a").attr("href");
                    const author = $(element).find(".meta__byline").children("a").text();
                    const summary = $(element).find(".entry-summary").children("p").text();
                    const image = $(element).find(".lazy-image").find("img").attr("src");
    
                    // If this found element has all requested properties, create a document in the scrapedData db
                    if (title && link && author && summary && image) {
                        // Insert the data in the scrapedData db
                        db.scrapedData.insert({
                            title: title,
                            link: link,
                            author: author,
                            summary: summary,
                            image: image
                        },
                            function (err, inserted) {
                                if (err) {
                                    // Log the error if one is encountered during the query
                                    console.log(err);
                                }
                                else {
                                    // Otherwise, log the inserted data
                                    console.log(inserted);
                                }
                            });
                    }
                });
            });
    
            // Send a "Scrape Complete" message to the browser
            res.send("Scrape Complete");
        });
        */
};
