//Global Variables
var store = require("Storage");
var fileName = "log.csv";
var screen = 0;

//Input Button
pinMode(B5, "input_pulldown");
setWatch(function() {
  digitalPulse(LED1, 1, 50);
  console.log("Before press:" + screen);
  screen = screen==0?1:0;  
  console.log("After press:" + screen);
}, B5, { repeat: true, debounce : 0, edge: "rising" });


//Save data to CSV file.
function addItem(name, ldr, acc_x, acc_y, acc_z) {
  digitalPulse(LED2, 1, 50); // Pulse LED for SD Card operation
  // Create the file in append mode
  var file = store.open(name, "a");
  var csv = [
    new Date(),
    ldr,
    acc_x,
    acc_y,
    acc_z
  ];

  file.write(csv.join(",") + "\n");
  console.log("Written");
  digitalWrite(LED2, 0);
}

//Render Graphics
function start(axl) {
  g.clear();
  var contrast = 255;
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2;
  //Lux meter
  var light = analogRead(A5);

  console.log("light:" + light);
  g.setContrast(contrast);

  var vout = light * (5 / 1024);
  var min_lux = 10 * ((121 * ((vout - 0.008) / 0.079)) + 37);
  var max_lux = 10 * ((123 * ((vout - 0.008) / 0.079)) + 137);
  var avg_lux = (min_lux + max_lux) / 2;
  var lux = parseFloat(avg_lux).toFixed(2).toString();
  //lite = light.toString();
  console.log(lux);
  
  var date = new Date();
  var hour = date.getHours(), mins = date.getMinutes();
  var year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
  var time = hour + ":" + ("0"+mins).substr(-2);
  var datum = year + " / " + month + " / " + day;
  
  if (screen == 0){
  
  g.setFontVector(10);
  g.drawString("LUX:" + lux, 2, 2);

  x1 = x - 10;
  y1 = y - 5;


  g.setFontVector(22);
  g.drawString(time, x1, y1);


  // draw date
  y = 54;
  x = 25;

  g.setFontVector(12);
  g.drawString(datum, x, y);
  if (axl != null) {
    addItem(fileName, lux, axl.x, axl.y, axl.z);
  }
  } else if (screen == 1){
    g.clear();
      if (axl != null) {
        g.setFontVector(22);
        drawAccel(axl);
      }
  }
  
  g.flip();
}

//OLED Setup
I2C3.setup({
  scl: A8,
  sda: B4
});
var g = require("SSD1306").connect(I2C3, start, {
  contrast: 255,
});


//Draw Accelerometer value to second screen.
function drawAccel(accel_value) {
  var x2 = 2;
  var y2 =2;
  
  var a, b, c;

  try {
    a = accel_value.x.toFixed(4);
    b = accel_value.y.toFixed(4);
    c = accel_value.z.toFixed(4);

  } catch (error) {
    console.log("Accelerometer data empty.");
  }
  if (a != null && b != null && c != null) {
    g.setFontVector(20);
    g.drawString("x:" + a, x2, y2);
    g.drawString("y:" + b, x2, y2 + 20);
    g.drawString("z:" + c, x2, y2 + 40);
  }
}

// Setup I2C1 for accelerometer.
var i2c = new I2C();
i2c.setup({
  scl: B6,
  sda: B7
});
//Set chip Select pin low.
digitalWrite(B1, 0);
//Create connection
var accel = require("ADXL345").connect(i2c, B1, 0);
//Set Measure true
accel.measure(true);
//console.log(accel.read());
//Read value every 500ms 
setInterval(function() {
  try {
    var axl = accel.read();
    console.log(axl);
    start(axl);
    //code that causes an error

  } catch (e) {

  }
}, 1000);
