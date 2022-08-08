import React, { useEffect, useState, useRef } from 'react';


const useKeyPress=(tragetKeyCode)=>{
    const [keyPressed,setKeyPressed]= useState(false);
   
    const keyDownHandler=({keyCode})=>{
        if(keyCode===tragetKeyCode){
            setKeyPressed(true)
        }
    }

    const keyUpHandler=({keyCode})=>{
        if(keyCode===tragetKeyCode){
            setKeyPressed(false)
        }
    }

    useEffect(()=>{
        document.addEventListener('keydown',keyDownHandler);
        document.addEventListener('keyup',keyUpHandler);
        return ()=>{
            document.removeEventListener('keydown',keyDownHandler);
            document.removeEventListener('keyup',keyUpHandler);
        }
    },[])

    return keyPressed;
}

export default useKeyPress;