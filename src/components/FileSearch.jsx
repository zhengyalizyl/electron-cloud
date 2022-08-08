import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import useKeyPress from '../hooks/useKeyPress';

const FileSearch = ({ title, onFileSearch }) => {
    const [inputActive, setInputActive] = useState(false);
    const [value, setValue] = useState('');
    const enterPressed = useKeyPress(13);
    const escPressed = useKeyPress(27);

    const node = useRef(null)
    const closeSearch = () => {
        setInputActive(false);
        setValue('')
    }


    useEffect(() => {
        // const handleInputEvent = (event) => {
        //     const { keyCode } = event;
        //     if (keyCode === 13 && inputActive) {
        //         onFileSearch(value)
        //     } else if (keyCode === 27 && inputActive) {
        //         closeSearch(event)
        //     }
        // }
        // document.addEventListener('keyup', handleInputEvent);
        // return () => {
        //     document.removeEventListener('keyup', handleInputEvent)
        // }
        if (enterPressed && inputActive) {
            onFileSearch(value)
        }
        if (escPressed && inputActive) {
            closeSearch()
        }

    })

    useEffect(() => {
        inputActive && node.current.focus();
    }, [inputActive])
    return (
        <div className="alert alert-primary">
            {
                !inputActive && <div className='d-flex align-items-center justify-content-between mb-0'>
                    <span>{title}</span>
                    <button
                        type="button"
                        onClick={() => setInputActive(true)}
                        className="icon-button">
                        <FontAwesomeIcon size="lg" title='搜索' icon={faSearch} />

                    </button>
                </div>
            }
            {
                inputActive && (
                    <div className='d-flex align-items-center justify-content-between mb-0'>
                        <input
                            ref={node}
                            type="text"
                            className="form-control"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={(e) => closeSearch(e)}
                            className="icon-button">
                            <FontAwesomeIcon size="lg" title='关闭' icon={faTimes} />
                        </button>
                    </div>
                )
            }
        </div>
    )
}

export default FileSearch
