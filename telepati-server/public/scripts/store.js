let state = {
    roomId: null,
    socketId: null,
    username: null,
    localStream: null,
    remoteStream: null,
    screenSharingActive: false,
    screenSharingStream: null,
  };

  export const setRoomId = (roomId) => {
    state = {
      ...state,
      roomId,
    };
  };
  
  export const setSocketId = (socketId) => {
    state = {
      ...state,
      socketId,
    };
  };

  export const setUsername = (username) => {
    state = {
      ...state,
      username,
    };
  };
  
  export const setLocalStream = (stream) => {
    state = {
      ...state,
      localStream: stream,
    };
  };
  
  export const setRemoteStream = (stream) => {
    state = {
      ...state,
      remoteStream: stream,
    };
  };
  
  export const getState = () => {
    return state;
  };
  
  
  export const setScreenSharingActive = (screenSharingActive) => {
    state = {
      ...state,
      screenSharingActive,
    };
  };
  
  export const setScreenSharingStream = (stream) => {
    state = {
      ...state,
      screenSharingStream: stream,
    };
  };