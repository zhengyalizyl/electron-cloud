import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
    const [editStatus, setEditStatus] = useState(false);
    const [value, setValue] = useState('');
    const closeSearch = (e) => {
        e.preventDefault();
        setValue('')
    }
    useEffect(() => {
        const handleInputEvent = (event) => {
            const { keyCode } = event;
            if (keyCode === 13 && editStatus) {
                const editItem=files.find(file=>file.id===editStatus);
                onSaveEdit(editItem.id,value);
                setEditStatus(false);
                setValue('')
            } else if (keyCode === 27 && editStatus) {
                closeSearch(event)
            }
        }
        document.addEventListener('keyup', handleInputEvent);
        return () => {
            document.removeEventListener('keyup', handleInputEvent)
        }
    })

    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li
                        key={file.id}
                        className="list-group-item bg-light d-flex row align-items-center file-item  mx-0"
                    >
                        {
                            (file.id !== editStatus) && (<>
                                <span className='col-2'>
                                    <FontAwesomeIcon size="lg" title='搜索' icon={faMarkdown} />
                                </span>
                                <span
                                    className='col-6 c-link'
                                    onClick={() => { onFileClick(file.id) }}
                                >
                                    {file.title}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditStatus(file.id);
                                        setValue(file.title)
                                    }}
                                    className="icon-button col-2">
                                    <FontAwesomeIcon size="lg" title='编辑' icon={faEdit} />

                                </button>
                                <button
                                    type="button"
                                    onClick={() => { onFileDelete(file.id) }}
                                    className="icon-button col-2">
                                    <FontAwesomeIcon size="lg" title='删除' icon={faTrash} />

                                </button>
                            </>)
                        }
                        {(file.id === editStatus) && (
                            <>
                                <input
                                    type="text"
                                    className="form-control col-10"
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => closeSearch(e)}
                                    className="icon-button col-2">
                                    <FontAwesomeIcon size="lg" title='关闭' icon={faTimes} />
                                </button>
                            </>
                        )}
                    </li>
                ))
            }
        </ul>
    )
}

export default FileList