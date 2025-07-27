// Test directo del registro
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

async function testRegister() {
  const params = new URLSearchParams();
  params.append('name', 'Test Admin');
  params.append('email', 'testadmin@example.com');
  params.append('role', 'admin');
  params.append('password', 'TestPass123!');

  console.log('Enviando datos:', {
    name: 'Test Admin',
    email: 'testadmin@example.com', 
    role: 'admin',
    password: 'TestPass123!'
  });

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      redirect: 'manual'
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302) {
      console.log('Redirección exitosa a:', response.headers.get('location'));
    } else {
      console.log('Response body:', await response.text());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegister();
