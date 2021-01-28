import React, { useEffect } from 'react'
import style from './index.module.scss'

const Diagram = ({ data, selected, onSelect }) => {
    const container = React.createRef()

    useEffect(() => {
        var d3 = d3 || window.d3
        var width = container.current.offsetWidth * 3
        var height = container.current.offsetHeight

        // append the svg object to the body of the page
        var svg = d3
            .select('#my_dataviz')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(40,40)') // bit of margin on the left = 40

        var cluster = d3.cluster().size([height, width - 100]) // 100 is the margin I will have on the right side

        // Give the data to this cluster layout:
        var root = d3.hierarchy(data, function(d) {
            return d.children
        })
        cluster(root)

        // Add the links between nodes:
        svg
            .selectAll('path')
            .data(root.descendants().slice(1))
            .enter()
            .append('path')
            .attr('d', function(d) {
                return (
                    'M' +
          d.y +
          ',' +
          d.x +
          'C' +
          (d.parent.y + 50) +
          ',' +
          d.x +
          ' ' +
          (d.parent.y + 150) +
          ',' +
          d.parent.x + // 50 and 150 are coordinates of inflexion, play with it to change links shape
          ' ' +
          d.parent.y +
          ',' +
          d.parent.x
                )
            })
            .style('fill', 'none')
            .attr('stroke', '#ccc')

        // Add a circle for each node.

        let g = svg
            .selectAll('g')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('transform', function(d) {
                return 'translate(' + d.y + ',' + d.x + ')'
            })

        g.on('click', (d, i) => {
            onSelect(d)
        })

        g.append('circle')
            .attr('r', 15)
            .attr('fill', 'white')
        // .style('fill', d => {
        //   return selected === d.data.id ? '#aaa' : '#fff'
        // })
            .attr('stroke', 'black')
            .style('stroke-width', 1)

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'central')
            .attr('stroke-width', '1px')
            .attr('font-size', '12px')
            .attr('fill', 'black')
        // .attr('fill', d => {
        //   return selected === d.data.id ? 'white' : 'black'
        // })
            .text(function(d) {
                return d.data.id
            })
    })

    return (
        <div ref={container} className={style.diagram_container} id="my_dataviz" />
    )
}

export default Diagram
