import parseCookies from '@/helpers/index';
import { useState } from 'react'
import { useRouter } from 'next/router'
import { FaImage } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import moment from 'moment'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import ImageUpload from '@/components/ImageUpload'
import { API_URL } from '@/config/index'
import styles from '@/styles/Form.module.css'
import cookie from 'cookie';


export default function EditEventPage({ evt, token }) {
    const [values, setValues] = useState({
        name: evt.name,
        performers: evt.performers,
        venue: evt.venue,
        address: evt.address,
        date: evt.date,
        time: evt.time,
        description: evt.description
    })

    const [imagePreview, setImagePreview] = useState(evt.image ? evt.image.formats.thumbnail.url : null)
    const [showModal, setShowModal] = useState(false)

    const router = useRouter()

    // const Modal = ({ show, onClose, children }) => {
    //     if (!show) return null;
    //     return (
    //         <div className="modal">
    //             <div className="modal-content">
    //                 <button onClick={onClose}>Close</button>
    //                 {children}
    //             </div>
    //         </div>
    //     );
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasEmptyFields = Object.values(values).some((element) => element === '');

        if (hasEmptyFields) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/events/${evt.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    data: values
                }),
            });

            if (!res.ok) {
                if (res.status === 403 || res.status === 401) {
                    toast.error('Unauthorized');
                    return
                }
                const errorData = await res.json();
                toast.error(`Something went wrong: ${errorData.error.message}`);
                return;
            }
            const updatedEvt = await res.json();
            router.push(`/events/${updatedEvt.data.slug}`);
        } catch (error) {
            toast.error('Error occurred while updating the event');
            console.error('API Request Error:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
    }
    const imageUploaded = async () => {
        try {
            console.log("Fetching event with ID:", evt.id);
            const res = await fetch(`${API_URL}/api/events?filters[id][$eq]=${evt.id}&populate=image`);
            const data = await res.json();

            console.log("API Response:", JSON.stringify(data, null, 2)); 

            if (!res.ok || !data.data || data.data.length === 0) {
                console.error("Event not found:", data);
                return;
            }

            const event = data.data[0]; 
            console.log("Event Data Structure:", event); 

            const slug = event.slug || event.attributes?.slug;
            if (slug) {
                console.log("Redirecting to:", `/events/${slug}`);
                router.push(`/events/${slug}`);
            } else {
                console.warn("Slug not found in response:", event);
            }

            const imageUrl = event.image?.url || event.attributes?.image?.data?.attributes?.url;
            if (imageUrl) {
                setImagePreview(imageUrl);
            } else {
                console.warn("No image found in response.");
            }

            setShowModal(false);
        } catch (error) {
            console.error("Error fetching updated image:", error);
        }
    };

    return (
        <Layout title='Edit Event'>
            <Link href='/events'>Go Back</Link>
            <h1>Edit Event</h1>
            <ToastContainer />
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <div>
                        <label htmlFor='name'>Event Name</label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            value={values.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='performers'>Performers</label>
                        <input
                            type='text'
                            name='performers'
                            id='performers'
                            value={values.performers}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='venue'>Venue</label>
                        <input
                            type='text'
                            name='venue'
                            id='venue'
                            value={values.venue}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='address'>Address</label>
                        <input
                            type='text'
                            name='address'
                            id='address'
                            value={values.address}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='date'>Date</label>
                        <input
                            type='date'
                            name='date'
                            id='date'
                            value={moment(values.date).format('yyyy-MM-DD')}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label htmlFor='time'>Time</label>
                        <input
                            type='text'
                            name='time'
                            id='time'
                            value={values.time}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor='description'>Event Description</label>
                    <textarea
                        name='description'
                        id='description'
                        value={values.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <input type='submit' value='Update Event' className='btn' />
            </form>

            <h2>Event Image</h2>
            {
                imagePreview ? (
                    <Image src={imagePreview} alt={evt.name || "Event Image"} height={100} width={170} />
                ) : (
                    <div>
                        <p>No image uploaded</p>
                    </div>
                )
            }

            <div>
                <button
                    onClick={() => setShowModal(true)}
                    className='btn-secondary btn-icon'
                >
                    <FaImage /> Set Image
                </button>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <ImageUpload
                    evtId={evt.id}
                    alt={evt.name || "Event Image"}
                    imageUploaded={imageUploaded}
                    token={token}
                />
            </Modal>
        </Layout >
    )
}

export async function getServerSideProps({ params: { id }, req }) {
    try {
        const cookies = parseCookies(req) || {};
        const token = cookies.token || null;

        const res = await fetch(`${API_URL}/api/events?populate=*&id=${id}`);
        const events = await res.json();

        console.log(req.headers.cookie);

        if (!events || !events.data || events.data.length === 0) {
            console.error(`No event data found for ID: ${id}`);
            return {
                notFound: true,
            };
        }

        const evt = events.data.find(event => String(event.id) === id);

        if (!evt) {
            console.error(`No event found with ID: ${id}`);
            return {
                notFound: true,
            };
        }

        const sanitizedEvt = {
            id: evt.id || null,
            name: evt.name || 'Untitled Event',
            date: evt.date || 'TBD',
            time: evt.time || 'TBD',
            venue: evt.venue || 'Unknown Venue',
            address: evt.address || 'Unknown Address',
            performers: evt.performers || 'Unknown Performers',
            description: evt.description || 'No description available',
            image: evt.image || null,
        };

        return {
            props: {
                evt: sanitizedEvt,
                token
            },
        };
    } catch (error) {
        console.error(`Error fetching event for ID ${id}:`, error);
        return {
            notFound: true, 
        };
    }
}




