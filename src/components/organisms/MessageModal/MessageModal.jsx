import styles from './MessageModal.module.css';
import Button from '../../atoms/Button/Button';
import { useEffect, useState } from 'react';

const MessageModal = ({ image, message, btnText, btnPath, btnClass }) => {

  const [isMobile, setIsMobile] = useState(window.innerWidth<1000);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const finalBtnClass = (btnClass === 'liquid' && isMobile) ? 'liquid_mobile' : btnClass;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.content}>
          <img src={image} alt="Status icon check" className={styles.icon} />
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <Button 
            text={btnText} 
            path={btnPath} 
            BtnClass={finalBtnClass} 
          />
        </div>
      </div>
    </div>
  );
};

export default MessageModal;