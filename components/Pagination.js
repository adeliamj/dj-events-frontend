import Link from 'next/link';
import { PER_PAGE } from '@/config/index';
import styles from '@/styles/Pagination.module.css'

export default function Pagination({ page, total }) {
  const lastPage = total > 0 ? Math.ceil(total / PER_PAGE) : 1;
  console.log("Total:", total, "Last Page:", lastPage);

  return (
    <div className={styles.pagination}>
      {page > 1 && (
        <Link href={`/events?page=${page - 1}`}>
          <div className="btn-secondary">Prev</div>
        </Link>
      )}

      {page < lastPage && (
        <Link href={`/events?page=${page + 1}`}>
          <div className="btn-secondary">Next</div>
        </Link>
      )}
    </div>
  );
}

