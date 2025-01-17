import 'hyuni-style';
import styles from './page.module.css';
import VideoToGifConverter from './VideoToGifConverter';

export default function Home() {
  return (
    <div>
      <main className={styles.Main}>
        <h1 className={styles.Title}>Convert Video to GIF</h1>
        <VideoToGifConverter />
      </main>
    </div>
  );
}
