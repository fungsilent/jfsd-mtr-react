const TrainCard = ({ name, color, dest, time, plat }) => {
    return (
        <div
            className='train-card'
            style={{
                '--color': color,
            }}
        >
            <p className='name'>{name}</p>
            <p className='destination'>
                終點站: <span>{dest}</span>
            </p>
            <p className='time'>
                下班列車: <span>{time.split(' ')[1].substring(0, 5)}</span>
            </p>
            <p className='platform'>
                開出月台: <span>{plat}</span>
            </p>
        </div>
    )
}

export default TrainCard
