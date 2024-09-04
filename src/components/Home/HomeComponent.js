import React, { useState } from 'react';
import HomeScreen from '../../screens/HomeScreen';
const HomeComponent = () => {
    const [url, setUrl] = useState('');

    const handleChange = (e) => setUrl(e.target.value);
  
    const join = () => {
      if (url !== '') {
        const urlParts = url.split('/');
        window.location.href = `/${urlParts[urlParts.length - 1]}`;
      } else {
        const randomUrl = Math.random().toString(36).substring(2, 7);
        window.location.href = `/${randomUrl}`;
      }
    };
  
    return (
    <HomeScreen join={join} handleChange={handleChange}/>
    );
};

export default HomeComponent;
