import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as store from "./store.js";

let socketIO = null;
let myClientId;

export const registerSocketEvents = (socket, client_share) => {
  socketIO = socket;

  socket.on("connect", () => {
    myClientId = socket.id;
    store.setSocketId(socket.id);
    console.log("my socket id :", socket.id);
    document.getElementById("client-id").value = socket.id;
  });

  //PCA
  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  //PCB
  socket.on("#pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });

  socket.on("webRTC-signaling", (data) => {
    switch (data.type) {
      case "OFFER":
        console.log("---------handle offer--------");
        console.log(data);
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case "ANSWER":
        console.log("---------handle answer--------");
        console.log(data);
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case "ICE_CANDIDATE":
        //  console.log("---------handle ice candidate--------");
        //  console.log(data);
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });

  socket.on("#screen-sharing", (client_id) => {
    console.log('share:', client_id);
  });

  socket.on("user-hanged-up", (client_id) => {
    webRTCHandler.handleConnectedUserHangedUp(client_id);
  });

};

export const JoinRoom = (roomId, username) => {
  const data = {
    client_id: myClientId,
    room_id: roomId,
    username: username,
  };
  socketIO.emit("join-room", data);
};

export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer", data);
};

export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit("webRTC-signaling", data);
};
