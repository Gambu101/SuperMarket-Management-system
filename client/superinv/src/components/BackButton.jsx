import React from 'react'
import './BackButton.css'
import { useNavigate } from 'react-router-dom'

export default function BackButton(){
    const navigate = useNavigate()
    return(
        <div>
            <button onClick={() => navigate(-1)}>← Go Back</button>
        </div>
    )
}
