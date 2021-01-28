import React from 'react'

import styles from './index.module.scss'


const Choice = ({ data_automation_key, data, blockId, onClick }) => {
    const click = () => {
        onClick(data, blockId)
    }
    return (
        <button data-automation={data_automation_key} onClick={click} dangerouslySetInnerHTML={{ __html: data.text }} />
    )
}

export default Choice