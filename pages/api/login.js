const cookie = require('cookie');
import { API_URL } from "@/config/index";

export default async (req, res) => {
    if (req.method === 'POST') {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: "Identifier and password cannot be empty." });
        }

        // Log the request body to ensure it's coming in correctly
        console.log("Request Body:", req.body);

        try {
            const strapiRes = await fetch(`${API_URL}/api/auth/local`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await strapiRes.json();

            if (strapiRes.ok) {
                // console.log("Identifier:", identifier);
                // console.log("Password:", password);
                // console.log("Cookie module:", cookie);
                // console.log("Strapi Response Data:", data);
                // const { jwt } = data;
                // console.log("Request Body:", req.body);

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
                // Log the error message returned from Strapi
                // console.error("Strapi Error:", data.error);
                return res.status(data.error?.status || 500).json({ message: data.error?.message || "Login failed" });
            }
        } catch (error) {
            // Log any errors from the fetch request
            console.error("API Error:", error);
            return res.status(500).json({ message: "Server error. Please try again." });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
};
