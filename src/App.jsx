import logo from './logo.svg';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import defaultFiles from './utils/defaultFiles';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import react, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { flatternArr, objToArr } from './utils/helper'

function App() {

  const [files, setFiles] = useState(flatternArr(defaultFiles));
  const filesArr = objToArr(files);
  const [activeFileID, setActiveFileID] = useState('');
  const [openFileIDs, setOpenFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const [searchFiles, setSearchFiles] = useState([]);

  const openedFiles = openFileIDs.map(openID => {
    return files[openID]
  })

  const activeFile = files[activeFileID];
  const handleChange = (id, value) => {
    const newFile= {
      ...files[id],
      body:value
    }

    setFiles({...files,[id]:newFile});
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  };
  const fileClick = (fileID) => {
    setActiveFileID(fileID);
    if (!openFileIDs.includes(fileID)) {
      setOpenFileIDs([...openFileIDs, fileID])
    }
  }

  const tabClick = (fileID) => {
    setActiveFileID(fileID);
  }

  const tabClose = (id) => {
    const tabsWithout = openFileIDs.filter(fileID => fileID !== id);
    setOpenFileIDs(tabsWithout)
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0])
    } else {
      setActiveFileID('')
    }
  }

  const deleteFile = (id) => {
    delete files[id]
    setFiles(files);
    tabClose(id)
  }
  const updateFileName = (id, title) => {
    const newFile= {
      ...files[id],
      title:title,
      isNew : false,
    }
    setFiles({...files,[id]:newFile});
  }

  const fileSearch = (keyword) => {

    const newFiles = filesArr.filter(file => file.title.includes(keyword));
    setSearchFiles(newFiles)
  }

  
  const createNewFile = () => {
    const newId=uuidv4();
    const newFile =
    {
      id: newId,
      title: '',
      body: '##请输入内容',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({...files,[newId]:newFile})
  }
  const fileListArr = searchFiles.length > 0 ? searchFiles : filesArr;

  return (
    <div className="App container-fluid px-0">
      <div className='row no-gutters'>
        <div className="col-3 bg-danger left-panel">
          <FileSearch
            title="我的云文档"
            onFileSearch={(keyword) => fileSearch(keyword)}
          ></FileSearch>
          <FileList
            files={fileListArr}
            onFileClick={(id) => fileClick(id)}
            onFileDelete={(id) => deleteFile(id)}
            onSaveEdit={(id, newValue) => updateFileName(id, newValue)}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary no-border"
                icon={faPlus}
                onBtnClick={createNewFile}
              >
              </BottomBtn>
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success no-border"
                icon={faFileImport}
              >
              </BottomBtn>
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          {!activeFile && (<>
            <div className='start-page'>
              选择或者创建新的markdown文档
            </div>
          </>)}
          {
            activeFile && (<>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={(id) => tabClick(id)}
                onCloseTab={(id) => tabClose(id)}
              ></TabList>

              <SimpleMDE
                key={activeFile && activeFile.id}
                id="your-custom-id"
                value={activeFile && activeFile.body}
                options={{
                  minHeight: '515px',
                  spellChecker: false,
                  toolbar: [
                    'bold',
                    'italic',
                    'heading',
                    '|',
                    'quote',
                    'code',
                    'table',
                    'horizontal-rule',
                    'unordered-list',
                    'ordered-list',
                    '|',
                    'link',
                    'image',
                    '|',
                    'side-by-side',
                    'fullscreen',
                    '|',
                    'guide'
                  ]
                }}
                onChange={(value) => handleChange(activeFile.id, value)}
              />
            </>)
          }

        </div>
      </div>
    </div>
  );
}

export default App;
