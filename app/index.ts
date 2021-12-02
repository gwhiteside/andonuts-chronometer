import { me as appbit, me } from "appbit";
import { battery } from "power";
import { BodyPresenceSensor } from "body-presence";
import { charger } from "power";
import clock, { TickEvent } from "clock";
import { display } from "display";
import document from "document";
//import {FitFontWrapper as FitFont} from "./FitFontWrapper";
import { FitFont } from "fitfont";
import { geolocation } from "geolocation";
import { HeartRateSensor } from "heart-rate";
//import { preferences } from "user-settings";
import * as settings from "user-settings";
import SunCalc from '../common/suncalc';
import { today } from "user-activity";
//import { units } from "user-settings";

let times = SunCalc.getTimes(new Date(), 40, -80);
console.log("dawn: " + times.dawn);
console.log("dusk: " + times.dusk);
console.log("solar noon: " + times.solarNoon);

// In package.json, change appType from "app" to "clockface" before publishing

//let testDate = new Date(); // DEBUG
//testDate.setHours(6); // DEBUG
//testDate.setMinutes(15); // DEBUG
//testDate.setSeconds(0); // DEBUG

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const MILES_PER_METER = 1 / 1609.344;
const KILOMETERS_PER_METER = 1 / 1000.0;

const debugLabel = document.getElementById("debugLabel");

clock.granularity = "seconds";

const bgDay = document.getElementById("bgDay") as GraphicsElement;

const ffMenu = "Earthbound_Menu_2x";
const ffSteps = new FitFont({id: "steps-number", font: ffMenu, halign: "end", valign: "top"});
const ffDistance = new FitFont({id: "distance-number", font: ffMenu, halign: "end", valign: "top"});
const ffCalories = new FitFont({id: "calories-number", font: ffMenu, halign: "end", valign: "top"});
const ffBattery = new FitFont({id: "battery-number", font: ffMenu, halign: "end", valign: "top"});
const ffPulse = new FitFont({id: "pulse-number", font: ffMenu, halign: "end", valign: "top"});

const spriteHourTens = document.getElementById("spriteHourTens") as Element;
const spriteHourOnes = document.getElementById("spriteHourOnes") as Element;
const spriteMinuteTens = document.getElementById("spriteMinuteTens") as Element;
const spriteMinuteOnes = document.getElementById("spriteMinuteOnes") as Element;

const imageDay = document.getElementById("day") as ImageElement;
const imageMeridiem = document.getElementById("meridiem") as ImageElement;
const imageHourTens = document.getElementById("imageHourTens") as ImageElement;
const imageHourOnes = document.getElementById("imageHourOnes") as ImageElement;
//const imageSeparatorHourMinute = document.getElementById("imageSeparatorHourMinute");
const imageMinuteTens = document.getElementById("imageMinuteTens") as ImageElement;
const imageMinuteOnes = document.getElementById("imageMinuteOnes") as ImageElement;

let barometerAvailable = false;
let bodyPresenceSensorAvailable = false;
let heartRateSensorAvailable = false;
let userActivityAvailable = false;

let sunrise: number;
let sunset: number;

let heartRateSensor: HeartRateSensor;
let bodyPresenceSensor: BodyPresenceSensor;

charger.addEventListener("change", onChargerChange);
clock.addEventListener("tick", onClockTick);
display.addEventListener("change", onDisplayChange);

if(appbit.permissions.granted("access_activity")) {
	userActivityAvailable = true;
}

if(today.local.elevationGain !== undefined && appbit.permissions.granted("access_activity")) {
	barometerAvailable = true;
}

if(HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
	heartRateSensor = new HeartRateSensor();
	//heartRateSensor.addEventListener("reading", onHeartRead);
	heartRateSensor.start();
	heartRateSensorAvailable = true;
}

if(BodyPresenceSensor) {
	bodyPresenceSensor = new BodyPresenceSensor();
	//bodyPresenceSensor.addEventListener("reading", onBodyPresenceRead);
	bodyPresenceSensor.start();
	bodyPresenceSensorAvailable = true;
}

function onBodyPresenceRead() {
	//bodyPresenceSensor.present
}

function onClockTick(tickEvent: TickEvent) {
	let date = tickEvent.date;
	//date = testDate; // DEBUG
	//date.setTime(date.getTime() + 1000 + 1 * MINUTES); // DEBUG
	updateBackground(date);
	updateClock(date);

	imageDay.href = `days/${date.getDay()}.png`;
	imageDay.style.fill = "#f0f0f0";

	ffSteps.text = (today.adjusted.steps || 0).toLocaleString();
	ffSteps.style.fill = "#f0f0f0";

	let distance = today.adjusted.distance || 0;
	let units: string;

	if(settings.units.distance === "us") {
		distance *= MILES_PER_METER;
		units = "mi";
	} else {
		distance *= KILOMETERS_PER_METER;
		units = "km";
	}
	ffDistance.text = round(distance, 1).toLocaleString() + units;
	ffDistance.style.fill = "#a0f0f0";

	ffCalories.text = (today.adjusted.calories || 0).toLocaleString();
	ffCalories.style.fill = "#f0f0f0";

	ffBattery.text = Math.floor(battery.chargeLevel).toString();
	ffBattery.style.fill = "#f0f0f0";

	ffPulse.text = (heartRateSensor.heartRate || 0).toString();
	ffPulse.style.fill = "#f0f0f0";
}

function onHeartRead() {
	
}

function onChargerChange() {

}

function onDisplayChange() {
	if(heartRateSensorAvailable) {
		display.on ? heartRateSensor.start() : heartRateSensor.stop();
	}
	display.on ? bodyPresenceSensor.start() : bodyPresenceSensor.stop();
}

function updateBackground(date: Date) {
	if(!sunrise || !sunset) {
		bgDay.style.opacity = 1.0;
		return;
	}

	let time = date.getTime();
	let twilight = 30 * MINUTES; // TODO: superfancy: adjust twilight based on latitude
	let dawn = sunrise - twilight;
	let dusk = sunset + twilight;
	
	if(time >= dawn && time <= sunrise) {
		// morning twilight
		bgDay.style.opacity = 1.0 - (sunrise - time) / twilight;
	} else if(time <= dusk && time >= sunset) {
		// evening twilight
		bgDay.style.opacity = (sunrise - time) / twilight;
		console.log("value: " + bgDay.style.opacity)
		console.log("sunrise: " + sunrise)
		console.log("time: " + time)
		console.log("twilight: " + twilight)
	} else if(time > sunrise && time < sunset) {
		// daytime
		bgDay.style.opacity = 1.0;
	} else {
		// nighttime
		bgDay.style.opacity = 0.0;
	}
}


// The clock digits are animated as if on a spinning wheel
// On an update tick, each changed digit is animated into its new value from the old value

function updateClock(date: Date) {
	//let debugTime = `${date.getMinutes()}:${date.getSeconds()}`; // DEBUG
	//console.log(debugTime); // DEBUG
	//debugLabel.text = debugTime; // DEBUG
	
	date.setTime(date.getTime() - 1000); // Dumb, but seems the path of least resistance
	
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	let theme = "plain";
	
	if (settings.preferences.clockDisplay === "12h") {
		imageMeridiem.href = `theme/${theme}/meridiem-${hours < 12 ? "ante" : "post"}.png`;
		hours = hours % 12 || 12;
	} else {
		imageMeridiem.href = "";
	}
	
	// Set hour sprites
	
	let hourTens = Math.floor(hours / 10);
	let hourOnes = Math.floor(hours % 10);
	
	if(settings.preferences.clockDisplay === "12h") {
		if(hours <= 9) {
			imageHourTens.href = `theme/${theme}/digits/X1_0.png`;
			imageHourOnes.href = `theme/${theme}/digits/${hourOnes}${(hourOnes+1)%10}_0.png`;
		} else { // hours 10, 11, or 12
			imageHourTens.href = `theme/${theme}/digits/1X_0.png`;
			imageHourOnes.href = `theme/${theme}/digits/${hourOnes}${(hourOnes + 1) % 3 || 1}_0.png`;
		}
	} else { // 24h clock
		imageHourTens.href = `theme/${theme}/digits/${hourTens}${(hourTens+1)%3}_0.png`;
		if(hours <= 19) {
			imageHourOnes.href = `theme/${theme}/digits/${hourOnes}${(hourOnes+1)%10}_0.png`;
		} else { // hours 20, 21, 22, or 23
			imageHourOnes.href = `theme/${theme}/digits/${hourOnes}${(hourOnes+1)%4}_0.png`;
		}
	}
	
	// Set minute sprites
	
	let minTens = Math.floor(minutes / 10);
	let minOnes = Math.floor(minutes % 10);

	imageMinuteTens.href = `theme/${theme}/digits/${minTens}${(minTens+1)%6}_0.png`;
	imageMinuteOnes.href = `theme/${theme}/digits/${minOnes}${(minOnes+1)%10}_0.png`;

	// Clock carry logic for animated rollovers
	
	if(seconds === 59) {
		spriteMinuteOnes.animate("enable"); // when 59 seconds rolls over
		if(minOnes === 9) {
			spriteMinuteTens.animate("enable"); // when 9 minutes rolls over
		}
		if(minutes === 59) {
			spriteHourOnes.animate("enable"); // when 59 minutes rolls over
			if(settings.preferences.clockDisplay === "12h") {
				if(hourOnes === 9 || hours === 12) {
					spriteHourTens.animate("enable"); // when 9 or 12 hours rolls over
				}
			} else { // 24h clock
				if(hourOnes === 9 || hours === 23) {
					spriteHourTens.animate("enable"); // when 9, 19, or 23 hours rolls over
				}
			}
		}
	}
}

function round(value: number, places: number) {
	let multiplier = Math.pow(10, places);
	return Math.round(value * multiplier) / multiplier;
}
