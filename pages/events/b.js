import { FaPencilAlt, FaTimes } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import Layout from "@/components/Layout"
import { API_URL } from "@/config/index"
import styles from "@/styles/Event.module.css"

export default function EventPage({evt}) {

  console.log("evt", evt)
  const deteleEvent = (e) => {
    console.log('delete')
  }
  return (
    <Layout>
      <div className={styles.event}>
        <div className={styles.controls}>
          <Link href={`/events/edit/${evt.id}`}>
            <div>
              <FaPencilAlt /> Edit Event
            </div>
          </Link>
          <a href="#" className={styles.delete}
            onClick={deteleEvent}>
            <FaTimes /> Delete Event
          </a>
        </div>

        <span>
          {evt.date} at {evt.time}
        </span>
        <h1>{evt.name}</h1>
        {evt.image && (
          <div className={styles.image}>
            <Image src={evt.image.formats.thumbnail.url}
              width={960}
              height={600} />
          </div>
        )}
        <h3>Performers: </h3>
        <p>{evt.performers}</p>
        <h3>Description:</h3>
        <p>{evt.description}</p>
        <h3>Venue: {evt.venue}</h3>
        <p>{evt.address}</p>

        <Link href='/events'>
          <div className={styles.back}>{'<'}Go Back</div>
        </Link>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {

  const res = await fetch(`${API_URL}/api/events`)
  const events = await res.json()

  console.log("events", events.data)
  const paths = events.data.map(evt => ({
    params: { slug: evt.slug }
  }))

  console.log({ paths })
  return {
    paths,
    fallback: true,
  }
}

export async function getStaticProps({ params: { slug } }) {
  const res = await fetch(`${API_URL}/api/events?slug=${slug}`)
  const events = await res.json()

  return {
    props: {
      evt: events.data
    },
    revalidate: 1
  }
}

// export async function getServerSideProps({query:{slug}}){
//   const res = await fetch(`${API_URL}/api/events/${slug}`)
//   const events = await res.json()
//   return{
//     props: {
//       evt: events[0]
//     },
//   }
// }
