import sounds_webm from './sounds.webm';
import sounds_mp3 from './sounds.mp3';
import { Howl, Howler } from 'howler';
const config = {
  src: [sounds_webm, sounds_mp3],
  sprite: {
    Blip: [0, 2075.170068027211],
    Boop: [4000, 352.380952380952],
    Booster: [6000, 256.5079365079361],
    Bullet: [8000, 152.9705215419508],
    Explosion: [10000, 394.5578231292508],
    Gentl_Shot_Bounce: [12000, 1467.5056689342405],
    Hard_Crunch: [15000, 1659.0476190476195],
    Hard_Pew: [18000, 1042.9931972789107],
    Jet_Pack: [21000, 256.507936507937],
    Land: [23000, 401.4058956916102],
    Scree: [25000, 256.507936507937],
    SmallJump: [27000, 277.2108843537424],
    SmallJump_1: [29000, 292.8571428571445],
    Step: [31000, 119.0476190476204],
    Stomp_Short: [33000, 2188.027210884357],
    Stomp_Short_1: [37000, 1578.6167800453513]
  }
};
const sounds = new Howl(config);
export default sounds;
