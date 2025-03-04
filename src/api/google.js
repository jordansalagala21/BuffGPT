export default async function handler(req, res) {
    const url = `https://maps.googleapis.com${req.url.replace('/api/google', '')}`;
  
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await response.json();
    res.status(response.status).json(data);
  }