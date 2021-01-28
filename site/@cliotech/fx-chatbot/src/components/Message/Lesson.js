import React from 'react'

import styles from './index.module.scss'

const Lesson = ({
    played,
    timeout,
    viewed,
    grace,
    thumbnail,
    thumbnailDimensions,
    url,
    title,
    subtitle,
    description,
    onPlay,
    onClose,
    type
}) => {
    window.clearTimeout(window.videoTimeout)
    if (!played && !timeout) {
        window.videoTimeout = window.setTimeout(() => {
            onClose('timeoutVideo')
        }, grace * 1000)
    }

    return (
        <div
            className={`${styles.lessonContainer} ${styles[type]}`}
            onClick={() => {
                window.clearTimeout(window.videoTimeout)
                onPlay(url)
            }}
        >
            <div className={`${styles.title}`}>{title}</div>
            {thumbnailDimensions ? (
                <img
                    alt=""
                    src={thumbnail}
                    style={{
                        width: thumbnailDimensions[0] + 'px',
                        height: thumbnailDimensions[1] + 'px'
                    }}
                />
            ) : (
                    <img alt="" src={thumbnail} />
                )}
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
            <div className={styles.description}>{description}</div>
        </div>
    )
}

export default Lesson