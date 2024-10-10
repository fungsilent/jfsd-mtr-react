const LineButton = ({ name, color, lineCode, selected, onSelectLine }) => {
    let className = ['line']
    if (selected) className.push('active')

    const handleClick = event => {
        onSelectLine(lineCode)
    }

    /* render */
    return (
        <div
            className={className.join(' ')}
            style={{
                '--color': color,
            }}
            onClick={handleClick}
        >
            <span>{name}</span>
        </div>
    )
}

export default LineButton
