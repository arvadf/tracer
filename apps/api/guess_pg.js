const { Client } = require('pg');

const passwordsToTry = [
  '',
  'root',
  '1234',
  '12345',
  '123456',
  'password',
  'admin',
  'admin123',
  'postgres',
];

async function guessPassword() {
  for (const pw of passwordsToTry) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: pw,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`SUCCESS: Password is "${pw}"`);
      await client.end();
      return;
    } catch (e) {
      if (e.code === '28P01') {
         // wrong password
      } else if (e.code === '3D000') {
         // database "postgres" doesnt exist, but auth succeeded!
         console.log(`SUCCESS BUT NO DB: Password is "${pw}"`);
         return;
      } else {
         console.error(`Other error for "${pw}":`, e.message);
      }
    }
  }
  console.log('FAILED: Could not guess the password.');
}

guessPassword();
