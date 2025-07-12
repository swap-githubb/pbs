import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Form, Button, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import moment from 'moment';

function PatientDashboard() {
  const [searchCriteria, setSearchCriteria] = useState({ city: '', state: '', speciality: '', name: '' });
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ date: '', time: '' });
  const [doctorBookedSlots, setDoctorBookedSlots] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const patientToken = localStorage.getItem('patientToken');

  const handleLogout = () => {
    localStorage.removeItem('patientToken');
    navigate('/');
  };

  // Handlers
  const handleSearchChange = (e) => {
    setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });
  };
  const searchDoctors = async () => {
    try {
      const res = await api.get('/doctors/search', { params: searchCriteria });
      setDoctors(res.data.doctors);
    } catch (err) { console.error('Search failed', err); }
  };
  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get('/patients/appointments', { headers: { Authorization: `Bearer ${patientToken}` } });
      setAppointments(res.data.appointments);
    } catch (err) { console.error('Failed to fetch appointments', err); }
  }, [patientToken]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const fetchDoctorBookedSlots = async (doctorId) => {
    try {
      const res = await api.get(`/appointments/doctor/${doctorId}`, { headers: { Authorization: `Bearer ${patientToken}` } });
      const booked = {};
      res.data.appointments.forEach(app => {
        if (!booked[app.date]) booked[app.date] = [];
        booked[app.date].push(app.time);
      });
      setDoctorBookedSlots(booked);
    } catch (err) { console.error('Failed to fetch booked slots', err); }
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingDetails({ date: '', time: '' });
    setDoctorBookedSlots({});
    fetchDoctorBookedSlots(doctor._id);
  };

  const filteredSchedule = useMemo(() => {
    if (!selectedDoctor?.schedule) return [];

    // Use moment.js for reliable date handling
    const today = moment().startOf('day');
    const maxDate = moment().add(7, 'days').endOf('day');

    return Object.entries(selectedDoctor.schedule).filter(([dateStr]) => {
      // Ensure date string is parsed correctly with moment
      const d = moment(dateStr, 'YYYY-MM-DD');
      // Use isBetween for a robust, inclusive comparison
      return d.isBetween(today, maxDate, 'day', '[]');
    });
  }, [selectedDoctor]);

  // Check if any slot available
  const hasAvailableSlots = useMemo(() => {
    return filteredSchedule.some(([date, slots]) => {
      const available = slots.filter(slot => !doctorBookedSlots[date]?.includes(slot));
      return available.length > 0;
    });
  }, [filteredSchedule, doctorBookedSlots]);

  const submitBooking = async () => {
    if (!bookingDetails.date || !bookingDetails.time) {
      setMessage('Please select an available slot.'); return;
    }
    try {
      await api.post('/appointments/book', { doctorId: selectedDoctor._id, ...bookingDetails }, { headers: { Authorization: `Bearer ${patientToken}` } });
      setMessage('Appointment booked successfully.');
      setSelectedDoctor(null);
      fetchAppointments();
    } catch (err) { setMessage(err.response?.data?.msg || 'Failed to book appointment.'); }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await api.delete(`/appointments/${appointmentId}`, { headers: { Authorization: `Bearer ${patientToken}` } });
      setMessage('Appointment cancelled.');
      fetchAppointments();
    } catch (err) { setMessage('Failed to cancel appointment.'); }
  };

  // Split appointments
  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const up = [], past = [];
    appointments.forEach(app => {
      const d = new Date(app.date); d.setHours(0,0,0,0);
      d >= today ? up.push(app) : past.push(app);
    });
    return { upcomingAppointments: up, pastAppointments: past };
  }, [appointments]);

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Your consultation and booking system...</h2>
        </Col>
        <Col className="text-end">
          <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
        </Col>
      </Row>

      {message && <Alert variant="info">{message}</Alert>}
      
      <Link to="/patient/consultation">
        <Button variant="success" className="mb-4">
          Try our AI virtual doctor and get your pre-consultation diagnosis report!
        </Button>
      </Link>

      {/* Search */}
      <h4 className="mt-4">Find suitable Doctors near you...</h4>
      <Form>
        <Row>
          {['city', 'state', 'speciality', 'name'].map(f => (
            <Col md={3} key={f}><Form.Group controlId={f}>
              <Form.Label>{f.charAt(0).toUpperCase()+f.slice(1)}</Form.Label>
              <Form.Control name={f} value={searchCriteria[f]} onChange={handleSearchChange} />
            </Form.Group></Col>
          ))}
        </Row>
        <Button className="mt-3" onClick={searchDoctors}>Search</Button>
      </Form>

      {/* Doctors */}
      <Row className="mt-4">
        {doctors.map(doc => (
          <Col md={4} key={doc._id} className="mb-3">
            <Card><Card.Body>
              <Card.Title>{doc.name}</Card.Title>
              <Card.Text>
                Speciality: {doc.speciality}<br />
                Exp: {doc.experience} yrs<br />
                {doc.city}, {doc.state}
              </Card.Text>
              <Button onClick={() => handleBookAppointment(doc)}>Book Appointment</Button>
            </Card.Body></Card>
          </Col>
        ))}
      </Row>

      {/* Booking */}
      {selectedDoctor && (
        <div className="mt-5">
          <h4>Book with Dr. {selectedDoctor.name}</h4>
          {filteredSchedule.length === 0 ? (
            <Alert variant="warning">The doctor is not active for the week.</Alert>
          ) : !hasAvailableSlots ? (
            <Alert variant="warning">No free slots available.</Alert>
          ) : (
            <Form>
              <Form.Label>Select a slot:</Form.Label>
              {filteredSchedule.map(([date, slots]) => {
                const avail = slots.filter(s => !doctorBookedSlots[date]?.includes(s));
                if (!avail.length) return null;
                return (
                  <div key={date} className="mb-3">
                    <strong>{date}</strong>
                    {avail.map(slot => (
                      <Form.Check
                        key={`${date}-${slot}`}
                        type="radio"
                        label={slot}
                        name="slot"
                        value={`${date}__${slot}`}
                        onChange={e => {
                          const [d,t] = e.target.value.split('__');
                          setBookingDetails({ date: d, time: t });
                        }}
                        checked={bookingDetails.date===date && bookingDetails.time===slot}
                      />
                    ))}
                  </div>
                );
              })}
              <Button onClick={submitBooking} disabled={!bookingDetails.date}>Confirm</Button>
              <Button variant="secondary" onClick={() => setSelectedDoctor(null)} className="ms-2">Cancel</Button>
            </Form>
          )}
        </div>
      )}

      {/* Upcoming */}
      <h4 className="mt-5">Upcoming Appointments</h4>
      {upcomingAppointments.length ? (
        <Table striped bordered hover>
          <thead><tr><th>Date</th><th>Time</th><th>Doctor</th><th>Action</th></tr></thead>
          <tbody>
            {upcomingAppointments.map(app => (
              <tr key={app._id}>
                <td>{app.date}</td><td>{app.time}</td><td>{app.doctorName}</td>
                <td><Button size="sm" variant="danger" onClick={() => cancelAppointment(app._id)}>Cancel</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : <p>No upcoming appointments.</p>}

      {/* Past */}
      <h4 className="mt-4">Past Appointments</h4>
      {pastAppointments.length ? (
        <Table striped bordered hover>
          <thead><tr><th>Date</th><th>Time</th><th>Doctor</th></tr></thead>
          <tbody>
            {pastAppointments.map(app => (
              <tr key={app._id}> <td>{app.date}</td><td>{app.time}</td><td>{app.doctorName}</td> </tr>
            ))}
          </tbody>
        </Table>
      ) : <p>No past appointments.</p>}
    </Container>
  );
}

export default PatientDashboard;