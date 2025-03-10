import Link from 'next/link';
import { PER_PAGE } from '@/config/index';

export default function Pagination({ page, total }) {
    const lastPage = Math.ceil(total / PER_PAGE);
    console.log(lastPage);
  
    return (
      <>
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
      </>
    );
  }
  
