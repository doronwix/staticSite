import React, { useState, useEffect } from 'react'
import style from './index.module.scss'
import Block from './block'
import Diagram from './diagram'
// import Tree from 'react-d3-tree'

const Blocks = ({ data, diagram, selected, onSelect }) => {
    const [status, setStatus] = useState(false)

    useEffect(() => {
        let b = document.querySelector(`#block_${selected}`)
        if (b) {
            b.scrollIntoView({
                behavior: 'smooth',
                inline: 'nearest',
                block: 'nearest'
            })
        }
    }, [selected])

    const refs = data.map(b => {
        return React.createRef()
    })

    const clickOnAdd = () => {
        setStatus(!status)
    }
    const addDefaultBlock = () => {
        onSelect(null, 'text')
    }
    const addBlock = e => {
        onSelect(null, e.target.getAttribute('data-value'))
    }

    const parse = (block, level = 1) => {
        if (block == null) return null

        let obj = {
            id: block.id,
            name: block.name ? block.name + ' (' + block.id + ')' : block.id,
            colname: `level${level}`,
            children: []
        }
        block.messages.forEach(message => {
            if (message.goto || message.blockId) {
                let child = parse(
                    data.find(b => b.id === (message.goto || message.blockId)),
                    level + 1
                )
                if (child != null) obj.children.push(child)
            } else if (message.choices) {
                if (message.response) {
                    let child = parse(
                        data.find(b => b.id === message.response.correct.goto),
                        level + 1
                    )
                    if (child != null) obj.children.push(child)
                    child = parse(
                        data.find(b => b.id === message.response.wrong.goto),
                        level + 1
                    )
                    if (child != null) obj.children.push(child)
                } else {
                    message.choices.forEach(choice => {
                        let child = parse(data.find(b => b.id === choice.goto), level + 1)
                        if (child != null) obj.children.push(child)
                    })
                }
            }
        })
        return obj
    }

    return (
    <>
      {diagram && (
          <div className={style.diagram}>
              <Diagram
                  selected={selected}
                  data={parse(data[0])}
                  onSelect={onSelect}
              />
          </div>
      )}
      <ul className={style.blocks}>
          { data.map((block) => (
              <Block key={`block_${block.id}`}
                  data={block}
                  selected={block.id === selected}
                  onClick={onSelect}
              />
          ))}
          <li className={`${style.block} ${style.new}`} onClick={addDefaultBlock}> + </li>
      </ul>
    </>
    )
}

export default Blocks
