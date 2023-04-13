import { useEffect, useRef, useState } from "react"

export default function Clicker({ increment, keyName, buttonColor }) {
    const [ count, setCount ] = useState(parseInt(localStorage.getItem(keyName) ?? 0))
    useEffect(() => {
        return () => {
            localStorage.removeItem(keyName)
        }
    }, [])

    const buttonRef = useRef()

    useEffect(() => {
        buttonRef.current.style.backgroundColor = 'papayawhite'
        buttonRef.current.style.color = 'salmon'

        localStorage.setItem(keyName, count)
    }, [ count ])

    const buttonClick = () => {
        setCount(value => value + 1)
        increment()
    }

    return <div>
        <div style={ { color: buttonColor } }>Clicks count: {count} </div>
        <button ref={ buttonRef } onClick={ buttonClick } style={{color: buttonColor}}>Click me</button>
    </div>
}