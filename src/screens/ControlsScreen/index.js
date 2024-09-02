import React, { useState } from 'react';
import './ControlsScreen.css'
const ControlScreen = ({ myStream }) => {
    const [isMuted, setIsMuted] = useState(false);

    const toggleMute = () => {
        if (myStream) {
            myStream.getAudioTracks()[0].enabled = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="control-container">
            <button onClick={toggleMute}>
                {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button onClick={() => window.location.href = '/'}>
                End Call
            </button>
        </div>
    );
};

export default ControlScreen;
