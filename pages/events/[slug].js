import Layout from "@/components/Layout"

export default function EventPage() {
    const router = useRouter()

    console.log(router)
    return (
      <Layout title='Add New Event'>
          <h1>My Events</h1>
      </Layout>
    )
  }
  