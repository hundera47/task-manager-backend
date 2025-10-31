// seedAdmin.js
import bcrypt from 'bcryptjs';
import {pool} from './db.js';

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['admin', 'admin@gmail.com', hashedPassword, 'admin']
    );
    //console.log('✅ Admin user created: admin@taskapp.com / Admin@123');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
};

seedAdmin();
