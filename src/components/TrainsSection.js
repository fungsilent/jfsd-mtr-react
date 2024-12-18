import { mtrLines, getStationName } from '../data'
import TrainCard from './TrainCard'

const TrainsSection = ({ direction, lineCode, dataset }) => {
    if (!lineCode) return null
    const color = mtrLines[lineCode].color
    const destinations = mtrLines[lineCode][direction].map(stationCode => getStationName(lineCode, stationCode)).join(' / ')

    return (
        <div
            className='trains-section'
            style={{ '--color': color }}
        >
            <p className='title'>
                往 <span>{destinations}</span> 方向
            </p>
            <div className='trains'>
                {dataset.length > 0 ? (
                    dataset.map(data => (
                        <TrainCard
                            key={data.name}
                            lineCode={lineCode}
                            color={color}
                            {...data}
                        />
                    ))
                ) : (
                    <div className='no-trains'>沒有列車</div>
                )}
            </div>
        </div>
    )
}

export default TrainsSection
