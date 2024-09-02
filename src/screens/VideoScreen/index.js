import React, { useRef, useEffect } from 'react';

const VideoScreen = (props) => {
    const { peer, videoRef, isMuted } = props;
    const ref = useRef();

    useEffect(() => {
        peer.on('stream', (stream) => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
    }, [peer]);

    return (
        <video ref={videoRef || ref} autoPlay playsInline muted={isMuted} />
    );
};

export default VideoScreen;
