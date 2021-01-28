import React from 'react'
import styles from './index.module.scss'

const Header = ({ name, slogan, onClose, direction }) => {
    return (
        <div className={styles.header + ' emily-header'}>
            <div className={styles.name}>{name}</div>
            {slogan && <div className={styles.slogan}>{slogan}</div>}
            <div className={`${styles.close} ${direction !== 'rtl' ? styles.ltr : styles.rtl}`} 
                onClick={onClose} />
        </div>
    )
}

export default Header
