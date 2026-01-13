require('dotenv').config();
const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:4020/api';

async function run() {
  try {
    console.log('Creating user...');
    const userRes = await axios.post(`${API_BASE}/users`, { name: 'Test User', email: 'test@example.com' });
    const user = userRes.data;
    console.log('User created:', user._id || user.id || user);

    console.log('Creating contribution linked to user...');
    const contribRes = await axios.post(`${API_BASE}/contributions`, { amount: 42, isAnonymous: false, note: 'Seed via test-api', name: 'Test User', email: 'test@example.com' });
    console.log('Contribution created:', contribRes.data.contribution || contribRes.data);

    console.log('Creating anonymous contribution...');
    const anonRes = await axios.post(`${API_BASE}/contributions`, { amount: 10, isAnonymous: true, note: 'Anonymous', name: 'Anonymous Donor' });
    console.log('Anonymous created:', anonRes.data.contribution || anonRes.data);

    console.log('Fetching contributions total...');
    const totalRes = await axios.get(`${API_BASE}/contributions/total`);
    console.log('Total:', totalRes.data);

    console.log('Listing contributions...');
    const listRes = await axios.get(`${API_BASE}/contributions`);
    console.log('Contributions count:', (listRes.data.contributions || []).length);

    // Authenticate as admin to access protected endpoints
    console.log('Authenticating as admin...');
    const authRes = await axios.post(`${API_BASE}/auth`, { email: 'admin@example.com', password: 'adminpass' });
    const token = authRes.data.token;
    console.log('Admin token acquired');

    console.log('Fetching contributors (protected) with admin token');
    const contributorsRes = await axios.get(`${API_BASE}/contributors`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Contributors (protected):', contributorsRes.data);

    // Confirm first contribution (admin)
    if (contribRes && contribRes.data && contribRes.data.contribution && contribRes.data.contribution._id) {
      const cid = contribRes.data.contribution._id;
      console.log('Confirming contribution', cid);
      const conf = await axios.post(`${API_BASE}/contributions/${cid}/confirm`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Confirmed:', conf.data);
    }

    console.log('API tests completed');
  } catch (err) {
    if (err.response) {
      console.error('API error', err.response.status, err.response.data);
    } else {
      console.error('Request error', err && err.message ? err.message : err);
      if (err && err.stack) console.error(err.stack);
    }
    process.exit(1);
  }
}

run();
