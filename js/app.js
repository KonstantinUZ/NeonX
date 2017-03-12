/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    var timerUpdateTime = 0,
    	timerUpdateDate = 0,
    	timerUpdateBarometer = 0,
        flagDigital = false,
        BACKGROUND_URL = "url('./images/bg.png')",
        BACKGROUND_AMBIENT_URL = "url('./images/bgambient.png')",
        battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
        colorSelect = "neon-blue",
        digitalBody = document.getElementById("digital-body"),
        timeBody = document.getElementById("rec-time"),
        strDay = document.getElementById("str-day"),
        wifi = document.getElementById("wifi"),
        bt = document.getElementById("bluetooth"),
        strHours = document.getElementById("str-hours"),
        strMinutes = document.getElementById("str-minutes"),
        batteryFill = document.getElementById("battery-fill"),
        barometer = document.getElementById("barometer"),
        pressureSensor;
    
    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate(prevDay) {
    	try
    	{
	        var datetime = tizen.time.getCurrentDateTime(),
	            nextInterval,
	            strFullDate,
	            getWeekDay = datetime.getDay(),
	            getMonthDay = datetime.getDate()/*,
	            getMonth = datetime.getMonth() + 1,
	            getYear = datetime.getFullYear()*/;
	
	        // Check the update condition.
	        // if prevDate is '0', it will always update the date.
	        if (prevDay !== null) {
	            if (prevDay === getWeekDay) {
	                /**
	                 * If the date was not changed (meaning that something went wrong),
	                 * call updateDate again after a second.
	                 */
	                nextInterval = 1000;
	            } else {
	                /**
	                 * If the day was changed,
	                 * call updateDate at the beginning of the next day.
	                 */
	                // Calculate how much time is left until the next day.
	                nextInterval =
	                    (23 - datetime.getHours()) * 60 * 60 * 1000 +
	                    (59 - datetime.getMinutes()) * 60 * 1000 +
	                    (59 - datetime.getSeconds()) * 1000 +
	                    (1000 - datetime.getMilliseconds()) +
	                    1;
	            }
	        }
	
	        if (getMonthDay < 10) {
	        	getMonthDay = "0" + getMonthDay;
	        }
	
	        strFullDate = getMonthDay;
	        strDay.innerHTML = strFullDate;
	
	        // If an updateDate timer already exists, clear the previous timer.
	        if (timerUpdateDate) {
	            clearTimeout(timerUpdateDate);
	        }
	
	        // Set next timeout for date update.
	        timerUpdateDate = setTimeout(function() {
	            updateDate(getWeekDay);
	        }, nextInterval);
	    	}
    	catch(e)
    	{
    		
    	}
    }

    /**
     * Updates the current time.
     * @private
     */
    function updateTime() {
    	try
    	{
	        var datetime = tizen.time.getCurrentDateTime(),
	            hour = datetime.getHours(),
	            minute = datetime.getMinutes();
	
	        strHours.innerHTML = hour;
	        strMinutes.innerHTML = minute;
	
	            if (hour < 10) {
	                strHours.innerHTML = "0" + hour;
	            }
	
	        if (minute < 10) {
	            strMinutes.innerHTML = "0" + minute;
	        }
    	}
    	catch(e)
    	{
    		
    	}
    }
    
    function shadeColor (col, amt) {
    	var usePound = false;
    	if (col[0] === "#") {
    		col = col.slice(1);
    		usePound = true;
    	}
    	var num = parseInt(col, 16);
    	var r = (num >> 16) + amt;
    	if (r > 255) {
    		r = 255;
    	} else if (r < 0) {
    		r = 0;
    	}
    	var b = ((num >> 8) & 0x00FF) + amt;
    	if (b > 255) {
    		b = 255;
    	} else if (b < 0) {
    		b = 0;
    	}
    	var g = (num & 0x0000FF) + amt;
    	if (g > 255) {
    		g = 255;
    	} else if (g < 0) {
    		g = 0;
    	}
    	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }

    function getColorById(id)
    {
    	switch(id)
    	{
    	case "color-white":
    		return "#ffffff";
    		
    	case "color-red":
    		return "#ff0000";
    		
    	case "color-green":
    		return "#00ff00";
    		
    	case "color-blue":
    		return "#0000ff";
    		
    	case "neon-yellow":
    		return "#e3e829";
    		
    	case "neon-orange":
    		return "#ffaa4d";
    		
    	case "neon-pink":
    		return "#ff3eb5";
    		
    	case "neon-green":
    		return "#44d62c";
    		
    	case "neon-blue":
    		return "#009cde";

		default:
			return "";
    		
    	}
    }
    
    function updateColor()
    {
    	var color = getColorById(colorSelect);
    	digitalBody.style.backgroundColor = color;

    	var shaded = shadeColor(color, 191);
    	
    	strDay.style.color = shaded;
    	strHours.style.color = shaded;
    	strMinutes.style.color = shaded;
    	batteryFill.style.color = shaded;
    	barometer.style.color = shaded;
    	wifi.style.color = shaded;
    	bt.style.color = shaded;
    }
    
    /**
     * Starts timer for normal digital watch mode.
     * @private
     */
    function initDigitalWatch() 
    {
        flagDigital = true;

        digitalBody.style.backgroundImage = BACKGROUND_URL;
        digitalBody.style.backgroundColor = getColorById(colorSelect);
        
        batteryFill.style.display = "block";
        barometer.style.display = "block";
        wifi.style.display = "block";
        bt.style.display = "block";
        
        if(timerUpdateTime)
    	{
        	clearInterval(timerUpdateTime);
    	}
        
        timerUpdateTime = setInterval(updateTime, 1000);
    }   


    /**
     * Clears timer as none for ambient digital watch mode.
     * @private
     */
    function ambientDigitalWatch() 
    {
        flagDigital = false;
        
        if(timerUpdateTime)
    	{
        	clearInterval(timerUpdateTime);
    	}
        updateTime();
        
        strDay.style.color = "#7f7f7f";
    	strHours.style.color = "#7f7f7f";
    	strMinutes.style.color = "#7f7f7f";
        
        digitalBody.style.backgroundImage = BACKGROUND_AMBIENT_URL;
        digitalBody.style.backgroundColor = "#000000";
        
        batteryFill.style.display = "none";
        barometer.style.display = "none";
        wifi.style.display = "none";
        bt.style.display = "none";
    }

    /**
     * Gets battery state.
     * Updates battery level.
     * @private
     */
    function getBatteryState() 
    {
        var batteryLevel = Math.floor(battery.level * 100);
        batteryFill.innerHTML = batteryLevel + "%";
    }

	/**
     * Update Wi-Fi state
     * @private
     */
    function updateWifi()
    {
    	try
    	{
	    	if(tizen.systeminfo.getCapability("http://tizen.org/feature/network.wifi"))
			{
	    		 tizen.systeminfo.getPropertyValue("WIFI_NETWORK", 
											 	function (wifiInfo) // OnSuccess
											    {
												 	if(wifiInfo.status !== "ON")
										 			{
												 		wifi.style.color = "#7f7f7f";
									 				}
											    },												    
											    function() // OnError
												{
													wifi.style.color = "#7f7f7f";
												});
			}
    	}
    	catch(e)
    	{
    		
    	}
    }
    
    /**
     * Update Bluetooth state
     * @private
     */
    function updateBluetooth()
    {
    	try
    	{
	    	if(tizen.systeminfo.getCapability("http://tizen.org/feature/network.bluetooth"))
			{
	    		var adapter = tizen.bluetooth.getDefaultAdapter();
	    		if (!adapter.powered)
		      	{
	    			bt.style.color = "#7f7f7f";
	    		}
			}
    	}
    	catch(e)
    	{
    		
    	}
    }
    
    /**
     * Update Barometer data
     * @private
     */
    function updateBarometer()
    {
    	try
    	{
			if(!pressureSensor)
		    {
	    		pressureSensor = tizen.sensorservice.getDefaultSensor("PRESSURE");
		    }
			
			if(pressureSensor)
			{
	    		pressureSensor.start(function() 
	    	    {
	    	    	try
	    	    	{
	    	    		pressureSensor.getPressureSensorData(
	    	    		function(sensorData) // OnSuccess
	    	    	    {
	    	    	    	barometer.innerHTML = Math.round(sensorData.pressure) + "hPa";
	    	    	    }, 
	    	    	    function() // OnError
	    	    	    {
	    	    	    	barometer.innerHTML = "n/a(2)";
	    	    	    });
	    	    	}
	    	    	catch(e)
	    	    	{
	    	    		barometer.innerHTML = "n/a(3)";
	    	    	}
	    	    });		
			}
    	}
    	catch(e)
    	{
    		barometer.innerHTML = "n/a(1)";
    	}
    }


    /**
     * Updates watch screen. (time and date)
     * @private
     */
    function updateWatch() {
        updateTime();
        updateDate(0);
        updateColor();
        updateWifi();
        updateBluetooth();
        
        
        if(timerUpdateBarometer)
    	{
        	clearInterval(timerUpdateBarometer);
    	}
        timerUpdateBarometer = setTimeout(updateBarometer, 1000);
    }

    /**
     * Binds events.
     * @private
     */
    function bindEvents() {
        // add eventListener for battery state
    	try
    	{
		    battery.addEventListener("chargingchange", getBatteryState);
		    battery.addEventListener("chargingtimechange", getBatteryState);
		    battery.addEventListener("dischargingtimechange", getBatteryState);
		    battery.addEventListener("levelchange", getBatteryState);
		}
    	catch(e)
    	{
    		batteryFill.innerHTML = "100%";
    	}

        // add eventListener for timetick
        window.addEventListener("timetick", function() {
            ambientDigitalWatch();
        });

        // add eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                // rendering ambient mode case
                ambientDigitalWatch();

            } else {
                // rendering normal digital mode case
                initDigitalWatch();
            }
        });

        // add eventListener to update the screen immediately when the device wakes up.
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                updateWatch();
            }
        });

        // add event listeners to update watch screen when the time zone is changed.
        try
    	{
	        tizen.time.setTimezoneChangeListener(function() {
	            updateWatch();
	        });
    	}
        catch(e)
        {
        	
        }

        timeBody.onclick = function () {
        	colorSelect = 
        		colorSelect === "color-red" ? "color-blue" :
    			colorSelect === "color-blue" ? "neon-blue" :
				colorSelect === "neon-blue" ? "neon-green" :
			    colorSelect === "neon-green" ? "color-green" :
				colorSelect === "color-green" ? "neon-orange" :
				colorSelect === "neon-orange" ? "color-red" :
				"neon-blue";
        	updateWatch();        	
        };
        
        strDay.onclick = function(){
        	LaunchApp("com.samsung.w-calendar2");
        };        
    }
    
    function onLaunchAppSuccess () {
        console.log("App launched");}

    function onLaunchAppError () {
        console.log("Cannot Launch App");}    
    
    function LaunchApp(appId)
    {
    	tizen.application.launch(appId, onLaunchAppSuccess, onLaunchAppError);
    }
    
    function updateInAppList()
    {
    	webapis.inapppurchase.getItemList(1, 15, "Non-consumable", "IAP_SUCCESS_TEST_MODE", 
    			function(result) // onSuccess
    			{
					for (var i = 0; i < result._items.length; i++)
					{
						var color = getColorById(result._items[i].mItemId);
						alert("color:" + color + " id:" + result._items[i].mItemId);
					}
    			},
    			function(error) // onError
    			{
    				alert("IAP:" + error);
    			});
    }

    /**
     * Initializes date and time.
     * Sets to digital mode.
     * @private
     */
    function init() {

    	try
    	{
	        initDigitalWatch();
	        updateDate(0);
	        updateColor();
	
	        bindEvents();
	        
	        updateInAppList();
	        
    	}
    	catch(e)
    	{
    		alert(e);
    	}
    }

    window.onload = init();
}());
