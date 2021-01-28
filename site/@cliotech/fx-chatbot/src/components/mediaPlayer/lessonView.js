import React from 'react'

import styles from './index.module.scss'

import HtmlView from './htmlView'

const LessonView = (params) => {
    return (
        <div className={styles.lessonViewer + ' ' + styles.lesson} >
            <HtmlView src={params.url} />
        </div>)
}


export default LessonView