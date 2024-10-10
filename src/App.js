import { useState } from 'react'
import { mtrLines, getStationName } from './data'
import Loading from './components/Loading'
import LineButton from './components/LineButton'
import TrainsSection from './components/TrainsSection'

const App = () => {
    const [isLoading, setLoading] = useState(false)
    const [selectedLineCode, setLineCode] = useState('')
    const [lastUpdate, setLastUpdate] = useState('')
    const [upDataset, setUpDataset] = useState([])
    const [downDataset, setDownDataset] = useState([])

    console.log('selectedLineCode', upDataset)

    const onSelectLine = async lineCode => {
        // fetch data
        setLoading(true)
        setLineCode(lineCode)
        const { up, down, lastUpdate } = await getAllData(lineCode)

        // set data
        setLastUpdate(lastUpdate)
        setUpDataset(up)
        setDownDataset(down)
        setLoading(false)
    }

    /* render */
    const renderLineButtons = () => {
        let buttons = []
        for (const lineCode in mtrLines) {
            const line = mtrLines[lineCode] // line object
            buttons.push(
                <LineButton
                    key={lineCode}
                    name={line.text}
                    color={line.color}
                    lineCode={lineCode}
                    selected={lineCode === selectedLineCode}
                    onSelectLine={onSelectLine}
                />
            )
        }
        return buttons
    }

    return (
        <section className='container'>
            <div className='lines'>{renderLineButtons()}</div>
            <p className='last-updated-time'>
                {lastUpdate ? `最後更新時間: ${lastUpdate}` : '你想去邊先?'}
            </p>
            {isLoading && <Loading />}
            <div className='trains-container'>
                {!isLoading && (
                    <TrainsSection
                        direction='up'
                        lineCode={selectedLineCode}
                        dataset={upDataset}
                    />
                )}
                {!isLoading && (
                    <TrainsSection
                        direction='down'
                        lineCode={selectedLineCode}
                        dataset={downDataset}
                    />
                )}
            </div>
        </section>
    )
}

async function getAllData(lineCode) {
    /* step 1: fetch all data from api */
    const fetchTasks = mtrLines[lineCode].sta.map(async ({ code, name }) => {
        const data = await fetchApiData(lineCode, code)
        return {
            ...data,
            name,
        }
    })
    const fetchData = await Promise.all(fetchTasks)

    /* step 2: format data */
    const dataset = {
        up: [],
        down: [],
        lastUpdate: '',
    }
    const directions = ['up', 'down']
    fetchData
        .sort((a, b) => new Date(b.sys_time) - new Date(a.sys_time))
        .forEach(data => {
            if (!data) return
            directions.forEach(direction => {
                const key = direction.toUpperCase()
                if (!!data[key] && data[key]?.[0]) {
                    dataset[direction].push({
                        name: data.name,
                        ...data[key][0],
                    })
                }
            })
        })

    dataset.lastUpdate = fetchData[0]?.sys_time

    return dataset
}

async function fetchApiData(line, station) {
    try {
        const endpoint = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${station}`
        let response = await fetch(endpoint)
        response = await response.json()
        if (response.status === 0) {
            // handle 429 or other not successful
            console.log('fetch error:', { line, station })
            return null
        }
        return response.data[`${line}-${station}`]
    } catch (err) {
        // handle 500
        return null
    }
}

export default App
