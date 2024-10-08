const imageUpload = document.getElementById("upload");
const imageCon = document.getElementById("display-image");

imageUpload.addEventListener("change", function(event){
  const file = event.target.files[0];
  const reader = new FileReader;
  reader.onload = async function(e){
    let imageSrc = e.target.result;
    imageCon.src = imageSrc;
    let colors = getHex(imageCon).filter(innerArray => {
      return !innerArray.every(item => item === 0);
    });
    let colorCode = sumColor(colors);
    let notes = codeToNote(colorCode)
    playNotes(notes)
  }
reader.readAsDataURL(file);
})

function getHex(imgEl){
  let canvas = document.createElement('canvas'),
      context = canvas.getContext && canvas.getContext('2d'),
      data, width, height;
      height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
      width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);  
  try {
    data = context.getImageData(0, 0, width, height);
  } catch(e) {
    console.error('Image render unsuccessfull')
    return
  }
  let rgbValues = [];
  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      let i = (y*width + x) * 4;
      let rgba = [
        data.data[i],
        data.data[i+1],
        data.data[i+2],
        data.data[i+3]
      ]
      rgbValues.push(rgba);
    }
  }
  return rgbValues
}

function sumColor(colors){
  let resultCode = [];
  for(let i in colors){
  let resultValue = [];
  let multiplier = Math.round(((colors[i][3]/255) + Number.EPSILON)*100) / 100
    for(let value = 2; value >= 0; value--){
      let sum = sumDigits(colors[i][value])
      resultValue.unshift(sum)
    }
    resultValue.push(multiplier)
    resultCode.push(resultValue)
  }
  return resultCode
}

function sumDigits(num){
  return num.toString().split("").reduce((sum, digit) =>
      sum + parseInt(digit), 0);
}

const notePossibilities = ["G1", "C2", "C#3", "D4", "D#1", "E2", "F3", "F#4", "G2", "G#1", "A3", "A#4", "B#1", "C1", "C#2", "D3", "D#4", "E1", "F2", "F#3"]
function codeToNote(arr){
  let notes = [];
  for(let i = 0; i < arr.length; i++){
    let result = [];
    for(let j = 0; j < arr[i].length - 1; j++){
      let note = `${notePossibilities[arr[i][j]]}`
      result.push(note)
    }
    notes.push(result)
  }
  return notes
}
const reverb = new Tone.Reverb({
  decay: 2,
  preDelay: 0.01,
}).toDestination();

async function playNotes(notes){
  await Tone.start();
  console.log("start")
  const instrument = new Tone.PolySynth(Tone.Synth).toDestination();
  instrument.connect(reverb);
  let timeOffset = 0;
  notes.forEach(noteSet => { 
    instrument.triggerAttackRelease(noteSet, "8n", timeOffset);
    timeOffset += Tone.Time("8n").toSeconds();
  });
  Tone.Transport.start();
 console.log(notes)
}