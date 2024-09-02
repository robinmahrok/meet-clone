import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeComponent from './components/Home';
import RoomComponent from './components/Room';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/room/:roomId" element={<RoomComponent />} />
      </Routes>
    </Router>
  );
};

export default App;
