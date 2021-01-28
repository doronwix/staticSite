import React from 'react'
import style from './index.module.scss'

const Block = ({ data, selected, onClick }) => {
    return (
        <li id={`block_${data.id}`}
            className={`${style.block} ${selected ? style.selected : ''}`}
            onClick={() => onClick(data.id)}>
            { 
                data.name ?
                    ( <>
                      <div className={style.name}>{data.name}</div>
                      <div className={style.id}>{data.id}</div>
                    </> ) : 
                    ( <div className={`${style.id} ${style.only}`}>{data.id}</div> )
            }
        </li>
    )
}

export default Block
