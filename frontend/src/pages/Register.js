import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../context/LoginUtil";
import './register.css';
import axios from "axios";
import Button from '@mui/material/Button';

export default function Register() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleRegister(event) {
    event.preventDefault();

    if (!username || !password || !confirmPassword) {
      setError('Täytä kaikki pakolliset kentät.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Salasanat eivät täsmää.');
      return;
    }

    axios.post('/register', { username, password })
      .then(resp => {
        loginUser(username, password)
          .then(success => {
            if (success) {
              navigate("/");
              window.location.reload();
            } else {
              setError("Error logging in. Please try again.");
            }
          });
      })

      .catch(error => {
        console.error("Register failed:", error.message);
        if (error.response && error.response.status === 400) {
          setError(error.response.data.error);
        } else {
          setError("Rekisteröityminen epäonnistui. Yritä uudelleen myöhemmin.");
        }
      });
  }

  return (
    <div className='register'>
      <span className='register-title'>Rekisteröityminen</span>
      <form className="register-form" onSubmit={handleRegister}>
        <label>Käyttäjänimi</label>
        <input type="text" name="username" placeholder="Käyttäjänimi" value={username} onChange={e => setUsername(e.target.value)} required /> <br />
        <label>Salasana</label>
        <input type="password" name="password" placeholder="Salasana" value={password} onChange={e => setPassword(e.target.value)} required /> <br />
        <label>Vahvista salasana</label>
        <input type="password" name="confirmPassword" placeholder="Vahvista salasana" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /> <br />
        <Button className='register-button' type="submit" variant="contained" style={{fontSize: '100%'}}>Rekisteröidy</Button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}