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
    const { askForUsername, username, handleUsername, localVideoref, handleVideo, video, handleAudio, audio, handleEndCall,
        screenAvailable, handleScreen, newMessages, openChat, showModal, screen, messages, chatMessage, sendMessage, handleMessage,
        copyUrl, connect, isChrome
    } = props

    return (
        <div>
            {isChrome() === false ?
                <div style={{
                    background: "white", width: "30%", height: "auto", padding: "20px", minWidth: "400px",
                    textAlign: "center", margin: "auto", marginTop: "50px", justifyContent: "center"
                }}>
                    <h1>Sorry, this works only with Google Chrome</h1>
                </div> :
                askForUsername ? (
                    <div>
                        <div style={{
                            background: "white", width: "30%", height: "auto", padding: "20px", minWidth: "400px",
                            textAlign: "center", margin: "auto", marginTop: "50px", justifyContent: "center"
                        }}>
                            <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>Set your username</p>
                            <TextField placeholder="Username" value={username} onChange={e => handleUsername(e)} />
                            <Button variant="contained" color="primary" onClick={connect} style={{ margin: "20px" }}>Connect</Button>
                        </div>
                        <div style={{ justifyContent: "center", textAlign: "center", paddingTop: "40px" }}>
							<video id="my-video" ref={localVideoref} autoPlay muted style={{
								borderStyle: "solid",borderColor: "#bdbdbd",objectFit: "fill",width: "60%",height: "30%"}}></video>
						</div>
                    </div>
                ) :
                    <div>
                        <div className="container">
                            <div style={{ textAlign: 'center', margin: '10px' }}>
                                <h3>Video Chat</h3>
                            </div>
                            <div style={{ paddingTop: "20px" }}>
                                <TextField value={window.location.href} disable="true"></TextField>
                                <Button style={{
                                    backgroundColor: "#3f51b5", color: "whitesmoke", marginLeft: "20px",
                                    marginTop: "10px", width: "120px", fontSize: "10px"
                                }} onClick={copyUrl}>Copy invite link</Button>
                            </div>

                            <div id="main" className="flex-container">
                                <video id="my-video" ref={localVideoref} autoPlay muted style={{ borderStyle: 'solid', borderColor: '#bdbdbd', objectFit: 'fill', width: '70%', height: '100%' }}></video>
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
                                               {typeof msg == 'string' && <><strong>{msg.split(':')[0]}:</strong> {msg.split(':')[1]}</>}
                                            </div>
                                        ))}
                                </div>
                                <div style={{ display: 'flex', marginTop: '20px' }}>
                                    <TextField placeholder="Message..." value={chatMessage} onChange={(e) => handleMessage(e)} onKeyDown={(e) => (e.key === 'Enter' ? sendMessage() : null)} />
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
