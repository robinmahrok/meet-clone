

import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import faker from 'faker';
import { message } from 'antd';
import 'antd/dist/antd.css';

import 'bootstrap/dist/css/bootstrap.css';
import RoomScreen from '../../screens/RoomScreen';
// import './Video.css';

const server_url = 'https://meet-clone-assignment.netlify.app';

var connections = {};
const peerConnectionConfig = {
  iceServers: [
    // { 'urls': 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};
var socket = null;
var socketId = null;
var elms = 0;

const RoomComponent = () => {
  const localVideoref = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState(faker.internet.userName());

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setVideoAvailable(true))
        .catch(() => setVideoAvailable(false));

      await navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setAudioAvailable(true))
        .catch(() => setAudioAvailable(false));

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
          .then((stream) => {
            window.localStream = stream;
            localVideoref.current.srcObject = stream;
          })
          .catch((e) => console.log(e));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable)
    getUserMedia()
    connectToSocketServer()
  }

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((e) => console.log(e))
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      } catch (e) { }
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          let tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoref.current.srcObject = window.localStream;

        for (let id in connections) {
          connections[id].addStream(window.localStream);

          connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description)
              .then(() => {
                socket.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
              })
              .catch((e) => console.log(e));
          });
        }
      };
    });
  };

  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .catch((e) => console.log(e));
      }
    }
  };

  const silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    let stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketId) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socket.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);

        try {
          let tracks = localVideoref.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoref.current.srcObject = window.localStream;

        getUserMedia();
      };
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === 'offer') {
              connections[fromId].createAnswer().then((description) => {
                connections[fromId].setLocalDescription(description)
                  .then(() => {
                    socket.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                  })
                  .catch((e) => console.log(e));
              }).catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
      }
    }
  };

  const changeCssVideos = (main) => {
    let widthMain = main.offsetWidth;
    let minWidth = '30%';
    if ((widthMain * 30) / 100 < 300) {
      minWidth = '300px';
    }
    let minHeight = '40%';

    let height = `${100 / elms}%`;
    let width = '';
    if (elms === 0 || elms === 1) {
      width = '100%';
      height = '100%';
    } else if (elms === 2) {
      width = '45%';
      height = '100%';
    } else if (elms === 3 || elms === 4) {
      width = '35%';
      height = '50%';
    } else {
      width = `${100 / elms}%`;
    }

    let videos = main.querySelectorAll('video');
    for (let a = 0; a < videos.length; ++a) {
      videos[a].style.minWidth = minWidth;
      videos[a].style.minHeight = minHeight;
      videos[a].style.setProperty('width', width);
      videos[a].style.setProperty('height', height);
    }

    return { minWidth, minHeight, width, height };
  };

  const connectToSocketServer = () => {
    socket = io.connect(server_url, { secure: true });
    console.log(socket,'kkkkkkkkkkkk');
    socket.on('signal', gotMessageFromServer);

    socket.on('connect', () => {
      socketId = socket.id;
      console.log(socketId,'@@socketId');
      socket.emit('join-call', window.location.href)
      socketId = socket.id

      socket.on('chat-message', addMessage)

      socket.on('user-left', (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`);
        if (video !== null) {
          elms--;
          video.parentNode.removeChild(video);

          let main = document.getElementById('main');
          changeCssVideos(main);
        }
      });

      socket.on('user-joined', (id, clients) => {
        console.log(clients,'iiiiiiiiii');
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socket.emit('signal', socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            let searchVideo = document.querySelector(`[data-socket="${socketListId}"]`);
            if (searchVideo !== null) {
              searchVideo.srcObject = event.stream;
            } else {
              elms = clients.length;
              let main = document.getElementById('main')
              let cssMesure = changeCssVideos(main)

              let video = document.createElement('video')

              let css = {
                minWidth: cssMesure.minWidth, minHeight: cssMesure.minHeight, maxHeight: "100%", margin: "10px",
                borderStyle: "solid", borderColor: "#bdbdbd", objectFit: "fill"
              }
              for (let i in css) video.style[i] = css[i]

              video.style.setProperty("width", cssMesure.width)
              video.style.setProperty("height", cssMesure.height)
              video.setAttribute('data-socket', socketListId)
              video.srcObject = event.stream
              video.autoplay = true
              video.playsinline = true

              main.appendChild(video)
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          }
          else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            connections[socketListId].addStream(window.localStream)
          }
        });

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue

            try {
              connections[id2].addStream(window.localStream)
            } catch (e) { }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socket.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                })
                .catch(e => console.log(e))
            })
          }
        }
      });
    });
  };

  const handleVideo = () => {
    setVideo(!video);
    getUserMedia("VIDEO", true);
  };

  const handleAudio = () => {
    setAudio(!audio);
    getUserMedia("AUDIO", true);
  };

  const handleScreen = () => {
    setScreen(!screen);
    getDisplayMedia();
  };

  const handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) { }
    window.location.href = '/';
  };

  const openChat = () => setShowModal(!showModal);

  const closeChat = () => setShowModal(false);

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketId) {
      setNewMessages(prevNewMessages => prevNewMessages + 1);
    }
  }

  const handleUsername = (e) => setUsername(e.target.value);

  const sendMessage = () => {
    socket.emit('chat-message', chatMessage, username);
    setChatMessage('');
    setMessages(prevMessages => [
      ...prevMessages,
      username + ":" + chatMessage,
    ]);
    setNewMessages(newMessages + 1);
  };



  const handleMessage = (e) => setChatMessage(e.target.value);

  const handleUsernameSet = () => {
    setAskForUsername(false);
    connectToSocketServer();
  };

  const copyUrl = () => {
    let text = window.location.href
    if (!navigator.clipboard) {
      let textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        message.success("Link copied to clipboard!")
      } catch (err) {
        message.error("Failed to copy")
      }
      document.body.removeChild(textArea)
      return
    }
    navigator.clipboard.writeText(text).then(function () {
      message.success("Link copied to clipboard!")
    }, () => {
      message.error("Failed to copy")
    })
  }

  const connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  const isChrome = function () {
    let userAgent = (navigator && (navigator.userAgent || '')).toLowerCase()
    let vendor = (navigator && (navigator.vendor || '')).toLowerCase()
    let matchChrome = /google inc/.test(vendor) ? userAgent.match(/(?:chrome|crios)\/(\d+)/) : null
    // let matchFirefox = userAgent.match(/(?:firefox|fxios)\/(\d+)/)
    // return matchChrome !== null || matchFirefox !== null
    return matchChrome !== null
  }


  const props = {
    askForUsername, username, handleUsername, handleUsernameSet, localVideoref, handleVideo, video, handleAudio, audio, handleEndCall,
    screenAvailable, handleScreen, newMessages, openChat, showModal, screen, messages, chatMessage, sendMessage, handleMessage, copyUrl,
    isChrome, connect
  }
  return (
    <RoomScreen {...props} />
  )
};

export default RoomComponent;
