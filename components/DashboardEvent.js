import Link from 'next/link';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import styles from '@/styles/DashboardEvent.module.css';

export default function DashboardEvent({ evt, deleteEvent }) {
    return (
        <div className={styles.event}>
            <h4>
                <Link href={`/events/${evt.slug}`}>
                    <div>{evt.name}</div>
                </Link>
            </h4>
            <Link href={`/events/edit/${evt.id}`}>
                <div className={styles.edit}>
                    <FaPencilAlt /> <span>Edit Event</span>
                </div>
            </Link>
            <a
                href='#'
                className={styles.delete}
                onClick={(e) => {
                    e.preventDefault(); 
                    deleteEvent();
                }}>
                <FaTimes /> <span>Delete</span>
            </a>
        </div>
    );
}
