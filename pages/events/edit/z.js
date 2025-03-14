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

export default function EditEventPage({ evt }) {
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

    // Handling the submit
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        const hasEmptyFields = Object.values(values).some(
            (element) => element === ''
        )

        if (hasEmptyFields) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            const res = await fetch(`${API_URL}/events/${evt.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Token handling here
                },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                // Check for specific error statuses
                if (res.status === 403 || res.status === 401) {
                    toast.error('Unauthorized')
                    return
                } else if (res.status === 405) {
                    toast.error('Method Not Allowed for this endpoint')
                    return
                }

                // For other errors, try to get a more detailed message
                const errorText = await res.text()  // Get error response text
                toast.error(`Something went wrong: ${errorText}`)
            } else {
                const updatedEvt = await res.json()
                router.push(`/events/${updatedEvt.slug}`)
            }
        } catch (error) {
            toast.error('Error occurred while updating the event')
            console.error('API Request Error:', error)
        }
    }


    // Handling input change
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
    }

    // Handling image upload
    const imageUploaded = async (e) => {
        const res = await fetch(`${API_URL}/api/events?id=${evt.id}`)
        const data = await res.json()
        setImagePreview(data.image.formats.thumbnail.url)
        setShowModal(false)
    }

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
            {imagePreview ? (
                <Image src={imagePreview} height={100} width={170} />
            ) : (
                <div>
                    <p>No image uploaded</p>
                </div>
            )}

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
                // token={token} Uncomment when handling token properly
                />
            </Modal>
        </Layout>
    )
}

export async function getStaticPaths() {
    try {
        const res = await fetch(`${API_URL}/api/events`);
        const events = await res.json();

        // Check if the events data is valid and contains items
        if (!events || !events.data || events.data.length === 0) {
            console.error("No events data found");
            return {
                paths: [], // No paths if there is no data
                fallback: 'blocking',
            };
        }

        // Generate paths using the event `id`
        const paths = events.data.map(evt => ({
            params: { id: String(evt.id) }, // Use event `id` for path
        }));

        console.log("Generated paths:", paths); // Debugging path generation

        return {
            paths,
            fallback: 'blocking', // Ensure SSR on first request
        };
    } catch (error) {
        console.error("Error fetching event paths:", error);
        return {
            paths: [], // Fallback if an error occurs
            fallback: 'blocking',
        };
    }
}

export async function getStaticProps({ params: { id } }) {
    try {
        // Fetch the event data using the `id`
        const res = await fetch(`${API_URL}/api/events?populate=*&id=${id}`);
        const events = await res.json();

        // Ensure the events data is valid
        if (!events || !events.data || events.data.length === 0) {
            console.error(`No event data found for ID: ${id}`);
            return {
                notFound: true, // Return 404 if no event found
            };
        }

        // Find the event that matches the ID
        const evt = events.data.find(event => String(event.id) === id);

        if (!evt) {
            console.error(`No event found with ID: ${id}`);
            return {
                notFound: true, // Return 404 if no event matches the ID
            };
        }

        // Ensure the event object is serializable and provide default values
        const sanitizedEvt = {
            id: evt.id || null,
            name: evt.name || 'Untitled Event',
            date: evt.date || 'TBD',
            time: evt.time || 'TBD',
            venue: evt.venue || 'Unknown Venue',
            address: evt.address || 'Unknown Address',
            performers: evt.performers || 'Unknown Performers',
            description: evt.description || 'No description available', // Handle missing description
            image: evt.image || null,
        };

        return {
            props: {
                evt: sanitizedEvt, // Passing the sanitized event to the page
            },
            revalidate: 1, // Optional: Set to a certain value for ISR
        };
    } catch (error) {
        console.error(`Error fetching event for ID ${id}:`, error);
        return {
            notFound: true, // Return 404 if an error occurs
        };
    }
}


