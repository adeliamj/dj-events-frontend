import { events } from '../../../data.json'; // Data events yang diimpor

export default function handler(req, res) {
    const { param } = req.query; // ID atau slug event yang diberikan dalam URL

    // Menangani permintaan GET
    if (req.method === 'GET') {
        const evt = events.find(ev => ev.slug === param || ev.id === parseInt(param));

        if (!evt) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        return res.status(200).json(evt);
    }

    // Menangani permintaan PUT untuk update event
    if (req.method === 'PUT') {
        const index = events.findIndex(ev => ev.slug === param || ev.id === parseInt(param));

        if (index === -1) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        // Validasi body request agar sesuai format Strapi v4
        if (!req.body || !req.body.data) {
            return res.status(400).json({ message: 'Format request salah, gunakan { "data": { ... } }' });
        }

        const { title, description, date, venue, performers } = req.body.data;

        if (!title || !description || !date || !venue || !performers) {
            return res.status(400).json({ message: 'Title, Description, Date, Venue, dan Performers harus ada' });
        }

        // Update data event
        events[index] = { ...events[index], title, description, date, venue, performers };

        return res.status(200).json(events[index]);
    }

    // Menangani permintaan DELETE
    if (req.method === 'DELETE') {
        const index = events.findIndex(ev => ev.slug === param || ev.id === parseInt(param));

        if (index === -1) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        // Hapus event dari array
        events.splice(index, 1);

        return res.status(200).json({ message: 'Event berhasil dihapus' });
    }

    // Menangani metode yang tidak diizinkan
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Metode ${req.method} tidak diizinkan` });
}
