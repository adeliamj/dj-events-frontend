import Link from 'next/link';
import Layout from "@/components/Layout";
import Pagination from '@/components/Pagination';
import EventItem from "@/components/EventItem";
import { API_URL, PER_PAGE } from "@/config/index"; // Ensure PER_PAGE is imported here

export default function HomePage({ events, page, total }) {

  // Check if events is empty
  if (events.length === 0) {
    return (
      <Layout>
        <h1>Events</h1>
        <h3>No Events to Show</h3>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>Events</h1>
      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      <Pagination page={page} total={total} />
    </Layout>
  );
}

export async function getServerSideProps({ query: { page = 1 } }) {
  const start = +page === 1 ? 0 : (+page - 1) * PER_PAGE;

  // Fetch the total count of events
  const totalRes = await fetch(`${API_URL}/api/events/count`);
  const total = await totalRes.json();

  // Fetch events for the current page
  const eventRes = await fetch(
    `${API_URL}/api/events?_sort=date:ASC&_limit=${PER_PAGE}&_start=${start}&populate=*`
  );
  const eventJson = await eventRes.json();

  const events = eventJson.data?.map(item => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    venue: item.venue,
    address: item.address,
    date: item.date,
    time: item.time,
    performers: item.performers,
    description: item.description,
    image: item.image?.formats?.thumbnail?.url || item.image?.url || null,
  })) || [];

  return {
    props: { events, page: +page, total },
  };
}


// export async function getStaticProps() {
//   const res = await fetch(`${API_URL}/api/events?populate=*`);

//   if (!res.ok) {
//     console.error("Error fetching events:", res.statusText);
//     return { props: { events: [] } };
//   }

//   const json = await res.json();
//   console.log('API Response:', json); // Log raw response

//   // Extract event data properly
//   const events = json.data?.map(item => ({
//     id: item.id,
//     slug: item.slug,
//     name: item.name,
//     venue: item.venue,
//     address: item.address,
//     date: item.date,
//     time: item.time,
//     performers: item.performers,
//     description: item.description,
//     image: item.image?.formats?.thumbnail?.url || item.image?.url || null, // Get image URL from Cloudinary formats
//   })) || [];

//   return {
//     props: { events },
//     revalidate: 1,
//   };
// }


