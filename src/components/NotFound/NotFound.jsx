import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.code}>404</div>
            <h1 className={styles.title}>Page Not Found</h1>
            <p className={styles.message}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/" className={`btn btn-primary ${styles.homeBtn}`}>
                🏠 Go Back Home
            </Link>
        </div>
    );
}
