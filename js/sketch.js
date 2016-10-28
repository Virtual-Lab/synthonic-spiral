 // final version
 // read console for keyboard commands

var TWO_PI = 2 * Math.PI;
var n_osc = 13;
var tones = [];
// for (var i = 0; i < n_osc.length; i++) {tones[i] = new Sound()};
var majorTriad = [0, 4, 7];
var chords = [
  [0], // a
  [0, 4, 7], // b  --> major triad
  [0, 3, 7], // c  --> minor triad
  [0, 4, 7, 10], // d --> dominant 7th
  [0, 4, 8], // e --> augmented traid
  [0, 3, 6, 9], // f --> diminished 7th chord
  [0, 12, 19, 24, 28, 31], // g --> harmonics
  [0, 2, 4, 5, 7, 9, 11, 12], // h --> diatonic scale
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // i --> chromatic scale
];

var chordNames = [
  "single tone", 
  "major triad", 
  "minor triad", 
  "dominant 7th", 
  "augmented traid", 
  "diminished 7th chord", 
  "harmonics", 
  "diatonic scale", 
  "chromatic scale"
];

var btn_pos = [
  [143, 10, 120, 30], // select chord 
  [13, 10, 120, 30], // select scale
  [273, 10, 50, 30], // play myScore
  [323, 10, 20, 15], // transp up
  [323, 25, 20, 15]  // transp down
];

var spiralDots = new Array(400);
for(var i = 0; i<400; i++) spiralDots[i] = new Array(3);

var btnPressed = function(id_btn) {
  if (mouseX > btn_pos[id_btn][0] && mouseX < btn_pos[id_btn][0] + btn_pos[id_btn][2]
    && mouseY > btn_pos[id_btn][1] && mouseY < btn_pos[id_btn][1] + btn_pos[id_btn][3]) {
    return true;
  } else return false;
}  

var dt = 20; // time unit in frames
var fr = 50; // frameRate
var t = -1;
var id_c_chord = 0;  // id current chord
var id_c_key; // for mouse-pressed chords
var id_c_scoreKey = 0;
var id_c_scoreKey_53 = 0;
var id_c_scoreKey_12 = 0;
var f0 = 131; // frequency reference c (Hz)
var id_c_scoreChord;
var pl_score = 0; // state of playing
var synt_scales =
  [
  [[0, 0], [4, -1], [0, -3], [-1, 2], [3, 1], [-1, -1], [3, -2], [2, 3], [-2, 1], [2, 0], [-2, -2], [2, -3], 
    [1, 2], [-3, 0], [1, -1], [-3, -3], [-4, 2], [0, 1], [4, 0], [0, -2], [-1, 3], [3, 2], [-1, 0], [3, -1], 
    [-1, -3], [-2, 2], [2, 1], [-2, -1], [2, -2], [1, 3], [-3, 1], [1, 0], [-3, -2], [1, -3], [0, 2], [-4, 0], 
    [0, -1], [4, -2], [3, 3], [-1, 1], [3, 0], [-1, -2], [-2, 3], [2, 2], [-2, 0], [2, -1], [-2, -3], 
  [-3, 2], [1, 1], [-3, -1], [1, -2], [0, 3], [-4, 1]], // CHI_53
  [[0, 0], [-1, 2], [-1, -1], [-2, 1], [2, 0], [1, 2], [1, -1], [0, 1], [-1, 3], [-1, 0], [-2, 2], [2, 1], [-2, -1], [2, -2], 
  [1, 0], [0, 2], [0, -1], [-1, 1], [-2, 3], [2, 2], [-2, 0], [2, -1], [1, 1], [0, 3]], // Salinas 24
  [[0, 0], [-1, 2], [-2, 1], [2, 0], [1, -1], [0, 1], [-1, 0], [-2, 2], [1, 0], [0, 2], [-1, 1], [-2, 0], [2, -1], [1, 1]], // Salinas 14
  [[0, 0], [-1, -1], [2, 0], [1, -1], [0, 1], [-1, 0], [2, 1], [1, 0], [0, -1], [-1, 1], [-2, 0], [1, 1]], // Mersenne 1
  [[0, 0], [-1, 2], [-2, 1], [-3, 0], [0, 1], [-1, 0], [-2, 2], [1, 0], [0, 2], [-1, 1], [-2, 0], [1, 1]], // Mersenne 2
  [[0, 0], [3, 1], [2, 0], [1, -1], [0, 1], [-1, 0], [2, 1], [1, 0], [0, -1], [3, 0], [2, -1], [1, 1]], // Newton
  [[0, 0], [-1, 2], [-2, 1], [1, -1], [0, 1], [-1, 0], [-2, 2], [1, 0], [0, 2], [-1, 1], [2, -1], [1, 1]], //  Holder
  [[0, 0], [-1, 2], [2, 0], [1, 2], [0, 1], [-1, 0], [2, 1], [1, 0], [0, 2], [-1, 1], [2, 2], [1, 1]] // Euler

];
var synt_scale_names = ["CHI_53", "Salinas_24", "Salinas_14", "Mersenne 1", "Mersenne 2", "Newton", "Holder", "Euler"]; 
var id_c_scale; // id of current scale

var synt_diat_scale = [[0, 0], [-2, 1], [2, 0], [0, 1], [-1, 0], [1, 0], [-1, 1], [1, 1]];

var sobjs = [];
sobjs[synt_scales.length] = [];

/* 
 var[] myScore = [24], [28], [31], [28], [24], [31], [28], [24], [36], 
 [7, 35], [11, 35], [14, 31], [11, 38], [7, 35], [14, 31], [11, 38], [7, 35], [17, 31], 
 [16, 36], [16, 31], [12, 28], [19, 34], [16, 31], [12, 28], [19, 34], [16, 31], [12, 28], 
 [17, 33], [21, 29], [17, 26], [14, 23], [17, 26], [14, 29], [11, 33], [12, 31], [14, 29], 
 [16, 31], [16, 31], [];
 */
var myScore = [[106], [123], [137], [123], [106], [137], [123], [106], [159], 
  [31, 154], [48, 154], [62, 137], [48, 168], [31, 154], [62, 137], [48, 168], [31, 154], [75, 137], 
  [70, 159], [70, 137], [53, 123], [84, 150], [70, 137], [53, 123], [84, 150], [70, 137], [53, 123], 
  [75, 145], [92, 128], [75, 115], [62, 101], [75, 115], [62, 128], [48, 145], [53, 137], [62, 128], 
  [70, 137], [70, 137], []]; // CHI_53

var myScore_12, c_score;

var u = 50, x0 = 170, y0 = 220;  // grid
var x0_s = 500, y0_s = 200, r0_s = 150, dr_s = -20; // spiral
var r_c = 60;  // diatonic circle

var nm_note = function (n) {  // n = 0 -> F
  var alt = '#';
  var letter = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
  var nm = str(letter[(n%7+7) % 7]); 
  var n_alt = parseInt(n / 7);
  if (n < 0) {
    alt = 'b'; 
    n_alt = parseInt(1 - (n+1)/7);
  };
  for (var k = 0; k < n_alt; k++) {
    nm = nm + alt;
  };
  return nm;
};

var posToFreq = function(x, y) {
  var f = Math.pow(3, x)*Math.pow(5, y);
  var powOf2 = Math.floor(Math.log(f)/Math.log(2));
  f = f*Math.pow(2, -powOf2);
  return f;
};

var posTo53Tet = function (x, y) {
  return ((31*x + 17*y)%53 + 53)%53;
}

var posTo12Tet = function (x, y) {
  return ((7*x + 4*y)%12 +12)%12;
}

function chi53To12Tet(sc53) {
  var p_53, oct, pc_53, pc_12;
  myScore_12 = new Array (sc53.length);
  for (var k = 0; k < sc53.length; k++) {
    myScore_12[k] = new Array(sc53[k].length);
    for (var j = 0; j < sc53[k].length; j++) {
      p_53 = sc53[k][j];    // replace by p53Top12
      oct = parseInt(p_53 / 53);
      pc_53 = p_53 % 53;
      pc_12 = sobjs[0][pc_53].p_12;
      myScore_12[k][j] = 12 * oct + pc_12;
    }
  }
}

var p53Top12 = function(p) {  // p > 0
  var oct = p / 53;
  var pc_53 = p % 53;
  var pc_12 = sobjs[0][pc_53].p_12;
  return 12 * oct + pc_12;
}

var pTop53 = function(id_scale, p) {    // p > 0
  var sz_scale = synt_scales[id_scale].length;
  var x = sobjs[id_scale][p % sz_scale].xPos;
  var y = sobjs[id_scale][p % sz_scale].yPos;
  var p53 = -1;
  for (var k = 0; k < sobjs[0].length; k++) {
    if (x == sobjs[0][k].xPos && y == sobjs[0][k].yPos) {
      p53 = k;
    }
  }
  return p53;
}

var posToCent = function (x, y) {
  return Math.round(12000*log(posToFreq(x, y))/log(2))/10;
}

var pitchToFreq = function (id_scale, id_pitch) {
  
  var sz_scale = synt_scales[id_scale].length;
  var pitchClass = ((id_pitch % sz_scale) + sz_scale) % sz_scale;
  var octave = Math.floor(id_pitch / sz_scale);

  console.log("id-pitch", id_pitch, "pitchClass", pitchClass);
  var freq = Math.round(10*f0 * sobjs[id_scale][pitchClass].freq * Math.pow(2, octave))/10.0;
  // println(sobjs[id_scale][pitchClass].nm_pitch, freq);
  return freq;
}

function showNote(id_scale, id_pitch) {
  var sz_scale = synt_scales[id_scale].length;
  var pitchClass = (id_pitch % sz_scale + sz_scale) % sz_scale;
  var x = x0 + u * sobjs[id_scale][pitchClass].xPos;
  var y = y0 - u * sobjs[id_scale][pitchClass].yPos;

  if (id_pitch >= 0 && id_pitch < spiralDots.length) {
    fill(spiralDots[id_pitch][2], 99, 99);
    ellipse(x, y, 7, 7);
    var xs = spiralDots[id_pitch][0];
    var ys = spiralDots[id_pitch][1];
    if ( xs != 0) {
      fill(spiralDots[id_pitch][2], 99, 99);
      ellipse(xs, ys, 8, 8);
    }
  }
  print(pitchClass, sobjs[id_scale][pitchClass].nm_pitch, pitchToFreq(id_scale, id_pitch), " | ");
}


function showChord(id_c) {
  clearGrid(id_c_scale);
  for (var k = 0; k < myScore[id_c].length; k++) {
    showNote(id_c_scale, myScore[id_c][k]);
  }
  println();
}

function clearGrid(id_scale) {
  var sz_scale = synt_scales[id_scale].length;
  var x, y;
  for (var k = 0; k < sz_scale; k++) {
    x = x0 + u * sobjs[id_scale][k].xPos;
    y = y0 - u * sobjs[id_scale][k].yPos;
    fill(99);
    ellipse(x, y, 7, 7);
  }
  for (var k = 0; k < spiralDots.length && spiralDots[k][0] != 0; k++) {
    fill(99);
    ellipse(spiralDots[k][0], spiralDots[k][1], 8, 8);
  }
}

function playNote(id_scale, id_pitch, id_osc) {
  var freq = pitchToFreq(id_scale, id_pitch);
  var time = false;
  if(pl_score != 0) time = 0.2;
  showNote(id_scale, id_pitch);
  tones[id_osc].play(freq, time);
}

function stopNote(id_osc) {
  tones[id_osc].stop();
}

function playChord(id_scale, p_key, chord, dt) { 
  clearGrid(id_scale);
  if (pl_score != 0) {for (var k = 0; k < n_osc; k++) stopNote(k); wait(50)}
  for (var k = 0; k < chord.length; k++) {
    var j = k;
    if (dt < 0) j =  chord.length - k - 1;
    console.log("p_key: ", p_key, "chord :", chord[j])
    playNote(id_scale, p_key + chord[j], k);
    wait(Math.abs(dt));
    if (Math.abs(dt) > 500) stopNote(k);
  }
  id_c_key = p_key;
  //println();
}

function wait(ms) {
  var t = millis();
  while (millis() < t + ms) {
  }
}

// does not show the notes
function playScore(id_scale, p_key, score) { 
  pl_score = 1;
  var k = 0;
  var t = millis();
  while ( k < score.length) {
    //if (millis() > (t + 200)) {console.log("stop")}
    if (millis() > (t + 300)) {
      //for (var i = 0; i < n_osc; i++) stopNote(i);
      console.log("stop");
      id_c_scoreChord = k;
      playChord(id_scale, p_key, score[k], 0);
      k++;
      t = millis();
    }

  }
  pl_score = 0;
}

// var SObj = function (d_sc, n_pitch){
//   this.xPos, this.yPos;  // position in syntonic grid
//   this.id_scale;
//   this.sz_scale; // length of the scale
//   this.nr_pitch; // number of pitch classes within the scale
//   this.freq;  // number in [1, 2)
//   this.p_cent; // cent value with resp to C = 0
//   this.p_53, this.p_12;
//   this.nm_pitch, this.nm_scale;
// };

var SObj = class {

  constructor (id_sc, n_pitch) {
    this.xPos = synt_scales[id_sc][n_pitch][0];
    this.yPos = synt_scales[id_sc][n_pitch][1];
    this.id_scale = id_sc;
    this.sz_scale = synt_scales[id_sc].length;
    this.nm_scale = synt_scale_names[id_sc];
    this.nr_pitch = n_pitch;
    this.nm_pitch = nm_note(1 + this.xPos + 4*this.yPos);
    this.freq = posToFreq(this.xPos, this.yPos);
    this.p_cent = posToCent(this.xPos, this.yPos);
    this.p_53 = posTo53Tet(this.xPos, this.yPos);
    this.p_12 = posTo12Tet(this.xPos, this.yPos);
  };
};

function drawSyntScale(id_scale) {
  id_c_scale = id_scale;
  if (id_c_scale == 0) {
    id_c_scoreKey = id_c_scoreKey_53;
  } else {
    id_c_scoreKey = id_c_scoreKey_12;
  };

  background(0, 0, 99);
  fill(99);
  rect(btn_pos[1][0], btn_pos[1][1], btn_pos[1][2], btn_pos[1][3]);
  fill(0); noStroke();
  text(synt_scale_names[id_c_scale], btn_pos[1][0] + 7, btn_pos[1][1] + 20);

  fill(99); stroke(0);
  rect(btn_pos[0][0], btn_pos[0][1], btn_pos[0][2], btn_pos[0][3]);
  fill(0); noStroke();
  text(chordNames[id_c_chord], btn_pos[0][0] + 7, btn_pos[0][1] + 20);

  fill(99); stroke(0);
  rect(btn_pos[2][0], btn_pos[2][1], btn_pos[2][2], btn_pos[2][3]);
  fill(0); noStroke();
  text("JSB: "+ id_c_scoreKey, btn_pos[2][0] + 7, btn_pos[2][1] + 20);

  fill(99); stroke(0);
  rect(btn_pos[3][0], btn_pos[3][1], btn_pos[3][2], btn_pos[3][3]);
  fill(0); noStroke();
  text("+", btn_pos[3][0] + 7, btn_pos[3][1] + 12);

  fill(99); stroke(0);
  rect(btn_pos[4][0], btn_pos[4][1], btn_pos[4][2], btn_pos[4][3]);
  fill(0); noStroke();
  text("-", btn_pos[4][0] + 7, btn_pos[4][1] + 12);
  stroke(0);

  var x, y; 
  for (var k = 0; k < synt_scales[id_scale].length; k++) {
    x = sobjs[id_scale][k].xPos;
    y = sobjs[id_scale][k].yPos;
    stroke(0);
    line(x0 + x*u - 0.5*u, y0-y*u, x0 + x*u + 0.5*u, y0-y*u);
    line(x0 + x*u, y0- y*u  - 0.5*u, x0 + x*u, y0 - y*u + 0.5*u);
    fill(99);
    ellipse(x0 + x*u, y0-y*u, 7, 7); 
    fill(0); noStroke(0);
    text(sobjs[id_scale][k].nm_pitch, x0 + x*u + 6, y0-y*u + 13);
    text(k, x0 + x*u + 6, y0-y*u - 10);
    stroke(0);
  }
};

function drawPitchSpiral(id_scale, n_oct, xM, yM, r0, dr) {
  var sz_scale = synt_scales[id_scale].length;
  var n_pitches = n_oct * sz_scale + 1;
  var x_old = xM;
  var y_old = yM - r0;
  var col;
  var x, y;
  var oct = 0;
  var r = 0, phi = 0, cent = 0;

  for (var k = 0; k < n_pitches && k < spiralDots.length; k++) {
    oct = Math.floor(k / sz_scale);
    cent = sobjs[id_scale][k % sz_scale].p_cent;
    phi = cent * (2 * Math.PI) / 1200;
    r = r0 + (oct + cent/1200)*dr;
    x = Math.round(xM + r * Math.sin(phi));
    y = Math.round(yM - r * Math.cos(phi));
    col = Math.round(cent/12);

    // Find the mistake:
    console.log("sz-scale: ", sz_scale, "id_scale", id_scale);

    spiralDots[k][0] = x;
    spiralDots[k][1] = y;
    spiralDots[k][2] = col;
    fill(99);
    line(x_old, y_old, x, y);
    stroke(0);
    ellipse(x_old, y_old, 8, 8);
    stroke(0);
    ellipse(x, y, 8, 8);
    x_old = x;
    y_old = y;

  };
  for (var k = n_pitches; k < spiralDots.length; k++) {
    spiralDots[k][0] = 0;
    spiralDots[k][1] = 0;
  };
};

function drawSyntonicDiatonicCircle(id_scale, xM, yM, r, id_key) {
  var l_sc = synt_scales[id_scale].length;
  id_key = ((id_key % l_sc) + l_sc) % l_sc;
  var phi0 = sobjs[id_scale][id_key].p_cent*TWO_PI/1200;
  var phi = 0;
  fill(99);
  ellipse(xM, yM, 2*r, 2*r);
  strokeWeight(3);
  line(xM, yM, xM + (r-2)*Math.sin(phi0), yM - (r-2)*Math.cos(phi0));
  strokeWeight(1);
  for (var k = 0; k < synt_diat_scale.length; k++) {
    phi = phi0 + posToCent(synt_diat_scale[k][0], synt_diat_scale[k][1])*TWO_PI/1200;
    line(xM, yM, xM + r*Math.sin(phi), yM - r*Math.cos(phi));
  };
};

function setup() {

  // Define variables again:
  //synt_scale_names = ["CHI_53", "Salinas_24", "Salinas_14", "Mersenne 1", "Mersenne 2", "Newton", "Holder", "Euler"]; 
  //t = -1;
  //dt = 20;
  Synthesizer.init();

  var diagramCanvas = createCanvas(700, 400);
  diagramCanvas.parent("diagram");

  frameRate(fr);
  colorMode(HSB, 100);
  ellipseMode(CENTER);
  for (var k = 0; k < synt_scales.length; k++) {
    sobjs[k] = [];
    for (var j = 0; j < synt_scales[k].length; j++) { 
      sobjs[k][j] = new SObj(k, j);
    };
  };
  for (var k = 0; k < n_osc; k++) {
    tones[k] = new Sound();
  };

  chi53To12Tet(myScore);
  /*
  for(var k = 0; k < myScore_12.length; k++){
   printArray(myScore_12[k]);
   }
   */
  println("KEYBOARD: scales");
  for (var k = 0; k < synt_scales.length; k++) {
    println(k, " : ",sobjs[k][0].nm_scale);
  };
  println("KEYBOARD: chords");
  for(var k = 0; k < chordNames.length; k++){
    println(char(97+k), " : ", chordNames[k]);  
  };
  println();
 /*
  for (int k = 0; k < synt_scales.length; k++) {
    println(sobjs[k][0].nm_scale);
    for (int j= 0; j < synt_scales[k].length; j++) {
      println(sobjs[k][j].nm_pitch, sobjs[k][j].p_53, sobjs[k][j].p_12, sobjs[k][j].freq, sobjs[k][j].p_cent);
    };
    println();
  };
  */
  drawSyntScale(3);
  drawPitchSpiral(3, 4, x0_s, y0_s, r0_s, dr_s);
  drawSyntonicDiatonicCircle(3, x0_s, y0_s, r_c, id_c_scoreKey);
};
function draw() {

  if (pl_score == 1) {
    if (id_c_scale == 0) {
      c_score = myScore;
      id_c_scoreKey = id_c_scoreKey_53;
    } else {
      c_score = myScore_12;
      id_c_scoreKey = id_c_scoreKey_12;
    };
    if (id_c_scoreChord < myScore.length) {
      if (t % dt == 0) {
        console.log("id_c_scoreChord", id_c_scoreChord, ": id_c_scoreKey", id_c_scoreKey, 
          "\nc_scorechord: ", c_score[id_c_scoreChord], "id_c_scale", id_c_scale,
          "c_score", c_score[id_c_scoreChord]);
        
        playChord(id_c_scale, id_c_scoreKey, c_score[id_c_scoreChord], 0);
        id_c_scoreChord++;
      };
      t++;
    } else {
      pl_score = 0;
      t = 0;
      id_c_scoreChord = 0;
    };
  };
};

function keyReleased() {
  var id_scale = int(key)-48;
  // println(int(key));
  if (key == '0' || key == '1' || key == '2' || key == '3' || key == '4' || key == '5' || key == '6'  || key == '7') {
    println();
    println(id_scale, sobjs[id_scale][0].nm_scale);
    drawSyntScale(id_scale);
    drawPitchSpiral(id_c_scale, 4, x0_s, y0_s, r0_s, dr_s);
    drawSyntonicDiatonicCircle(id_c_scale, x0_s, y0_s, r_c, id_c_scoreKey);
    fill(99); stroke(0);
    rect(143, 10, 120, 30);
    fill(0); noStroke();
    text(chordNames[id_c_chord], 150, 30);
    stroke(0);
  } else if (97 <= int(key) && int(key) < 97 + chords.length) {
    id_c_chord = int(key) - 97;
    fill(99); stroke(0);
    rect(143, 10, 120, 30);
    fill(0); noStroke(0);
    text(chordNames[id_c_chord], 150, 30);
    stroke(0);
  };
  if (key == 's' && mousePressed == true) save(synt_scale_names[id_c_scale] + "_" + id_c_chord + "_" + id_c_key + ".jpg");
  if (key == '/') {
    if (pl_score == 0) {
      id_c_scoreKey = 0;
      pl_score = 1;
    };
  };
  if (key == ',') {
    if (pl_score == 0) {
      id_c_scoreKey = (id_c_scoreKey + 1) % synt_scales[id_c_scale].length;
      pl_score = 1;
    };
  };
  if (key == ';') {
    if (pl_score == 0) {
      id_c_scoreKey = (id_c_scoreKey - 1) % synt_scales[id_c_scale].length;
      pl_score = 1;
    };
  };
  if (key == '.') {
    for (var k = 0; k < n_osc; k++) stopNote(k);
    pl_score = 0;
    t = 0;
    id_c_scoreChord = 0;
  };
};

function mousePressed() {
  if (btnPressed(0)) {
    id_c_chord = (id_c_chord + 1) % chords.length;
    fill(99); stroke(0);
    rect(btn_pos[0][0], btn_pos[0][1], btn_pos[0][2], btn_pos[0][3]);
    fill(0); noStroke();
    text(chordNames[id_c_chord], btn_pos[0][0] + 7, btn_pos[0][1] + 20);
    stroke(0);
  } else if (btnPressed(1)) {
    id_c_scale = (id_c_scale + 1) % synt_scales.length;
    drawSyntScale(id_c_scale);
    drawPitchSpiral(id_c_scale, 4, x0_s, y0_s, r0_s, dr_s);
    // drawSyntonicDiatonicCircle(id_c_scale, x0_s, y0_s, r_c, id_c_scoreKey);
  } else if (btnPressed(2)) {
    if (pl_score == 0) {
      id_c_scoreChord = 0;
      pl_score = 1;
    } else {pl_score = 0;}
  } else if (btnPressed(3)) {
    if (id_c_scale == 0) {
      id_c_scoreKey_53 = (id_c_scoreKey + 1) % synt_scales[id_c_scale].length;
      id_c_scoreKey_12 = p53Top12(id_c_scoreKey_53);
      id_c_scoreKey = id_c_scoreKey_53;
    } else {
      id_c_scoreKey_12 = (id_c_scoreKey + 1) % synt_scales[id_c_scale].length;
      id_c_scoreKey_53 = pTop53(id_c_scale, id_c_scoreKey_12);
      id_c_scoreKey = id_c_scoreKey_12;
    }
  } else if (btnPressed(4)) {
    var len =  synt_scales[id_c_scale].length;
    if (id_c_scale == 0) {
      id_c_scoreKey_53 = ((id_c_scoreKey - 1) % len + len) % len;
      id_c_scoreKey_12 = p53Top12(id_c_scoreKey_53);
      id_c_scoreKey = id_c_scoreKey_53;
    } else {
      id_c_scoreKey_12 =((id_c_scoreKey - 1) % len + len) % len;
      id_c_scoreKey_53 = pTop53(id_c_scale, id_c_scoreKey_12);
      id_c_scoreKey = id_c_scoreKey_12;
    };
  };
  if (pl_score == 1) {
    fill(80);
  } else {
    fill(99);
  };
  stroke(0);
  rect(btn_pos[2][0], btn_pos[2][1], btn_pos[2][2], btn_pos[2][3]);
  fill(0); noStroke();
  text("JSB: "+ id_c_scoreKey, btn_pos[2][0] + 7, btn_pos[2][1] + 20);
  stroke(0);
  drawSyntonicDiatonicCircle(id_c_scale, x0_s, y0_s, r_c, id_c_scoreKey);

  for (var k = 0; k < synt_scales[id_c_scale].length; k++) {
    var x = x0 + sobjs[id_c_scale][k].xPos*u;
    var y = y0 - sobjs[id_c_scale][k].yPos*u;
    if (dist(x, y, mouseX, mouseY) < 5) {

      console.log(sobjs[id_c_scale][k].nm_pitch, " : k =", k);
      console.log("synth_scales: ",synt_scales[id_c_scale], "- length: ", synt_scales[id_c_scale].length   );

      if (mouseButton == RIGHT) {
        playChord(id_c_scale, k, chords[id_c_chord], 300);
        wait(500);
        playChord(id_c_scale, k, chords[id_c_chord], -300);
      }
      playChord(id_c_scale, k, chords[id_c_chord], 0);
    };
  };

  // for spiral
  for (var k = 0; k < spiralDots.length; k++) {
    if (dist(spiralDots[k][0], spiralDots[k][1], mouseX, mouseY) < 8) {
      playChord(id_c_scale, k, chords[id_c_chord], 0);
    };
  };
};

function mouseReleased() {
  if (pl_score == 0) {
    for (var k = 0; k < n_osc; k++) stopNote(k);
  };
  clearGrid(id_c_scale);
};




