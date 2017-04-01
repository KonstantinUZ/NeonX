(function() {
    var tickTimer = 0,
    	BACKGROUND_URL = "url('./images/bg.png')",
        BACKGROUND_AMBIENT_URL = "url('./images/bgambient.png')",
        battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery,
        digitalBody = document.getElementById("digital-body"),
        strDay = document.getElementById("str-day"),
        colorPrev = document.getElementById("color-prev"),
        colorNext = document.getElementById("color-next"),
        wifi = document.getElementById("wifi"),
        strHours = document.getElementById("str-hours"),
        strMinutes = document.getElementById("str-minutes"),
        batteryFill = document.getElementById("battery-fill"),
        barometer = document.getElementById("barometer"),
        pressureSensor = tizen.sensorservice.getDefaultSensor("PRESSURE"),
        colorBrightness = 181;

    var colors = [
                  {
	            	  	name: "color-white",
	            	  	color:"#FFFFFF",
	            	  	free: false
                  },
                  {
	              	  	name: "color-red",
	              	  	color:"#FF0000",
	              	  	free: true
                  },
                  {
                	  	name: "color-green",
                	  	color:"#39FF14",
                	  	free: true
                  },
                  {
	              	  	name: "color-blue",
	              	  	color:"#1133FF",
	              	  	free: true
                  },
                  {
                	  	name: "neon-yellow",
                	  	color:"#F3F315",
                	  	free: false
                  },
                  {
		          	  	name: "neon-orange",
		          	  	color:"#FF9933",
		          	  	free: false
                  },
                  {
                	  	name: "neon-pink",
                	  	color:"#FF00CC",
                	  	free: false
                  },
                  {
	              	  	name: "neon-green",
	              	  	color:"#C1FD33",
	              	  	free: true
                  },
                  {
	              	  	name: "neon-blue",
	              	  	color:"#0DD5FC",
	              	  	free: true
                  }],
    colorCursor = 8,
    colorSelect = colors[colorCursor];
    
    
    /**
     * Updates the date and sets refresh callback on the next day.
     * @private
     * @param {number} prevDay - date of the previous day
     */
    function updateDate() {
    	try
    	{
	        var datetime = tizen.time.getCurrentDateTime(),
	            strFullDate,
	            monthDay = datetime.getDate();
	
	        strFullDate = monthDay;
	        strDay.innerHTML = monthDay < 10 ? "0" + monthDay : monthDay;
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
	
	        strHours.innerHTML = hour < 10 ? "0" + hour : hour;
	        strMinutes.innerHTML = minute < 10 ? "0" + minute : minute;
    	}
    	catch(e)
    	{
    		strHours.innerHTML = "--";
    		strMinutes.innerHTML = "--";
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
    
    function updateColor()
    {
    	var color = colorSelect.color;
    	digitalBody.style.backgroundColor = color;

    	var shaded = shadeColor(color, colorBrightness);
    	
    	strDay.style.color = shaded;
    	strHours.style.color = shaded;
    	strMinutes.style.color = shaded;
    	colorPrev.style.color = shaded;
    	colorNext.style.color = shaded;
    	batteryFill.style.color = shaded;
    	barometer.style.color = shaded;
    }
    
    
    /**
     * Called each second when active 
     * @private
     */
    function tickUpdate()
    {
    	updateTime();
    	updateWifi();
    }
    
    /**
     * Starts timer for normal digital watch mode.
     * @private
     */
    function initDigitalWatch() 
    {
    	if(tickTimer !== 0)
    	{
        	clearInterval(tickTimer);
    	}
        
    	tickTimer = setInterval(tickUpdate, 1000);
        
        digitalBody.style.backgroundImage = BACKGROUND_URL;
        digitalBody.style.backgroundColor = colorSelect.color;
        updateColor();
        
        batteryFill.style.display = "block";
        barometer.style.display = "block";
        wifi.style.display = "block";
        colorPrev.style.display = "block";
        colorNext.style.display = "block";
    }   


    /**
     * Clears timer as none for ambient digital watch mode.
     * @private
     */
    function ambientDigitalWatch() 
    {
    	if(tickTimer !== 0)
    	{
        	clearInterval(tickTimer);
    	}
    	
        strDay.style.color = "#7f7f7f";
    	strHours.style.color = "#7f7f7f";
    	strMinutes.style.color = "#7f7f7f";
        
        digitalBody.style.backgroundImage = BACKGROUND_AMBIENT_URL;
        digitalBody.style.backgroundColor = "#000000";
        
        colorPrev.style.color = "#000000";
        colorNext.style.color = "#000000";
        batteryFill.style.display = "none";
        barometer.style.display = "none";
        wifi.style.display = "none";
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
					 	else
					 	{
					 		var color = colorSelect.color;
					 		var shaded = shadeColor(color, colorBrightness);
						 	wifi.style.color = shaded;
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
     * Update Barometer data
     * @private
     */
    function updateBarometer()
    {
    	try
    	{
			if(pressureSensor !== null)
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

	    	    	    });
	    	    	}
	    	    	catch(e)
	    	    	{

	    	    	}
	    	    });		
			}
    	}
    	catch(e)
    	{

    	}
    }
    
    function previousColor()
    {
    	do
    	{
	    	colorCursor = (colorCursor - 1 < 0 ? colors.length - 1 : colorCursor - 1);
	    }
    	while(!colors[colorCursor].free || colors[colorCursor] === colorSelect);
    	
    	return colors[colorCursor];
    }
    
    function nextColor()
    {
    	do
    	{
    		colorCursor = (colorCursor + 1 > colors.length - 1 ? 0 : colorCursor + 1);
    	}
    	while(!colors[colorCursor].free || colors[colorCursor] === colorSelect);
    	
    	return colors[colorCursor];
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
        	updateTime();
            updateDate();
        });

        // add eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                // rendering ambient mode case
                ambientDigitalWatch();

            } else {
                // rendering normal digital mode case
                initDigitalWatch();
                updateBarometer();
            }
        });
        
        // add event listeners to update watch screen when the time zone is changed.
        try
    	{
	        tizen.time.setTimezoneChangeListener(function() {
	        	updateTime();
                updateDate();
	        });
    	}
        catch(e)
        {
        	
        }

        colorPrev.onclick = function(){
        	colorSelect = previousColor();        	
        	updateColor();
        };
        
        colorNext.onclick = function(){
        	colorSelect = nextColor();
        	updateColor();
        };
        
        strDay.onclick = function(){
        	LaunchApp("com.samsung.w-calendar2");
        };
        
        wifi.onclick = function(){
        	LaunchApp("com.samsung.wifi");
        };
    }
    
    function onLaunchAppSuccess () {
        console.log("App launched");
    }

    function onLaunchAppError () {
    	console.log("Cannot Launch App");
    }    
    
    function LaunchApp(appId)
    {
    	tizen.application.launch(appId, onLaunchAppSuccess, onLaunchAppError);
    }
    
    function updateInAppList()
    {
    	/*webapis.inapppurchase.getItemList(1, 15, "Non-consumable", "IAP_SUCCESS_TEST_MODE", 
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
    			});*/
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
	        updateTime();
            updateDate();
            updateWifi();
            
            setTimeout(updateBarometer, 2000);

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
