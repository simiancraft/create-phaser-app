
import sounds_webm from './sounds.webm';
import sounds_mp3 from './sounds.mp3';
import {Howl, Howler} from 'howler';
const config = {
  "src": [
    sounds_webm,
    sounds_mp3
  ],
  "sprite": {
    "Blip": [
      0,
      2075.170068027211
    ],
    "Booster": [
      4000,
      256.5079365079361
    ],
    "Bullet": [
      6000,
      153.06122448979576
    ],
    "Gentl_Shot_Bounce": [
      8000,
      1467.5056689342405
    ],
    "Hard_Crunch": [
      11000,
      1659.0476190476195
    ],
    "Hard_Pew": [
      14000,
      1042.9931972789107
    ],
    "Jet_Pack": [
      17000,
      256.507936507937
    ],
    "scree": [
      19000,
      256.507936507937
    ],
    "Step": [
      21000,
      119.11564625850346
    ],
    "Stomp_Short": [
      23000,
      2188.0272108843533
    ],
    "Stomp_Short_1": [
      27000,
      1578.6167800453513
    ]
  }
};
const sounds = new Howl(config)
export default sounds;
