import parseCookies from '@/helpers/index';
import Layout from "@/components/Layout";
import { API_URL } from '@/config/index';
import DashboardEvent from '@/components/DashboardEvent';
import styles from '@/styles/Dashboard.module.css';
import { useRouter } from 'next/router'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function DashboardPage({ events, user, token }) {
    const router = useRouter();

    const deleteEvent = async (eventId) => {
        if (confirm('Are you sure?')) {
            try {
                const res = await fetch(`${API_URL}/api/events/${eventId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("Error response:", text);
                    toast.error("Something went wrong: " + text);
                    return;
                }
            } catch (err) {
                console.error("Error deleting event:", err);
                toast.error("Failed to delete event.");
            }
        }
    };

    return (
        <Layout title='User Dashboard'>
            <div className={styles.dash}>
                <h1>Dashboard</h1>
                <h3>My Events</h3>

                {events?.length > 0 ? (
                    events.map((evt) => (
                        <DashboardEvent 
                            key={evt.id} 
                            evt={evt} 
                            token={token} 
                            deleteEvent={() => deleteEvent(evt.id)}  // Kirim ID event
                        />
                    ))
                ) : (
                    <p>No events found.</p>
                )}
            </div>
            <ToastContainer />
        </Layout>
    );
}

export async function getServerSideProps({ req }) {
    const { token } = parseCookies(req);
    console.log("Token from Cookies:", token);

    if (!token) {
        return {
            props: {
                events: [],
                user: null,
            },
        };
    }

    try {
        const userRes = await fetch(`${API_URL}/api/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: "include",
        });

        if (!userRes.ok) {
            console.error("Failed to fetch user data.");
            return {
                props: {
                    events: [],
                    user: null,
                },
            };
        }

        const user = await userRes.json();
        console.log("Logged-in User:", user);
        const eventsRes = await fetch(`${API_URL}/api/events?filters[user][id][$eq]=${user.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: "include",
        });

        if (!eventsRes.ok) {
            console.error("Failed to fetch events.");
            return {
                props: { events: [], user }
            };
        }

        const json = await eventsRes.json();
        console.log("Events Data:", json);

        const events = json?.data?.map(evt => ({
            id: evt.id || null,
            name: evt.name || 'Untitled Event',
            date: evt.date || 'TBD',
            time: evt.time || 'TBD',
            venue: evt.venue || 'Unknown Venue',
            address: evt.address || 'Unknown Address',
            performers: evt.performers || 'Unknown Performers',
            description: evt.description || 'No description available',
            image: evt.image || null,
        })) || [];

        return {
            props: { events, user, token },
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return {
            props: {
                events: [],
                user: null,
            },
        };
    }
}
