import React from 'react';
import './HomeScreen.css'

const HomeScreen = (props) => {
    const { roomId, setRoomId, handleJoin } = props
    return (
        <div className="homepage">
            <h1>Google Meet Clone</h1>
            <input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={handleJoin}>Join Meeting</button>
        </div>
    );
};

export default HomeScreen;
