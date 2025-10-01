// Test Supabase Connection
// Run this with: node test-supabase-connection.js

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...\n');
console.log('Supabase URL:', SUPABASE_URL);
console.log('Anon Key (first 20 chars):', SUPABASE_ANON_KEY?.substring(0, 20) + '...');
console.log('');

// Test 1: Basic fetch to Supabase
console.log('Test 1: Testing basic connectivity to Supabase...');
fetch(`${SUPABASE_URL}/rest/v1/`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
  .then(response => {
    console.log('✅ Basic connectivity: SUCCESS');
    console.log('   Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('   Response:', data.substring(0, 100));
  })
  .catch(error => {
    console.log('❌ Basic connectivity: FAILED');
    console.log('   Error:', error.message);
  });

// Test 2: Auth endpoint
console.log('\nTest 2: Testing auth endpoint...');
setTimeout(() => {
  fetch(`${SUPABASE_URL}/auth/v1/health`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('✅ Auth endpoint: SUCCESS');
      console.log('   Response:', data);
    })
    .catch(error => {
      console.log('❌ Auth endpoint: FAILED');
      console.log('   Error:', error.message);
    });
}, 1000);

// Test 3: Try a test login (will fail but shows if auth is reachable)
console.log('\nTest 3: Testing auth sign-in endpoint...');
setTimeout(() => {
  fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
    })
  })
    .then(response => {
      console.log('✅ Auth sign-in endpoint: REACHABLE');
      console.log('   Status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('   Response:', data);
    })
    .catch(error => {
      console.log('❌ Auth sign-in endpoint: FAILED');
      console.log('   Error:', error.message);
    });
}, 2000);
