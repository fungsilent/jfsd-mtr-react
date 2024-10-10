import { mtrLines, getStationName } from '../data'
import TrainCard from './TrainCard'

const TrainsSection = ({ direction, lineCode, dataset }) => {
    if (!lineCode) return null

    const destinations = mtrLines[lineCode][direction]
        .map(stationCode => getStationName(lineCode, stationCode))
        .join(' / ')

    return (
        <div className='trains-section'>
            <p className='title'>往 {destinations} 方向</p>
            <div className='trains'>
                {dataset.map(data => (
                    <TrainCard
                        key={data.name}
                        lineCode={lineCode}
                        color={mtrLines[lineCode].color}
                        {...data}
                    />
                ))}
            </div>
        </div>
    )
}

export default TrainsSection
