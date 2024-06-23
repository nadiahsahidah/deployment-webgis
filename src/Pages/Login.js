import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Button} from 'react-bootstrap';
import axios from 'axios';
import '../Pages/Login.css'
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://103.178.153.251:3333/login', {
        email,
        password,
      });

      // lakukan pengecekan role untuk batas akses fitur
      const tokenUser = response.data.data.token.token;
      const userRole = response.data.data.user.role;

      if (tokenUser) {
        localStorage.setItem('userToken', tokenUser);
        localStorage.setItem('userRole', userRole);

        if (userRole === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
          console.log('user not found');
      }

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Login failed. Please try again later.');
      }
      console.error('Login Error:', error);
    }
  };

  return (
    <>
    <div>
      <Navbar />
    </div>
    <Form onSubmit={handleSubmit}>
      <h2>Masuk Akun Sobat Jabar</h2>
      <Form.Group className="mb-3" controlId="formBasicEmail" >
        <Form.Label>Email address <span className="text-danger">*</span></Form.Label>
        <Form.Control 
          type="email" 
          placeholder="Masukkan email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          autoComplete="email"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
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
      <Form.Text className="text-danger">
        * wajib diisi
      </Form.Text>
      <p>Belum punya akun? <a href="/SignUp">Register</a></p>
      <Button variant="login" type="submit">
        Login
      </Button>
      {error && <p>{error}</p>}
    </Form>

    </>
  );
};


export default Login;
