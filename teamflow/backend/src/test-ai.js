const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers,
    };
    
    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(chunks) }); }
        catch { resolve({ status: res.statusCode, data: chunks }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testAI() {
  console.log('Logging in to get token...');
  const login = await request('POST', '/api/auth/login', {
    email: 'admin@teamflow.com',
    password: 'admin123',
  });
  
  const token = login.data?.token;
  if (!token) {
    console.error('Failed to get token', login.data);
    return;
  }
  
  console.log('Testing AI endpoint...');
  const result = await request('POST', '/api/ai/generate-description', {
    title: 'Set up CI/CD pipeline'
  }, token);

  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
}

testAI().catch(console.error);
