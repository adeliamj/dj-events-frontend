import Link from 'next/link';
import Layout from "@/components/Layout";
import Pagination from '@/components/Pagination';
import EventItem from "@/components/EventItem";
import { API_URL, PER_PAGE } from "@/config/index"; 
export default function HomePage({ events, page, total }) {

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
  const pageNum = Number(page) || 1; 
  console.log("Converted page number:", pageNum);

  const start = (pageNum - 1) * PER_PAGE;
  console.log("Start value:", start);

  const totalRes = await fetch(`${API_URL}/api/events?pagination[withCount]=true`);
  const totalJson = await totalRes.json();
  const total = totalJson.meta?.pagination?.total || 0;
  console.log("Total events:", total);

  const eventRes = await fetch(
    `${API_URL}/api/events?pagination[page]=${pageNum}&pagination[pageSize]=${PER_PAGE}&sort[0]=date:asc&populate=*`
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
    props: { events, page: pageNum, total },
  };
}