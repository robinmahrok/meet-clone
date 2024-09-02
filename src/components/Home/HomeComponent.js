import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeScreen from '../../screens/HomeScreen';
const HomeComponent = () => {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (roomId.trim()) {
            navigate(`/room/${roomId}`);
        }
    };

    return (
        <HomeScreen
            roomId={roomId}
            setRoomId={setRoomId}
            handleJoin={handleJoin}
        />
    );
};

export default HomeComponent;
