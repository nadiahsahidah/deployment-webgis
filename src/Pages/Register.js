import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Button} from 'react-bootstrap';
import axios from 'axios';
import '../Pages/Register.css'
import Navbar from '../components/Navbar'

const Register = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nomor, setNomor] = useState('');
  // const [job, setJob] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://103.178.153.251:3333/register', {
        nama,
        email,
        password,
        nomor
        // job
      });

      console.log('Response:', response.data);

      navigate("/loginApp");

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Register failed. Please try again later.');
      }
      console.error('Register Error:', error);
    }
  };

  return (
    <>
    <div>
        <Navbar />
    </div>
    <Form onSubmit={handleSubmit}>
      <h2>Buat Akun Sobat Jabar</h2>
      <Form.Group className="mb-2" controlId="formBasicNama">
        <Form.Label>Nama Lengkap <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type='text'
          placeholder='Masukkan nama'
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group className="mb-2" controlId="formBasicEmail" >
        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
        <Form.Control 
          type="email" 
          placeholder="Masukkan email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          autoComplete="email"
        />
      </Form.Group>
      <Form.Group className="mb-2" controlId="formBasicPassword">
        <Form.Label>Password <span className="text-danger">*</span></Form.Label>
        <Form.Control 
          type="password" 
          placeholder="Masukkan password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Form.Group>
      <Form.Group className="mb-2" controlId="formBasicTelepon">
        <Form.Label>Nomor Telepon <span className="text-danger">*</span></Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Masukkan nomor telepon" 
          value={nomor}
          onChange={(e) => setNomor(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Text className="text-danger" style={{marginBottom: 15}}>
        * wajib diisi
      </Form.Text>
      {/* <Form.Group className="mb-2" controlId="formBasicPekerjaan">
        <Form.Label>Pekerjaan</Form.Label>
        <Form.Control 
          type="text" 
          placeholder="Masukkan pekerjaan" 
          value={job}
          onChange={(e) => setJob(e.target.value)}
          // required
        />
      </Form.Group> */}
      <Button variant="login" type="submit">
        Register
      </Button>
      {error && <p>{error}</p>}
    </Form>
    </>
  );
};


export default Register;
