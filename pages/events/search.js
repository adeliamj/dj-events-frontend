import qs from 'qs'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from "@/components/Layout"
import EventItem from "@/components/EventItem"
import { API_URL } from "@/config/index"

export default function SearchPage({ events }) {
  const router = useRouter()

  return (
    <Layout title="Search Results">
      <Link href='/events'>Go Back</Link>
      <h1>Search Results for "{router.query.term}"</h1>
      {events.length === 0 ? (
        <h3>No Events to Show</h3>
      ) : (
        events.map((evt) => (
          <EventItem key={evt.id} evt={evt} />
        ))
      )}
    </Layout>
  )
}

export async function getServerSideProps({ query: { term } }) {
  if (!term) {
    return { props: { events: [] } }
  }

  const query = qs.stringify({
    filters: {
      $or: [ 
        { name: { $contains: term } },
        { venue: { $contains: term } },
        { description: { $contains: term } },
        { performers: { $contains: term } },
      ],
    },
    populate: '*', 
  })

  const res = await fetch(`${API_URL}/api/events?${query}`)
  const json = await res.json()

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
    image: item.image?.formats?.thumbnail?.url || item.image?.url || null,
  })) || []

  return {
    props: { events },
  }
}
