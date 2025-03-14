const cookie = require('cookie');
import { API_URL } from "@/config/index";

export default async (req, res) => {
  if (req.method === 'GET') {
    if (!req.headers.cookie) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    const { token } = cookie.parse(req.headers.cookie);

    if (!token) {
      return res.status(403).json({ message: 'Token not found' });
    }

    try {
      const strapiRes = await fetch(`${API_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!strapiRes.ok) {
        const errorMessage = await strapiRes.text();
        console.error('Strapi Error:', errorMessage);
        return res.status(403).json({ message: 'User forbidden', error: errorMessage });
      }

      const user = await strapiRes.json();

      res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
};
