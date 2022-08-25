URL = window.URL || window.webkitURL;
var gumStream;
var rec;
var input;
var recordButton = document.getElementById("start-btn");
var stopButton = document.getElementById("stop-btn");
var AudioContext = window.AudioContext || window.webkitAudioContext;
const text = document.getElementById("textBoxContainer");
const btn = document.getElementById("start-btn");
const sbtn = document.getElementById("stop-btn");
var toggle = false;

var speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new webkitSpeechRecognition();
var content = $("#content");
var instructions = $("#instructions");
var textcontent = "";

recognition.continuous = true;

recognition.onresult = function (event) {
  var current = event.resultIndex;
  var transcript = event.results[current][0].transcript;
  const excessTextBox = document.getElementById("textBoxContainer");

  excessTextBox.innerHTML = excessTextBox.innerHTML + transcript;
};
const ShowWave = () => {
    // text.innerText = "";
    // toggle = true;
    ShowWaveFormProgress();
    if (textcontent.length) {
      textcontent += "";
    }
    recognition.start();
};
const showWave = async () => {
    // toggle = false;
    // ShowWaveFormProgress(toggle);
    recognition.stop();
    await sleep(1000);
    window.location.href = "/predict_";
};

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const ShowWaveFormProgress = () => {
  obj = {};
  function init() {
    obj.canvas = document.getElementById("canvas");
    obj.ctx = obj.canvas.getContext("2d");
    obj.width = window.innerWidth * 0.9;
    obj.height = window.innerHeight * 0.9;
    obj.canvas.width = obj.width * window.devicePixelRatio;
    obj.canvas.height = obj.height * window.devicePixelRatio;
    obj.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  function randomInteger(max = 256) {
    return Math.floor(Math.random() * max);
  }
  let timeOffset = 100;
  let now = parseInt(performance.now()) / timeOffset;

  function loop() {
    obj.ctx.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
    let max = 0;
    // if (toggle === true) {
      if (parseInt(performance.now() / timeOffset) > now) {
        now = parseInt(performance.now() / timeOffset);
        obj.analyser.getFloatTimeDomainData(obj.frequencyArray);
        for (var i = 0; i < obj.frequencyArray.length; i++) {
          if (obj.frequencyArray[i] > max) {
            max = obj.frequencyArray[i];
          }
        }

        var freq = Math.floor(max * 650);

        obj.bars.push({
          x: obj.width,
          y: obj.height / 2 - freq / 2,
          height: freq,
          width: 5,
        });
      }
    // }
    draw();
    requestAnimationFrame(loop);
  }

  obj.bars = [];

  function draw() {
    for (i = 0; i < obj.bars.length; i++) {
      const bar = obj.bars[i];
      obj.ctx.fillStyle = `#fff`;
      obj.ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
      bar.x = bar.x - 2;

      if (bar.x < 1) {
        obj.bars.splice(i, 1);
      }
    }
  }
  function soundAllowed(stream) {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContent = new AudioContext();
    var streamSource = audioContent.createMediaStreamSource(stream);

    obj.analyser = audioContent.createAnalyser();
    streamSource.connect(obj.analyser);
    obj.analyser.fftSize = 512;
    obj.frequencyArray = new Float32Array(obj.analyser.fftSize);
    init();
    loop();
  }

  function soundNotAllowed() {}
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(soundAllowed)
    .catch(soundNotAllowed);
};

recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
var audioContext = new AudioContext;
console.log("recordButton clicked");
  var constraints = {
    audio: true,
    video: false,
  };
  audioContext.resume().then(() => {
    console.log("Playback resumed successfully");
  });
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    console.log(
      "getUserMedia() success, stream created, initializing Recorder.js ..."
    );
    /* assign to gumStream for later use */
    gumStream = stream;
    /* use the stream */
    input = audioContext.createMediaStreamSource(stream);
    /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
    rec = new Recorder(input, {
      numChannels: 1,
      // sampleRate: 8000,
    });
    //start the recording process
    rec.record();
    console.log("Recording started");
  });
}
function stopRecording() {
  console.log("stopButton clicked");
  rec.stop(); //stop microphone access
  gumStream.getAudioTracks()[0].stop();
  //create the wav blob and pass it on to createDownloadLink
  rec.exportWAV(createDownloadLink);
}
function createDownloadLink(blob) {
  var url = URL.createObjectURL(blob);
  var au = document.createElement("audio");
  // var li = document.createElement('li');
  var link = document.createElement("a");
  //add controls to the <audio> element
  // au.controls = true;
  // au.src = url;
  //link the a element to the blob
  link.href = url;
  link.download = "output.wav";
  // link.download = new Date().toISOString() + ".wav";
  link.click();
  link.remove();
  // link.innerHTML = link.download;
  // //add the new audio and a elements to the li element
  // li.appendChild(au);
  // li.appendChild(link);
  // //add the li element to the ordered list
  // recordingsList.appendChild(li);
}

