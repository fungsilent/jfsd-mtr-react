import { useState, useReducer } from 'react'
import { mtrLines } from './data'
import './main.css'
import Loading from './components/Loading'
import LineButton from './components/LineButton'
import TrainsSection from './components/TrainsSection'

function dataReducer(state, { type, payload }) {
    switch (type) {
        case 'LOADING': {
            return {
                isLoading: true,
                error: '',
                lastUpdate: '',
                upDataset: [],
                downDataset: [],
            }
        }
        case 'SUCCESSFUL': {
            return {
                isLoading: false,
                error: '',
                ...payload,
            }
        }
        case 'FAILED': {
            return {
                isLoading: false,
                error: payload.error,
                lastUpdate: '',
                upDataset: [],
                downDataset: [],
            }
        }
        default: {
            return state
        }
    }
}

const App = () => {
    const [selectedLineCode, setLineCode] = useState('')
    const [dataState, dispatch] = useReducer(dataReducer, {
        isLoading: false,
        error: '',
        lastUpdate: '',
        upDataset: [],
        downDataset: [],
    })

    const onSelectLine = async lineCode => {
        setLineCode(lineCode)
        dispatch({ type: 'LOADING' })

        const payload = await getAllData(lineCode)
        if (payload) {
            dispatch({
                type: 'SUCCESSFUL',
                payload: {
                    lastUpdate: payload.lastUpdate,
                    upDataset: payload.up,
                    downDataset: payload.down,
                },
            })
        } else {
            dispatch({
                type: 'FAILED',
                payload: 'error message',
            })
        }
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
            <p className='last-updated-time'>{dataState.lastUpdate ? `最後更新時間: ${dataState.lastUpdate}` : '你想去邊先?'}</p>
            {dataState.isLoading && <Loading />}
            <div className='trains-container'>
                {!dataState.isLoading && (
                    <TrainsSection
                        direction='up'
                        lineCode={selectedLineCode}
                        dataset={dataState.upDataset}
                    />
                )}
                {!dataState.isLoading && (
                    <TrainsSection
                        direction='down'
                        lineCode={selectedLineCode}
                        dataset={dataState.downDataset}
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
            directions.forEach(direction => {
                const key = direction.toUpperCase()
                if (!!data[key]?.[0]) {
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
            throw new Error('no data')
        }
        return response.data[`${line}-${station}`]
    } catch (err) {
        // handle 500
        console.log('fetch error:', { line, station })
        return null
    }
}

export default App
