import React from 'react'
import ReactDOM from 'react-dom/client'
import App_useState from './App_useState'
import App_useReducer from './App_useReducer'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        {/* <App_useState /> */}
        <App_useReducer />
    </React.StrictMode>
)
