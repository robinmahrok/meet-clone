import React from 'react';
import './HomeScreen.css'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const HomeScreen = (props) => {
    const { handleChange, join} = props
    return (
        <div className="container2">
        
        <div>
          <h1 style={{ fontSize: "45px" }}>Video Meeting</h1>
          <p style={{ fontWeight: "200" }}>Video conference website that lets you stay in touch with all your friends.</p>
        </div>
  
        <div style={{
          background: "white", width: "30%", height: "auto", padding: "20px", minWidth: "400px",
          textAlign: "center", margin: "auto", marginTop: "100px"
        }}>
          <p style={{ margin: 0, fontWeight: "bold", paddingRight: "50px" }}>Start or join a meeting</p>
          <TextField placeholder="URL" onChange={handleChange} />
          <Button variant="contained" color="primary" onClick={join} style={{ margin: "20px" }}>Go</Button>
        </div>
      </div>
    );
};

export default HomeScreen;
