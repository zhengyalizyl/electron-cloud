import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => {
    return (
        <button
            type="button"
            className={`btn btn-block no-border ${colorClass}`}
            onClick={onBtnClick}
        >
            <FontAwesomeIcon className='mr-2' size="lg" title='编辑' icon={icon} />
            {text}
        </button>
    )
}

export default BottomBtn