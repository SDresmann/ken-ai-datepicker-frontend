import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const API_URL = 'https://ken-ai-datepicker-backend.onrender.com' || 'http://localhost:5000';

function App() {
  const [classDate, setClassDate] = useState(null);

  // Keep the latest date in a ref so the HubSpot listener always sees it
  const classDateRef = useRef(null);
  classDateRef.current = classDate;

  const bookDate = () => {
    if (!classDateRef.current) return;

    const date = moment(classDateRef.current).format('YYYY-MM-DD');
    axios.post(`${API_URL}/api/bookings`, { date })
      .then(response => console.log('Booked:', response.data))
      .catch(error => console.error('Error booking date:', error));
  };

  // Fire the booking when the HubSpot form on the host page is submitted
  useEffect(() => {
    const onMessage = (event) => {
      if (
        event.data?.type === 'hsFormCallback' &&
        event.data?.eventName === 'onFormSubmitted'
      ) {
        bookDate();
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const isAllowedDate = (date) => {
    const day = date.getDay();
    return day >= 2 && day <= 5;
  };

  return (
    <div>
      <DatePicker
        selected={classDate}
        onChange={(d) => setClassDate(d)}
        dateFormat="yyyy/MM/dd"
        filterDate={isAllowedDate}
        className="form-control"
        placeholderText="Select a date"
        required
      />
    </div>
  );
}

export default App;
