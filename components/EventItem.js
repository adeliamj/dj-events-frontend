import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/EventItem.module.css';

export default function EventItem({ evt }) {
  return (
    <div className={styles.event}>
      <div className={styles.img}>
        <Image
          src={evt.image || '/images/event-default.png'} // If no image, use the default one
          alt={evt.name || "Event Image"}
          width={170}
          height={100}
        />
      </div>

      <div className={styles.info}>
        <span>
          {new Date(evt.date).toLocaleDateString('en-US')} at {evt.time}
        </span>
        <h3>{evt.name}</h3>
      </div>

      <div className={styles.link}>
        <Link href={`/events/${evt.slug}`}>
          <div className='btn'>Details</div>
        </Link>
      </div>
    </div>
  );
}
