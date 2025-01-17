import 'hyuni-style';
import styles from './page.module.css';
import VideoToGifConverter from './VideoToGifConverter';

export default function Home() {
  return (
    <div className={styles.page}>
      <VideoToGifConverter />
    </div>
  );
}
