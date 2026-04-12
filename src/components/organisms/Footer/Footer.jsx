import styles from "./Footer.module.css";

function Footer() {
  return (
    <>
      <footer>
        <div className={styles.wrapperFooter}>
          <p>© 2026 CODE CRAFTERS</p>
          <p>JENNIFER CROS</p>
          <p>ALL RIGHTS RESERVED</p>
        </div>
        <div className={styles.titleApp}>
          <p>
            CODE<span className={styles.hyphen}>_</span>CRAFTERS
          </p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
