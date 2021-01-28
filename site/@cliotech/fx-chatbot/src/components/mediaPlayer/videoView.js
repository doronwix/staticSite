import React from 'react'

import styles from './index.module.scss'

const VideoView = (params) => {
    let w = Math.min(640, window.innerWidth * 0.8)
    let h = w * 0.5625
    return (
        <iframe
            title="mp-iframe"
            allowFullScreen={true}
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
            oallowfullscreen="true"
            msallowfullscreen="true"
            /* eslint react/no-unknown-property: 0 */
            allowtransparency="true"
            className={styles.iframe + ' wistia_embed'}
            frameBorder="0"
            height={h}
            name="wistia_embed"
            scrolling="no"
            src={params.url}
            width={w}
        />
    )
}


export default VideoView