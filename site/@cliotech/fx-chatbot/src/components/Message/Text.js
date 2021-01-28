import React from 'react'

import styles from './index.module.scss'

const Text = ({ sender, text, direction, data_automation_key }) => {
    return (
        <div data-automation={data_automation_key}
            className={`${styles.text} ${styles.fullsize} 
            ${sender === 'user' ? styles.user : styles.bot}
            ${direction !== 'rtl' ? styles.ltr : styles.rtl}`}
            dangerouslySetInnerHTML={{ __html: text }}
        />
    )
}

export default Text