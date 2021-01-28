import React from 'react'

import styles from './index.module.scss'


const FeedbackChoice = ({ data_automation_key, data, blockId, onClick, selected }) => {
    const click = () => {
        onClick(data, blockId)
    }
    return (
        <button data-automation={data_automation_key} 
            className={`${styles[data.type]} ${selected ? styles.selected : ''}`}
            onClick={click}
        />
    )
}

export default FeedbackChoice