


var webdriver = require('wd')
  , assert = require('assert')
  , fs = require('fs');


var browser = webdriver.remote(
  "ondemand.saucelabs.com"
  , 80
  , "sky-jack"
  , "1fae4d98-5c98-4324-ac70-7dcb8fd766d6"
);

browser.on('status', function(info){
  console.log('\x1b[36m%s\x1b[0m', info);
});

browser.on('command', function(meth, path){
  console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
});

var desired = {
  browserName: 'iphone'
  , version: '5.0'
  , platform: 'Mac 10.6'
  , tags: ["examples"]
  , name: "This is an example test"
}


/*
      WebDriver augmentedDriver = new Augmenter ().augment(driver);
        File screenshot = ((TakesScreenshot)augmentedDriver).
                            getScreenshotAs(OutputType.FILE);
*/
browser.init(desired, function() {
  browser.get("http://www.nature.com/nclimate", function() {
    /*
    browser.title(function(err, title) {
    	assert.ok(~title.indexOf('Journal home : Nature Climate Change'), 'Wrong title!');

    });
    */
   
      browser.takeScreenshot(function(err, data) {
        writeScreenshot(data, 'test.jpg');
      })
  
   
  })
})