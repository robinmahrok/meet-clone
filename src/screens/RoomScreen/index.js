import React from 'react';
import './RoomScreen.css'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { IconButton, Badge } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';

import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.css';

const RoomScreen = (props) => {
    const { askForUsername, username, handleUsername, handleUsernameSet, localVideoref, handleVideo, video, handleAudio, audio, handleEndCall,
        screenAvailable, handleScreen, newMessages, openChat, showModal, screen, messages, message, sendMessage, handleMessage
    } = props

    return (
        <div>
            {askForUsername ? (
                <div>
                    <div className="container">
                        <div style={{ textAlign: 'center', margin: '20px' }}>
                            <TextField placeholder="Set your username" value={username} onChange={handleUsername} />
                            <Button variant="contained" color="primary" onClick={handleUsernameSet}>
                                Set Username
                            </Button>
                        </div>
                    </div>
                </div>
            ) :
                <div>
                    <div className="container">
                        <div style={{ textAlign: 'center', margin: '10px' }}>
                            <h3>Video Chat</h3>
                        </div>

                        <div id="main" className="flex-container">
                            <video id="my-video" ref={localVideoref} autoPlay muted style={{ borderStyle: 'solid', borderColor: '#bdbdbd', objectFit: 'fill', width: '100%', height: '100%' }}></video>
                        </div>

                        <div className="row center-xs">
                            <div className="col-xs-3">
                                <IconButton onClick={handleVideo}>
                                    {video ? <VideocamIcon /> : <VideocamOffIcon />}
                                </IconButton>
                            </div>
                            <div className="col-xs-3">
                                <IconButton onClick={handleAudio}>
                                    {audio ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                            </div>
                            {screenAvailable && (
                                <div className="col-xs-3">
                                    <IconButton onClick={handleScreen}>
                                        {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                    </IconButton>
                                </div>
                            )}
                            <div className="col-xs-3">
                                <Badge badgeContent={newMessages} max={999} color="secondary" onClick={openChat}>
                                    <IconButton>
                                        <ChatIcon />
                                    </IconButton>
                                </Badge>
                            </div>
                            <div className="col-xs-3">
                                <IconButton onClick={handleEndCall} style={{ color: 'red' }}>
                                    <CallEndIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>

                    <Modal show={showModal} onHide={openChat} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">Chat</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div style={{ height: '60vh', overflowY: 'auto' }}>
                                {messages.length > 0 &&
                                    messages.map((msg, index) => (
                                        <div key={index} style={{ margin: '10px' }}>
                                            <strong>{msg.split(':')[0]}:</strong> {msg.split(':')[1]}
                                        </div>
                                    ))}
                            </div>
                            <div style={{ display: 'flex', marginTop: '20px' }}>
                                <TextField placeholder="Message..." value={message} onChange={(e) => handleMessage(e)} onKeyDown={(e) => (e.key === 'Enter' ? sendMessage() : null)} />
                                <Button variant="contained" color="primary" onClick={sendMessage} style={{ marginLeft: '10px' }}>
                                    Send
                                </Button>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            }
        </div>

    );
};

export default RoomScreen;
