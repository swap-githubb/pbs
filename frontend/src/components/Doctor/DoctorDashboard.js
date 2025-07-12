// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { Container, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
// import api from '../../utils/api';
// import moment from 'moment';

// function DoctorDashboard() {
//   const [availability, setAvailability] = useState({ city: '', state: '', schedule: {} });
//   const [appointments, setAppointments] = useState([]);
//   const [message, setMessage] = useState('');

//   const doctorToken = localStorage.getItem('doctorToken');

//   // Generate next 7 days
//   const nextSevenDays = Array.from({ length: 7 }, (_, i) =>
//     moment().add(i, 'days').format('YYYY-MM-DD')
//   );

//   const timeSlots = [
//     { id: 'slot1', label: '11am-1pm' },
//     { id: 'slot2', label: '3pm-5pm' },
//     { id: 'slot3', label: '5pm-7pm' }
//   ];

//   // Load doctor profile and appointments
//   const fetchDoctorProfile = useCallback(async () => {
//     try {
//       const res = await api.get('/doctors/profile', { headers: { Authorization: `Bearer ${doctorToken}` } });
//       setAvailability({
//         city: res.data.city || '',
//         state: res.data.state || '',
//         schedule: res.data.schedule || {}
//       });
//     } catch (err) {
//       console.error('Failed to fetch doctor profile', err);
//     }
//   }, [doctorToken]);

//   const fetchAppointments = useCallback(async () => {
//     try {
//       const res = await api.get('/doctors/appointments', { headers: { Authorization: `Bearer ${doctorToken}` } });
//       setAppointments(res.data.appointments);
//     } catch (err) {
//       console.error('Failed to fetch appointments', err);
//     }
//   }, [doctorToken]);

//   useEffect(() => {
//     fetchDoctorProfile();
//     fetchAppointments();
//   }, [fetchDoctorProfile, fetchAppointments]);

//   // Handle availability form
//   const handleChange = (e) => {
//     setAvailability({ ...availability, [e.target.name]: e.target.value });
//   };

//   const handleAvailabilityChange = (date, slot, checked) => {
//     setAvailability(prev => {
//       const newSchedule = { ...prev.schedule };
//       if (!newSchedule[date]) newSchedule[date] = [];
//       if (checked) {
//         if (!newSchedule[date].includes(slot)) newSchedule[date].push(slot);
//       } else {
//         newSchedule[date] = newSchedule[date].filter(s => s !== slot);
//       }
//       return { ...prev, schedule: newSchedule };
//     });
//   };

//   const updateAvailability = async () => {
//     try {
//       await api.post('/doctors/availability', availability, { headers: { Authorization: `Bearer ${doctorToken}` } });
//       setMessage('Availability updated successfully.');
//     } catch (err) {
//       setMessage('Failed to update availability.');
//     }
//   };

//   // Split appointments
//   const { upcomingAppointments, pastAppointments } = useMemo(() => {
//     const today = moment().startOf('day');
//     const upcoming = [];
//     const past = [];
//     appointments.forEach(app => {
//       const appDate = moment(app.date, 'YYYY-MM-DD');
//       if (appDate.isSameOrAfter(today)) upcoming.push(app);
//       else past.push(app);
//     });
//     return { upcomingAppointments: upcoming, pastAppointments: past };
//   }, [appointments]);

//   return (
//     <Container className="mt-5">
//       <h2>Your Dashboard</h2>
//       {message && <Alert variant="info">{message}</Alert>}

//       <h4 className="mt-4">Update your availability details</h4>
//       <Form>
//         <Row>
//           <Col md={6}>
//             <Form.Group controlId="city">
//               <Form.Label>City </Form.Label>
//               <Form.Control
//                 type="text"
//                 name="city"
//                 value={availability.city}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//           </Col>
//           <Col md={6}>
//             <Form.Group controlId="state">
//               <Form.Label>State</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="state"
//                 value={availability.state}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//           </Col>
//         </Row>
//         <h5 className="mt-4">Select Available Time Slots:</h5>
//         {nextSevenDays.map(date => (
//           <div key={date} className="mb-3">
//             <strong>{date}</strong>
//             <div>
//               {timeSlots.map(slot => (
//                 <Form.Check
//                   inline
//                   key={`${date}-${slot.id}`}
//                   label={slot.label}
//                   type="checkbox"
//                   checked={availability.schedule[date]?.includes(slot.label)}
//                   onChange={e => handleAvailabilityChange(date, slot.label, e.target.checked)}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}
//         <Button variant="primary" onClick={updateAvailability} className="mb-4">
//           Update Availability
//         </Button>
//       </Form>

//       <h4>Upcoming Appointments</h4>
//       {upcomingAppointments.length > 0 ? (
//         <Table striped bordered hover>
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Time</th>
//               <th>Patient Name</th>
//             </tr>
//           </thead>
//           <tbody>
//             {upcomingAppointments.map(app => (
//               <tr key={app._id}>
//                 <td>{app.date}</td>
//                 <td>{app.time}</td>
//                 <td>{app.patientName}</td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       ) : (
//         <p>No upcoming appointments.</p>
//       )}

//       <h4 className="mt-4">Past Appointments</h4>
//       {pastAppointments.length > 0 ? (
//         <Table striped bordered hover>
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Time</th>
//               <th>Patient Name</th>
//             </tr>
//           </thead>
//           <tbody>
//             {pastAppointments.map(app => (
//               <tr key={app._id}>
//                 <td>{app.date}</td>
//                 <td>{app.time}</td>
//                 <td>{app.patientName}</td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       ) : (
//         <p>No past appointments.</p>
//       )}
//     </Container>
//   );
// }

// export default DoctorDashboard;



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import moment from 'moment';

function DoctorDashboard() {
  const [availability, setAvailability] = useState({ city: '', state: '', schedule: {} });
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const doctorToken = localStorage.getItem('doctorToken');

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    navigate('/');
  };

  // Generate next 7 days
  const nextSevenDays = Array.from({ length: 7 }, (_, i) =>
    moment().add(i, 'days').format('YYYY-MM-DD')
  );

  const timeSlots = [
    { id: 'slot1', label: '11am-1pm' },
    { id: 'slot2', label: '3pm-5pm' },
    { id: 'slot3', label: '5pm-7pm' }
  ];

  // Load doctor profile and appointments
  const fetchDoctorProfile = useCallback(async () => {
    try {
      const res = await api.get('/doctors/profile', { headers: { Authorization: `Bearer ${doctorToken}` } });
      setAvailability({
        city: res.data.city || '',
        state: res.data.state || '',
        schedule: res.data.schedule || {}
      });
    } catch (err) {
      console.error('Failed to fetch doctor profile', err);
    }
  }, [doctorToken]);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get('/doctors/appointments', { headers: { Authorization: `Bearer ${doctorToken}` } });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  }, [doctorToken]);

  useEffect(() => {
    fetchDoctorProfile();
    fetchAppointments();
  }, [fetchDoctorProfile, fetchAppointments]);

  // Handle availability form
  const handleChange = (e) => {
    setAvailability({ ...availability, [e.target.name]: e.target.value });
  };

  const handleAvailabilityChange = (date, slot, checked) => {
    setAvailability(prev => {
      const newSchedule = { ...prev.schedule };
      if (!newSchedule[date]) newSchedule[date] = [];
      if (checked) {
        if (!newSchedule[date].includes(slot)) newSchedule[date].push(slot);
      } else {
        newSchedule[date] = newSchedule[date].filter(s => s !== slot);
      }
      return { ...prev, schedule: newSchedule };
    });
  };

  const updateAvailability = async () => {
    try {
      await api.post('/doctors/availability', availability, { headers: { Authorization: `Bearer ${doctorToken}` } });
      setMessage('Availability updated successfully.');
    } catch (err) {
      setMessage('Failed to update availability.');
    }
  };

  // Split appointments
  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const today = moment().startOf('day');
    const upcoming = [];
    const past = [];
    appointments.forEach(app => {
      const appDate = moment(app.date, 'YYYY-MM-DD');
      if (appDate.isSameOrAfter(today)) upcoming.push(app);
      else past.push(app);
    });
    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Your Dashboard</h2>
        </Col>
        <Col className="text-end">
          <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
        </Col>
      </Row>
      
      {message && <Alert variant="info">{message}</Alert>}

      <h4 className="mt-4">Update your availability details</h4>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group controlId="city">
              <Form.Label>City </Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={availability.city}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="state">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                name="state"
                value={availability.state}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <h5 className="mt-4">Select Available Time Slots:</h5>
        {nextSevenDays.map(date => (
          <div key={date} className="mb-3">
            <strong>{date}</strong>
            <div>
              {timeSlots.map(slot => (
                <Form.Check
                  inline
                  key={`${date}-${slot.id}`}
                  label={slot.label}
                  type="checkbox"
                  checked={availability.schedule[date]?.includes(slot.label)}
                  onChange={e => handleAvailabilityChange(date, slot.label, e.target.checked)}
                />
              ))}
            </div>
          </div>
        ))}
        <Button variant="primary" onClick={updateAvailability} className="mb-4">
          Update Availability
        </Button>
      </Form>

      <h4>Upcoming Appointments</h4>
      {upcomingAppointments.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient Name</th>
            </tr>
          </thead>
          <tbody>
            {upcomingAppointments.map(app => (
              <tr key={app._id}>
                <td>{app.date}</td>
                <td>{app.time}</td>
                <td>{app.patientName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No upcoming appointments.</p>
      )}

      <h4 className="mt-4">Past Appointments</h4>
      {pastAppointments.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient Name</th>
            </tr>
          </thead>
          <tbody>
            {pastAppointments.map(app => (
              <tr key={app._id}>
                <td>{app.date}</td>
                <td>{app.time}</td>
                <td>{app.patientName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No past appointments.</p>
      )}
    </Container>
  );
}

export default DoctorDashboard;