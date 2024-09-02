import React from 'react';
import './RoomScreen.css'
import VideoScreen from '../VideoScreen';
import ControlScreen from '../ControlsScreen';

const RoomScreen = (props) => {
    const { myVideoRef, peers, myStream } = props

    return (
        <div className="room-container">
            <video ref={myVideoRef} autoPlay playsInline />
            {peers.map((peer, index) => (
                <VideoScreen key={index} peer={peer} muted={false} />
            ))}
            <ControlScreen myStream={myStream} />
        </div>
    );
};

export default RoomScreen;
