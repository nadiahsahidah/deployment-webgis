import MapPage from "../src/MapPage/MapPage.jsx"
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home.js';
import About from "./Pages/About.js";
import FormLapor from "./Pages/FormAdmin.js";
import Login from "./Pages/Login.js";
import Register from "./Pages/Register.js";
import Admin from "./Pages/Admin.js";
import FormLaporUser from "./Pages/FormUser.js";
import ProtectedRoute from "./components/ProtectedRoute.js";


function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/training' element={<About />} />
        <Route path='/map' element={<MapPage />} />
        <Route path='/LoginApp' element={<Login />} />
        <Route path='/signUp' element={<Register/>} />
        <Route path='/admin' element={<Admin/>} />

        {/* Protected routes */}
        <Route path='/formUser' element={
          <ProtectedRoute allowedRoles={['user']}>
            <FormLaporUser />
          </ProtectedRoute>
        } />
        <Route path='/form' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FormLapor />
          </ProtectedRoute>
        } />
        <Route path='/admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />

      </Routes>
    </div>
  );
}

export default App;
