import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import useKeyPress from '../hooks/useKeyPress';

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
    const [editStatus, setEditStatus] = useState(false);
    const [value, setValue] = useState('');
    const enterPressed = useKeyPress(13);
    const escPressed = useKeyPress(27);
    const closeSearch = (editItem) => {
        setEditStatus(false);
        setValue('');
        if(editItem.isNew){
            onFileDelete(editItem.id)
        }
    }
    useEffect(() => {
            const editItem = files.find(file => file.id === editStatus);
            if (enterPressed && editStatus&&value.trim()!='') {
                onSaveEdit(editItem.id, value,editItem.isNew);
                setEditStatus(false);
                setValue('')
            } else if (escPressed && editStatus) {
                closeSearch(editItem)
            }
      
    })

    useEffect(() => {
        const newFile = files.find(file => file.isNew);
        if (newFile) {
            setEditStatus(newFile.id);
            setValue(newFile.title)
        }
    }, [files])

    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li
                        key={file.id}
                        className="list-group-item bg-light d-flex row align-items-center file-item  mx-0"
                    >
                        {
                            (file.id !== editStatus && !file.isNew) && (<>
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
                        {(file.id === editStatus || file.isNew) && (
                            <>
                                <input
                                    type="text"
                                    className="form-control col-10"
                                    value={value}
                                    placeholder="请输入文件名称"
                                    onChange={e => setValue(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => closeSearch(file)}
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