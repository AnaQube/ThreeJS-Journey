import { useMemo, useState } from "react"
import Clicker from "./Clicker.jsx"
import People from "./People.jsx"

export default function App({ children, clickersCount }) {
    const [ hasClicker, setHasClicker ] = useState(true)
    const [ count, setCount ] = useState(0)

    const buttonClick = () => {
        setHasClicker(val => !val)
    }

    const increment = () => {
        setCount(val => val + 1)
    }

    // const colors = []

    // for (let i = 0; i < clickersCount; i++) {
    //     colors.push(`hsl(${ Math.random() * 360 }deg, 100%, 70%)`)
    // }

    const colors = useMemo(() => {
        console.log('useMemo')
        const colors = []

        for (let i = 0; i < clickersCount; i++)
            colors.push(`hsl(${ Math.random() * 360 }deg, 100%, 70%)`)

        return colors
    }, [ clickersCount ])

    return <div>
        { children }

        <div>Total count: { count }</div>

        <button onClick={ buttonClick }>{ hasClicker ? 'Hide' : 'Show'} Clicker</button>
        {/* { hasClicker ? <Clicker /> : null } */}
        { hasClicker && <>
            { [...Array(clickersCount)].map((value, index) => 
                <Clicker key={ index } increment={ increment } keyName={ `count${index}` } buttonColor={ colors[index] }/>
            ) }
        </> }

        <People></People>
    </div>
}