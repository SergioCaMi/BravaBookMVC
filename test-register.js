// Script de prueba para el registro
import axios from 'axios';

const testRegister = async () => {
  try {
    const userData = {
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin'
    };
    
    console.log('Datos que se envían:', userData);
    
    const response = await axios.post('http://localhost:3000/register', userData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 0,
      validateStatus: () => true // No lanzar error en redirecciones
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    if (response.status === 302) {
      console.log('Redirección a:', response.headers.location);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testRegister();
