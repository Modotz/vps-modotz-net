import * as store from "./store.js";
import * as ws from "./ws.js";

let constraints = {
  audio: true,
  video: {
    width: {
      max: 1280,
    },
    height: {
      max: 720,
    },
  },
};

const localVideo = document.getElementById("local-video");
const getName = document.getElementById("get-name");
const roomId = document.getElementById("room-id");
const clientId = document.getElementById("client-id");
const username = document.getElementById("username");

function init() {
  const socket = io("/");
  ws.registerSocketEvents(socket, null);
}

function start() {
  init();
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    localVideo.srcObject = stream;
    store.setLocalStream(stream);
    store.setRoomId(roomId.value);
    store.setUsername(username.value);
  });
}

const btnJoinMeeting = document.getElementById("btn-join-meeting");
btnJoinMeeting.addEventListener("click", () => {
  $.ajax({
    type: "POST",
    url: "joinMeeting",
    data: {
      room_id: roomId.value,
      client_id: clientId.value,
      username: username.value,
    },
  })
    .done(function (response) {
      ws.JoinRoom(roomId.value);
      hideElement(getName);
    })
    .fail(function (error) {
      alert(error.responseText);
    });
});

const hideElement = (element) => {
  if (!element.classList.contains("display_none")) {
    element.classList.add("display_none");
  }
};

start();
