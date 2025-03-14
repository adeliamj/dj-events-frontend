import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowAltCircleDown, FaPencilAlt, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import Layout from "@/components/Layout";
import { API_URL } from "@/config/index";
import styles from "@/styles/Event.module.css";
import { useRouter } from 'next/router';

const EventPage = ({ evt }) => {
  const router = useRouter();

  const deleteEvent = async (e) => {
    if (confirm('Are you sure?')) {
      const res = await fetch(`${API_URL}/api/events/${evt.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response:", errorText);
        toast.error("Something went wrong: " + errorText);
      } else {
        try {
          await res.json();
          router.push('/events');
        } catch (err) {
          console.error("Error parsing JSON:", err);
          toast.error("Error parsing the response data.");
        }
      }
    }
  };

  const imageUrl = evt.image && evt.image.formats && evt.image.formats.thumbnail ? evt.image.formats.thumbnail.url : null;
  console.log('evt.description:', evt.description);
  return (
    <Layout>
      <div className={styles.event}>
        <span>
          {new Date(evt.date).toLocaleDateString('en-US')} at {evt.time}
        </span>
        <h1>{evt.name}</h1>
        <ToastContainer />

        {evt.image && (
          <div className={styles.image}>
            <Image
              src={evt.image.formats.medium.url}
              alt={evt.name || "Event Image"}
              width={960}
              height={600}
            />
          </div>
        )}

        <h3>Performers: </h3>
        <p>{evt.performers}</p>
        <h3>Description:</h3>
        <p>{evt.description}</p>
        <h3>Venue: {evt.venue}</h3>
        <p>{evt.address}</p>
        <Link href='/events'>
          <div className={styles.back}>{'<'} Go Back</div>
        </Link>
      </div>
    </Layout >
  );
};


export async function getStaticPaths() {

  try {
    const res = await fetch(`${API_URL}/api/events`);
    const events = await res.json();


    if (!events || !events.data || events.data.length === 0) {
      throw new Error("No events data returned");
    }

    const paths = events.data.map(evt => ({
      params: { slug: evt.slug }
    }));

    console.log("Generated paths:", paths);
    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error("Error fetching event paths:", error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params: { slug } }) {
  try {
    const res = await fetch(`${API_URL}/api/events?populate=*&slug=${slug}`);
    const events = await res.json();

    if (!events || !events.data || events.data.length === 0) {
      return {
        notFound: true,
      };
    }

    const evt = events.data.find(event => event.slug === slug);

    if (!evt) {
      return {
        notFound: true, // If no event matches the slug, return 404
      };
    }

    // Ensure the event object is serializable and provide default values
    const sanitizedEvt = {
      ...evt,
      id: evt.id || null,
      name: evt.name || 'Untitled Event',
      date: evt.date || 'TBD',
      time: evt.time || 'TBD',
      venue: evt.venue || 'Unknown Venue',
      address: evt.address || 'Unknown Address',
      performers: evt.performers || 'Unknown Performers',
      description: evt.description ? evt.description : 'No description available', // Handle missing description
      image: evt.image || null,
    };

    return {
      props: {
        evt: sanitizedEvt,
      },
      revalidate: 1,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return {
      notFound: true, 
    };
  }
}

export default EventPage;
