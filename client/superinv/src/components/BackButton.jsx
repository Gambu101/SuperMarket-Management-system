import React from 'react'
import './BackButton.css'
import {FaArrowLeft} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

export default function BackButton(){
    const navigate = useNavigate()
    return(
        <div>
            <button onClick={() => navigate(-1)}><FaArrowLeft/>Go Back</button>
        </div>
    )
}
