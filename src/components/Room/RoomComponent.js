import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import RoomScreen from '../../screens/RoomScreen';
import SimplePeer from 'simple-peer';
import { useParams } from 'react-router-dom';
const socket = io('http://localhost:5000'); // Replace with your server's URL

const RoomComponent = ({ match }) => {
  const [myStream, setMyStream] = useState(null);
  const [peers, setPeers] = useState([]);
  const myVideoRef = useRef(null);
  const peersRef = useRef([]);
  const { roomId } = useParams();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        socket.emit('join-room', roomId);

        socket.on('all-users', (users) => {
          const peers = [];
          users.forEach((userId) => {
            const peer = createPeer(userId, socket.id, stream);
            peersRef.current.push({
              peerID: userId,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socket.on('user-joined', ({ signal, callerID }) => {
          const peer = addPeer(signal, callerID, stream);
          peersRef.current.push({
            peerID: callerID,
            peer,
          });
          setPeers((users) => [...users, peer]);
        });

        socket.on('receiving-returned-signal', ({ signal, id }) => {
          const item = peersRef.current.find((p) => p.peerID === id);
          if (item) {
            item.peer.signal(signal);
          }
        });

        socket.on('user-disconnected', (userId) => {
          const peerObj = peersRef.current.find((p) => p.peerID === userId);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const updatedPeers = peersRef.current.filter((p) => p.peerID !== userId);
          peersRef.current = updatedPeers;
          setPeers(updatedPeers.map(p => p.peer));
        });
      })
      .catch((error) => console.error('Error accessing media devices.', error));
  }, [roomId]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('sending-signal', { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('returning-signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
    <RoomScreen myVideoRef={myVideoRef} peers={peers} myStream={myStream} />
  );
};

export default RoomComponent;
