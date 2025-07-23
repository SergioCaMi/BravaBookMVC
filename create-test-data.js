import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/user.model.js';
import Apartment from './models/apartment.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bravabook');
    console.log('Conectado a MongoDB');

    // Crear usuario admin si no existe
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123!', 10);
      const admin = new User({
        name: 'Admin Test',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Usuario admin creado: admin@test.com / admin123!');
    } else {
      console.log('Usuario admin ya existe');
    }

    // Crear apartamento de prueba si no existe
    const existingApartment = await Apartment.findOne({ title: 'Apartamento de Prueba' });
    if (!existingApartment) {
      const apartment = new Apartment({
        title: 'Apartamento de Prueba',
        description: 'Este es un apartamento de prueba para editar',
        rooms: 2,
        bathrooms: 1,
        maxGuests: 4,
        squareMeters: 80,
        price: 75,
        location: {
          province: {
            id: 28,
            nm: 'Madrid'
          },
          municipality: {
            id: 28079,
            nm: 'Madrid'
          },
          gpsCoordinates: {
            lat: 40.4168,
            lng: -3.7038
          }
        },
        services: {
          airConditioning: true,
          heating: true,
          internet: true,
          kitchen: true
        },
        photos: ['/img/default.jpg'],
        createdBy: existingAdmin ? existingAdmin._id : new mongoose.Types.ObjectId()
      });
      await apartment.save();
      console.log('Apartamento de prueba creado:', apartment._id);
    } else {
      console.log('Apartamento de prueba ya existe:', existingApartment._id);
    }

    console.log('Datos de prueba listos');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestData();
