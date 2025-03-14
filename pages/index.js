import Link from 'next/link';
import Layout from "@/components/Layout";
import EventItem from "@/components/EventItem";
import { API_URL } from "@/config/index";

export default function HomePage({ events }) {
  
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

      <Link href='/events'>
        <div className='btn-secondary'>View All Events</div>
      </Link>
    </Layout>
  );
}

export async function getStaticProps() {
  const res = await fetch(`${API_URL}/api/events?pagination[page]=1&pagination[pageSize]=3&sort[0]=date:asc&populate=*`);

  if (!res.ok) {
    console.error("Error fetching events:", res.statusText);
    return { props: { events: [] } };
  }

  const json = await res.json();
  console.log('API Response:', json); 

  const events = json.data?.map(item => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    venue: item.venue,
    address: item.address,
    date: item.date,
    time: item.time,
    performers: item.performers,
    description: item.description,
    image: item.image?.formats?.thumbnail?.url || item.image?.url || null, // Get image URL from Cloudinary formats
  })) || [];

  return {
    props: { events },
    revalidate: 1,
  };
}
