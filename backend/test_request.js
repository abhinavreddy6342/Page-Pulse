(async()=>{
  try {
    const target = process.argv[2] || 'https://example.com';
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: target }),
    });
    console.log('Status:', res.status);
    const json = await res.text();
    console.log(json);
  } catch (e) {
    console.error('Request error', e);
  }
})();