import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Swal from 'sweetalert2';
import userImage from '../assets/user.png'
import logo from '../assets/Logo Jabar.png'
import './Navbar.css'

const BasicNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMap, setIsMap] = useState(false);
  const [color, setColor] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // agar navbar tetap berada pada halaman ini
  useEffect(() => {
    if (currentPath === '/map' || 
    currentPath === '/admin' || 
    currentPath === '/LoginApp' || 
    currentPath === '/SignUp' || 
    currentPath === '/form' ||
    currentPath === '/formUser' ) {
      setIsMap(true)
    }
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
  
    if (token) {
      setIsLoggedIn(true); 
      setUserRole(role);
      return;
    }
  }, [currentPath]);

  const changeColor = () => {
    if (window.scrollY >= 100) {
      setColor(true)
    } else {
      setColor(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken'); 
  };

  window.addEventListener('scroll', changeColor)

  const showLoginAlert = () => {
    Swal.fire({
      icon: 'error',
      title: 'Akses Terbatas',
      text: 'Maaf, akses ke fitur ini terbatas hanya untuk petugas yang sudah login.',
    });
  };

  return (
    <Navbar expand="lg" className={color ? `navbar order-last order-lg-0 navbar-scrolled` : `navbar order-last order-lg-0 ${isMap ? 'navbar-scrolled' : ''}`} fixed='top' data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">
          <img
            src={logo}
            alt="logo jabar"
            width= "50px"
          />{' '}
          Sobat Jabar</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Navbar.Text>
            <Nav className="me-auto">
              <Nav.Link href="/" className="active">Home</Nav.Link>
              <Nav.Link href="/map">Map</Nav.Link>
              <Nav.Link className="active"
                onClick={() => {
                  if (isLoggedIn && userRole === 'admin') {
                    navigate('/admin');
                  } else {
                    showLoginAlert();
                  }
                }} >
                History</Nav.Link>
              <NavDropdown title={
                  <img
                    src={userImage}
                    alt="user"
                    style={{ width: '30px', borderRadius: '50%', marginRight: '10px' }} 
                  /> 
                }
                    id="basic-nav-dropdown">
                {isLoggedIn ? (
                    <NavDropdown.Item onClick={handleLogout} href='/'>Sign Out</NavDropdown.Item>
                ) : (
                    <NavDropdown.Item href="/LoginApp">Sign In</NavDropdown.Item>
                )}
              </NavDropdown>
            </Nav>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

}

export default BasicNavbar