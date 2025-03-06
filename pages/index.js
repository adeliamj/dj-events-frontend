import Link from 'next/link'
import Layout from "@/components/Layout"
import EventItem from "@/components/EventItem"
import { API_URL } from "@/config/index"

export default function HomePage({ events }) {
  console.log(events)
  return (
    <Layout>
      <h1>Events</h1>
      {events.lenght === 0 && <h3>No Events to Show</h3>}
      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      {events.length > 0 && (
        <Link href='/events'>
          <div className='btn-secondary'>View All Events</div>
        </Link>
      )}
    </Layout>
  )
}


export async function getStaticProps() {
  const res = await fetch(`${API_URL}/api/events`)
  const events = await res.json()

  return {
    props: { events: events.slice(0, 3) },
    revalidate: 1,
  }
}