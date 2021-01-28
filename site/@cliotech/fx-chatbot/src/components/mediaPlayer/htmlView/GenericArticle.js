import React from 'react'

const GenericArticle = (src) => {
    return (
        <article>
            <img src={src.src} style={{ width: '100%' }} />
        </article>
    )

}

export default GenericArticle