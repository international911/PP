import React, { useState } from 'react';
import axios from 'axios';
import './styles/RegistrationForm.scss';

const RegistrationForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', { email, name });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        onRegister(response.data.userId, response.data.username, response.data.email);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <form className="registration-form" onSubmit={handleSubmit}>
      <h2>Вход в аккаунт</h2>
      <div>
        <label>Your email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Your Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default RegistrationForm;
