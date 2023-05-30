import * as ws from "./ws.js";
import * as store from "./store.js";

let peerConection = {};
let dataChannel = {};
let clientList = [];
let screenSharingStream;

const configuration = {
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export const handlePreOffer = (data) => {
  const socketId = store.getState().socketId;
  createPeerConnection(data.client_id);
  const answerData = {
    from_client_id: socketId,
    to_client_id: data.client_id,
    room_id: data.room_id,
    username: username.value,
  };
  ws.sendPreOfferAnswer(answerData);
};

export const handlePreOfferAnswer = (data) => {
  createPeerConnection(data.from_client_id);
  sendWebRTCOffer(data);
};

// PC A
export const handleWebRTCOffer = async (data) => {
  console.log("offer from:", data.from_client_id);
  const roomId = store.getState().roomId;
  const socketId = store.getState().socketId;
  const username = store.getState().username;
  const client_id = data.from_client_id;

  await peerConection[client_id].setRemoteDescription(data.offer);
  const answer = await peerConection[client_id].createAnswer();
  await peerConection[client_id].setLocalDescription(answer);

  const dataAnswer = {
    room_id: roomId,
    from_client_id: socketId, // PC A
    to_client_id: client_id, // PC B
    username: username,
    type: "ANSWER",
    answer: answer,
    answerSdp: answer.sdp,
    answerType: answer.type,
  };
  ws.sendDataUsingWebRTCSignaling(dataAnswer);
};

// PC B
export const handleWebRTCAnswer = async (data) => {
  console.log("answer from :", data.from_client_id);
  await peerConection[data.from_client_id].setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
  console.log("connectedUserSocketId :", data.from_client_id);
  try {
    await peerConection[data.from_client_id].addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured when trying to add received ice candidate",
      err
    );
  }
};

export const createPeerConnection = (client_id) => {
  if (!peerConection[client_id]) {
    console.log("creat peer connection for :", client_id);
    peerConection[client_id] = new RTCPeerConnection(configuration);
    clientList.push(client_id);

    console.log("creat dataChannel for :", client_id);
    dataChannel[client_id] = peerConection[client_id].createDataChannel("chat");

    peerConection[client_id].ondatachannel = (event) => {
      dataChannel[client_id] = event.channel;

      dataChannel[client_id].onopen = () => {
        console.log(
          "peer connection is ready to receive data channel messages"
        );
        console.log("******* success ********");
      };

      dataChannel[client_id].onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);
      };
    };

    peerConection[client_id].onicecandidate = (event) => {
      if (event.candidate) {
        // send our ice candidates to other peer
        const socketId = store.getState().socketId;
        const username = store.getState().username;
        const data = {
          from_client_id: socketId,
          to_client_id: client_id,
          username: username,
          type: "ICE_CANDIDATE",
          candidate: event.candidate,
          sdpMid: event.sdpMid,
          sdpMlineIndex: event.sdpMlineIndex,
        };
        ws.sendDataUsingWebRTCSignaling(data);
      }
    };

    //receiving tracks
    const remoteStream = new MediaStream();
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()) {
      peerConection[client_id].addTrack(track, localStream);
    }

    peerConection[client_id].ontrack = (event) => {
      remoteStream.addTrack(event.track);
      // array client stream
      const streamData = {
        client_id: client_id,
        stream: remoteStream,
        track: event.track,
      };
    };

    peerConection[client_id].onconnectionstatechange = (event) => {
      if (peerConection[client_id].connectionState === "connected") {
        console.log("peer connected");
        createRemoteVideo(remoteStream, client_id);
      } else {
        console.log("peer filed");
      }
    };
  }
};

export const handleConnectedUserHangedUp = (client_id) => {
  console.log("Hangedup client_id:", client_id);
  if (peerConection[client_id]) {
    peerConection[client_id].close();
    peerConection[client_id] = null;
    dataChannel[client_id].close();

    // Remove div element
    const element = document.getElementById("col-sm" + client_id);
    element.remove();

    for (var i = 0; i <= peerConection.length - 1; i++) {
      if (peerConection[i]["client_id"] == client_id) {
        peerConection.splice(i, 1);
        console.log("delete peer array");
      }
    }

    for (var i = 0; i <= dataChannel.length - 1; i++) {
      if (dataChannel[i]["client_id"] == client_id) {
        dataChannel.splice(i, 1);
        console.log("delete dataChannel array");
      }
    }

    console.log("peerConection Close");
  }
};

// PC B
const sendWebRTCOffer = async (data) => {
  console.log("create offer to :", data.from_client_id);
  const roomId = store.getState().roomId;
  const socketId = store.getState().socketId;
  const username = store.getState().username;
  const client_id = data.from_client_id;

  const offer = await peerConection[client_id].createOffer();
  await peerConection[client_id].setLocalDescription(offer);

  const sendData = {
    room_id: roomId,
    from_client_id: socketId, // PC B
    to_client_id: client_id, // PC A
    username: username,
    type: "OFFER",
    offer: offer,
    offerSdp: offer.sdp,
    offerType: offer.type,
  };

  // kirim offer ke PC A
  ws.sendDataUsingWebRTCSignaling(sendData);
};

const createRemoteVideo = async (stream, client_id) => {
  console.log("Create Remote Video");

  var videoFrame = document.createElement("div");
  videoFrame.className = "col-md-3 col-sm-3 col-xs-12 my-2";
  videoFrame.id = "col-sm" + client_id;

  let newVid = document.createElement("video");
  newVid.srcObject = stream;
  newVid.id = "participant_video_" + client_id;
  newVid.playsinline = false;
  newVid.autoplay = true;
  newVid.className = "local-video";
  videoFrame.appendChild(newVid);
  var videoContainer = document.getElementById("video-container");
  videoContainer.appendChild(videoFrame);
};

// Switch Camera
var deviceId = 0;
export const switchVideoCamera = async () => {
  const localVideo = document.getElementById("local-video");

  var videoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(
    (device) => device.kind === "videoinput"
  );
  console.log(videoDevices);
  deviceId++;

  if (deviceId >= videoDevices.length) deviceId = 0;
  var constraints = {
    audio: true,
    video: { deviceId: { exact: videoDevices[deviceId].deviceId } , video: {facingMode: 'environment'}},
  };

  var newStream = await navigator.mediaDevices.getUserMedia(constraints);

  localVideo.srcObject = newStream;

  clientList.forEach((participant_id) => {
    console.log(participant_id);
    var videoSender = peerConection[participant_id]
      .getSenders()
      .filter((sender) => sender.track.kind === "video")[0];
    videoSender.replaceTrack(newStream.getVideoTracks()[0]);
  });
};

export const switchBetweenCameraAndScreenSharing = async () => {
  try {
    console.log("Screen Sharing");
    let screenSharingActive = store.getState().screenSharingActive;
    const startShare = "/assets/img/icons/micOn.png";
    const stopShare = "/assets/img/icons/micOff.png";

    if (screenSharingActive) {
      const localStream = store.getState().localStream;
      clientList.forEach((participant_id) => {
        console.log("participant_id :", participant_id);
        const senders = peerConection[participant_id].getSenders();

        const sender = senders.find((sender) => {
          return sender.track.kind === localStream.getVideoTracks()[0].kind;
        });

        if (sender) {
          sender.replaceTrack(localStream.getVideoTracks()[0]);
        }
      });

      // stop screen sharing stream
      store
        .getState()
        .screenSharingStream.getTracks()
        .forEach((track) => track.stop());
        document.getElementById("share-button").className = "call_button_small" ;
        document.querySelector('#share-button').innerHTML  = "<img src='/assets/img/icons/share.png'/>";
    } else {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.setScreenSharingStream(screenSharingStream);

      // event button stop share
      screenSharingStream.getVideoTracks()[0].onended = function () {
        console.log("Stop shared");

        const localStream = store.getState().localStream;
        clientList.forEach((participant_id) => {
          console.log("participant_id :", participant_id);
          const senders = peerConection[participant_id].getSenders();

          const sender = senders.find((sender) => {
            return sender.track.kind === localStream.getVideoTracks()[0].kind;
          });

          if (sender) {
            sender.replaceTrack(localStream.getVideoTracks()[0]);
          }
        });

        // stop screen sharing stream
        store
          .getState()
          .screenSharingStream.getTracks()
          .forEach((track) => track.stop());
          document.getElementById("share-button").className = "call_button_small" ;
          document.querySelector('#share-button').innerHTML  = "<img src='/assets/img/icons/share.png'/>";
      };

      clientList.forEach((participant_id) => {
        console.log("item: ", participant_id);
        const senders = peerConection[participant_id].getSenders();
        const sender = senders.find((sender) => {
          return (
            sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
          );
        });

        if (sender) {
          sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
          //socketIO.emit("screen-sharing", shareClientId);
        }
      });

      document.getElementById("share-button").className = "share-button" ;
      document.querySelector('#share-button').innerText = 'Stop Sharing';
    }
    //updateLocalVideo(screenSharingStream);
    store.setScreenSharingActive(!screenSharingActive);

    //updateLocalVideo(screenSharingStream);
  } catch (err) {
    console.error(
      "error occured when trying to get screen sharing stream",
      err
    );
  }
};

export const updateLocalVideo = (stream) => {
  // const remote_video = document.getElementById("remote_video");
  // remote_video.srcObject = stream;
  // remote_video.addEventListener("loadedmetadata", () => {
  //   remote_video.play();
  // });
};
