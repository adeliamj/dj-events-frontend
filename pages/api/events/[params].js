import { events } from '../../../data.json';

export default function handler(req, res) {
    const { param } = req.query; 
    if (req.method === 'GET') {
        const evt = events.find(ev => ev.slug === param || ev.id === parseInt(param));

        if (!evt) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        return res.status(200).json(evt);
    }

    if (req.method === 'PUT') {
        const index = events.findIndex(ev => ev.slug === param || ev.id === parseInt(param));

        if (index === -1) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        if (!req.body || !req.body.data) {
            return res.status(400).json({ message: 'Format request salah, gunakan { "data": { ... } }' });
        }

        const { title, description, date, venue, performers } = req.body.data;

        if (!title || !description || !date || !venue || !performers) {
            return res.status(400).json({ message: 'Title, Description, Date, Venue, dan Performers harus ada' });
        }

        events[index] = { ...events[index], title, description, date, venue, performers };

        return res.status(200).json(events[index]);
    }

    if (req.method === 'DELETE') {
        const index = events.findIndex(ev => ev.slug === param || ev.id === parseInt(param));

        if (index === -1) {
            return res.status(404).json({ message: 'Event tidak ditemukan' });
        }

        events.splice(index, 1);

        return res.status(200).json({ message: 'Event berhasil dihapus' });
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Metode ${req.method} tidak diizinkan` });
}
