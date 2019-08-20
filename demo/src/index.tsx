import './index.scss'
import React, { useState } from 'react'
import { render } from 'react-dom'

import { useStore, getStore } from '../../src/'

function Comp1() {
    let [state] = useStore('comp1', 1)
    return (
        <div className="card" style={{ marginBottom: '10px' }}>
            <div className="card-header">组件1:comp1</div>
            <div className="card-body">{state}</div>
        </div>
    )
}

function Comp2() {
    let [state] = useStore('comp2', 2, { handle: state => state * 2 })
    return (
        <div className="card" style={{ marginBottom: '10px' }}>
            <div className="card-header">组件2:comp2</div>
            <div className="card-body">{state}</div>
        </div>
    )
}

function Comp3() {
    let [state, dispatch] = useStore('comp3', 3)
    return (
        <div className="card" style={{ marginBottom: '10px' }}>
            <div className="card-header">组件3:comp3</div>
            <div className="card-body">
                <button type="button" className="btn btn-primary" onClick={() => dispatch(state + 1)}>
                    click_{state}
                </button>
            </div>
        </div>
    )
}

function Comp4() {
    let store = getStore()
    let [key, setKey] = useState('comp1')
    let [state, setState] = useState()
    return (
        <div className="card" style={{ marginBottom: '10px' }}>
            <div className="card-header">组件4</div>
            <div className="card-body">
                <form>
                    <div className="form-group">
                        <label>指定组件</label>
                        <input value={key} className="form-control" onChange={e => setKey(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>状态值</label>
                        <input
                            type="number"
                            value={state}
                            className="form-control"
                            onChange={e => setState(Number(e.target.value))}
                        />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => store.dispatch(state, key)}>
                        Dispatch
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function Demo() {
    return (
        <div className="container">
            <Comp1 />
            <Comp2 />
            <Comp3 />
            <Comp4 />
        </div>
    )
}

render(<Demo />, document.querySelector('#demo'))
