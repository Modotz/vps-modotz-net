import * as ws from "./ws.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as store from "./store.js";

const localVideo = document.getElementById("local-video");
const imageMicButton = document.getElementById("image-mic-button");
const micOnImgSrc = "/assets/img/icons/micOn.png";
const micOffImgSrc = "/assets/img/icons/micOff.png";

const micButton = document.getElementById("mic-button");
const switchCameraButton = document.getElementById("switch-camera-button");
const shareButton = document.getElementById("share-button");
const hangupButton = document.getElementById("hangup-button");

micButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  imageMicButton.src = micEnabled ? micOffImgSrc : micOnImgSrc;
});

switchCameraButton.addEventListener("click", () => {
  webRTCHandler.switchVideoCamera();
});

shareButton.addEventListener("click", () => {
    webRTCHandler.switchBetweenCameraAndScreenSharing();
});

hangupButton.addEventListener("click", () => {
    window.location = "/";
});
