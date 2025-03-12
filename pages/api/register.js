const cookie = require('cookie');
import { API_URL } from "@/config/index";

export default async (req, res) => {
    if (req.method === 'POST') {
        const { username, email, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password cannot be empty." });
        }

        console.log("Request Body:", req.body);

        try {
            const strapiRes = await fetch(`${API_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await strapiRes.json();

            if (strapiRes.ok) {
                console.log("Username:", username);
                console.log("Password:", password);
                console.log("Strapi Response Data:", data);
                const { jwt } = data;

                res.setHeader(
                    'Set-Cookie',
                    cookie.serialize('token', data.jwt, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV !== 'development',
                        maxAge: 60 * 60 * 24 * 7, // 1 week
                        sameSite: 'strict',
                        path: '/',
                    })
                );
                return res.status(200).json({ user: data.user });
            } else {
                return res.status(data.statusCode).json({ message: data.message[0].messages[0].message });
            }
        } catch (error) {
            console.error("API Error:", error);
            return res.status(500).json({ message: "Server error. Please try again." });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
};
