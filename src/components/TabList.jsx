import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './TabList.scss';

const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
    return (
        <ul className="nav nav-pills tablist-component">
            {files.map(file => {
                const withUnsavedMark=unsaveIds.includes(file.id)
                const fClassName = classNames('nav-link', 
                { 
                    "active": file.id === activeId,
                     "withUnsaved":withUnsavedMark
             })
                return (
                    <li className='nav-item' key={file.id}>
                        <a
                            href="#"
                            className={fClassName}
                            onClick={e => {
                                e.preventDefault();
                                onTabClick(file.id)
                            }}
                        >
                            {file.title}
                            <span 
                            onClick={e=>{
                                e.stopPropagation();
                                onCloseTab(file.id)
                            }}
                            className='ml-2 close-icon' 
                            >
                                <FontAwesomeIcon size="lg" title='删除' icon={faTimes} />
                            </span>
                            {withUnsavedMark&&(
                                <>
                                <span className='rounded-circle ml-2 unsaved-icon'>

                                </span>
                                </>
                            )}
                        </a>
                    </li>
                )
            }
            )}
        </ul>
    )
}

export default TabList