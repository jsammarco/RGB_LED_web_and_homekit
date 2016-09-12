var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var http = require('http');

function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;
     
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
     
    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;
     
    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [
            Math.round(r * 255), 
            Math.round(g * 255), 
            Math.round(b * 255)
        ];
    }
     
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
     
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
     
        case 1:
            r = q;
            g = v;
            b = p;
            break;
     
        case 2:
            r = p;
            g = v;
            b = t;
            break;
     
        case 3:
            r = p;
            g = q;
            b = v;
            break;
     
        case 4:
            r = t;
            g = p;
            b = v;
            break;
     
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
     
    return [
        Math.round(r * 255), 
        Math.round(g * 255), 
        Math.round(b * 255)
    ];
}

// here's a fake hardware device that we'll expose to HomeKit
var FAKE_LIGHT = {
  r: 255,
  g: 255,
  b: 255,
  powerOn: false,
  brightness: 100,
  saturation: 0,
  hue: 0,
  setPowerOn: function(on) { 
    console.log("Turning the light %s!", on ? "on" : "off");
    FAKE_LIGHT.powerOn = on;
	r = FAKE_LIGHT.r;
    g = FAKE_LIGHT.g;
    b = FAKE_LIGHT.b;
	FAKE_LIGHT.r = (on ? FAKE_LIGHT.r : 0);
    FAKE_LIGHT.g = (on ? FAKE_LIGHT.g : 0);
    FAKE_LIGHT.b = (on ? FAKE_LIGHT.b : 0);
    FAKE_LIGHT.setLEDs();
	FAKE_LIGHT.r = r;
    FAKE_LIGHT.g = g;
    FAKE_LIGHT.b = b;
    
  },
  setBrightness: function(brightness) {
    console.log("Setting light brightness to %s", brightness);
    FAKE_LIGHT.brightness = brightness;
    //var max = Math.max(FAKE_LIGHT.r, FAKE_LIGHT.g, FAKE_LIGHT.b);
    //FAKE_LIGHT.r = ((max - FAKE_LIGHT.r) / 100) * brightness;
    //FAKE_LIGHT.g = ((max - FAKE_LIGHT.g) / 100) * brightness;
    //FAKE_LIGHT.b = ((max - FAKE_LIGHT.b) / 100) * brightness;
    FAKE_LIGHT.r = parseInt((FAKE_LIGHT.r * brightness) / 50);
    FAKE_LIGHT.g = parseInt((FAKE_LIGHT.g * brightness) / 50);
    FAKE_LIGHT.b = parseInt((FAKE_LIGHT.b * brightness) / 50);
    console.log("Brightness colors", FAKE_LIGHT.r, FAKE_LIGHT.g, FAKE_LIGHT.b);
    FAKE_LIGHT.setLEDs();
  },
  setHue: function(hue){
    FAKE_LIGHT.hue = hue;
    console.log("Setting light Hue to %s", hue);
    console.log("HSV", FAKE_LIGHT.hue, FAKE_LIGHT.saturation, FAKE_LIGHT.brightness);
    var rgb = hsvToRgb( FAKE_LIGHT.hue, FAKE_LIGHT.saturation, FAKE_LIGHT.brightness);
    console.log("RGB", rgb);
    FAKE_LIGHT.r = rgb[0];
    FAKE_LIGHT.g = rgb[1];
    FAKE_LIGHT.b = rgb[2];
    FAKE_LIGHT.setLEDs();
  },
  setSaturation: function(saturation){
    FAKE_LIGHT.saturation = saturation;
    console.log("Setting light Saturation to %s", saturation);
    console.log("HSV", FAKE_LIGHT.hue, FAKE_LIGHT.saturation, FAKE_LIGHT.brightness);
    var rgb = hsvToRgb( FAKE_LIGHT.hue, FAKE_LIGHT.saturation, FAKE_LIGHT.brightness);
    console.log("RGB", rgb);
    FAKE_LIGHT.r = rgb[0];
    FAKE_LIGHT.g = rgb[1];
    FAKE_LIGHT.b = rgb[2];
    FAKE_LIGHT.setLEDs();
    //client.publish('FountainSaturation',String(saturation));
    FAKE_LIGHT.saturation = saturation;
  },
  identify: function() {
    console.log("Identify the light!");
    //Flash Light
  },
  setLEDs: function () {
	  http.get({
	        host: 'localhost',
	        port: '8888',
	        path: '/START'+FAKE_LIGHT.r+','+FAKE_LIGHT.g+','+FAKE_LIGHT.b+'END'
	    });
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:light');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Light', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "1A:2B:3C:4D:5E:FF";
light.pincode = "031-45-154";

//console.log(Characteristic);
// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Oltica")
  .setCharacteristic(Characteristic.Model, "Rev-1")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  FAKE_LIGHT.identify();
  callback(); // success
});
console.log(light);
FAKE_LIGHT.setLEDs();
// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Fake Light") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    FAKE_LIGHT.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    
    var err = null; // in case there were any problems
    
    if (FAKE_LIGHT.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }
  });

// also add an "optional" Characteristic for Brightness
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('get', function(callback) {
    callback(null, FAKE_LIGHT.brightness);
  })
  .on('set', function(value, callback) {
    FAKE_LIGHT.setBrightness(value);
    callback();
  });
  

light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Hue)
  .on('get',function(callback){
   callback(null,FAKE_LIGHT.hue);
   })
   .on('set',function(value,callback){
   FAKE_LIGHT.setHue(value);
   callback();   
   });

light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Saturation)
  .on('get',function(callback){
   callback(null,FAKE_LIGHT.saturation);
   })
   .on('set',function(value,callback){
   FAKE_LIGHT.setSaturation(value);
   callback();   
   });
   
