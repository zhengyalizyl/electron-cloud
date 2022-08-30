import logo from './logo.svg';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileImport, faPlus, faSave } from '@fortawesome/free-solid-svg-icons'
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
import { flatternArr, objToArr, timeStampToString } from './utils/helper';
import fileHelper from './utils/fileHelper';
import useIpcRenderer from './utils/useIpcRenderer';
import Loader from './components/Loader';

const shareObject = window.require('@electron/remote').getGlobal("shareObject")
const isDev = shareObject.isDev
const currentVersion = shareObject.currentVersion;

//require nodejs modules
const { join, basename, extname, dirname } = window.require('path');
const { app, dialog, ipcRenderer } = window.require('@electron/remote'); //electron 14之后改了

const Store = window.require('electron-store');
const fileStore = new Store({ "name": 'Files Data' });
const settingsStore = new Store({ "name": 'settings' });
const getAutoSync = ["accessKey", "secretKey", "bucketkey", "enableAutoSync"].every(key => !!settingsStore.get(key));

const saveFilesToStore = (files) => {
  //we do not have to store any info in file system,eg:isnew,body,etc
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt, isSynced, updateAt } = file;
    result[id] = {
      id,
      path,
      title,
      createdAt,
      isSynced,
      updateAt
    }
    return result;
  }, {});

  fileStore.set('files', filesStoreObj);
}

function App() {
  const [files, setFiles] = useState(fileStore.get('files') || {});
  const filesArr = objToArr(files);
  const [activeFileID, setActiveFileID] = useState('');
  const [openFileIDs, setOpenFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const [searchFiles, setSearchFiles] = useState([]);
  const savedLocation = settingsStore.get('savedFileLocation') || app.getPath('documents');
  const [isLoading,setIsLoading]=useState(false)

  const openedFiles = openFileIDs.map(openID => {
    return files[openID]
  })

  // useEffect(()=>{
  //   const callback=()=>{
  //     console.log('hello from menu')
  //   }
  //   ipcRenderer.on('create-new-file',callback);
  //   return ()=>{
  //     ipcRenderer.removeEventListener('create-new-file',callback)
  //   }
  // },[])


  const activeFile = files[activeFileID];
  const handleChange = (id, value) => {

    if (value !== files[id].body) {
      const newFile = {
        ...files[id],
        body: value
      }

      setFiles({ ...files, [id]: newFile });
      if (!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id])
      }
    }

  };
  const fileClick = (fileID) => {
    setActiveFileID(fileID);
    const currentFile = files[fileID];
    const { isLoaded, id, title, path } = currentFile;
    if (!isLoaded) {
      if (getAutoSync()) {
        ipcRenderer.send('download-file', {
          key: `${title}.md`,
          path,
          id
        })
      } else {
        fileHelper.readFile(path).then(value => {
          const newFile = { ...files[fileID], body: value, isLoaded: true };
          setFiles({ ...files, [fileID]: newFile })
        })
      }
    }

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
    if (files[id].isNew) {
      delete files[id]
      setFiles({ ...files });
    } else {
      fileHelper.deleteFile(files[id].path).then(files[id].path).then(() => {
        delete files[id]
        setFiles({ ...files });
        tabClose(id);
        saveFilesToStore()
      })
    }

  }
  const updateFileName = (id, title, isNew) => {
    const newpath = isNew ? join(savedLocation, `${title}.md`) : join(dirname(files[id].path), `${title}.md`)
    const newFile = {
      ...files[id],
      title: title,
      isNew: false,
      path: newpath
    }
    const newFiles = { ...files, [id]: newFile };
    if (isNew) {
      fileHelper.writeFile(newpath, files[id].body).then(res => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      }).catch(err => {
        console.dir(err)
      })
    } else {
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newpath).then(res => {
        setFiles({ ...files, [id]: newFile });
        saveFilesToStore(newFiles)
      })
    }

  }

  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword));
    setSearchFiles(newFiles)
  }


  const createNewFile = () => {
    const newId = uuidv4();
    const newFile =
    {
      id: newId,
      title: '',
      body: '##请输入内容',
      createdAt: new Date().getTime(),
      isNew: true
    }
    setFiles({ ...files, [newId]: newFile })
  }
  const fileListArr = searchFiles.length > 0 ? searchFiles : filesArr;
  const onSave = () => {
    const { path, body, title } = activeFile;

    fileHelper.writeFile(path, body).then(res => {

      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFileID))
      if (getAutoSync()) {
        ipcRenderer.send('upload-file', {
          key: `${title}.md`,
          path
        })
      }
    })
  }

  const importFile = () => {
    dialog.showOpenDialog({
      title: '选择导入的MarkDown文件',
      properties: ['openFile', 'multiSelection'],
      filters: [
        { name: 'markdown files', extensions: ['md'] },
      ]
    }).then(res => {
      const { filePaths } = res;
      if (Array.isArray(filePaths)) {
        //filter out the path we already have in electorn store
        //1.[/Volumes/F/前端笔试题.md]
        const filteredPaths = filePaths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          return !alreadyAdded
        })

        console.log(filteredPaths)

        // extend the path array to an array contains files info
        // [{id:'1',path:'',title:'}]
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
          }
        })

        //get the new files object in flatternArr
        console.log(files)
        const newFiles = { ...files, ...flatternArr(importFilesArr) };
        //setState and update electron store

        setFiles(newFiles);
        saveFilesToStore(newFiles);
        if (importFilesArr.length > 0) {
          dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFilesArr.length}个文件`,
            message: `成功导入了${importFilesArr.length}个文件`
          })
        }
      }

    })
  }

  const activeFileUploaded = () => {
    const { id } = activeFile;
    const modifiedFile = { ...files[id], isSynced: true, updateAt: new Date().getTime() };
    const newFiles = { ...files, [id]: modifiedFile };
    setFiles(newFiles);
    saveFilesToStore(newFiles);
  }

  const activeFileDownloaded=(event,message)=>{
    const currentFile=files[message.id];
    const {id,path}=currentFile;
    fileHelper.readFile(path).then(value=>{
      let newFile;
      if(message.status==='download-success'){
        newFile={...files[id],body:value,isLoaded:true,isSynced:true,updateAt:new Date().getTime()}
      }else{
        newFile={...files[id],body:value,isLoaded:true}
      }
      const newFiles= {...files,[id]:newFile};
      setFiles(newFiles);
      saveFilesToStore(newFiles)
    })
  }

  const fileUpload=()=>{
    const newFiles=objToArr(files).reduce((result,file)=>{
      const currentTime=new Date().getTime();
      result[file.id]={
        ...files[file.id],
        isSynced:true,
        updateAt:currentTime
      }
      return result
    },{})
    setFiles(newFiles);
    saveFilesToStore(newFiles)
  }
  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFile,
    'save-edit-file': onSave,
    'active-file-uploaded': activeFileUploaded,
    "file-downloaded":activeFileDownloaded,
    "files-uploaded":fileUpload,
    "loading-status":(message,flag)=>{
      setIsLoading(flag)
    }
  })



  return (
    <div className="App container-fluid px-0">
     {isLoading && <Loader/>}
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
            onSaveEdit={(id, newValue, isNew) => updateFileName(id, newValue, isNew)}
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
                onBtnClick={importFile}
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
              {activeFile.isSynced && (<>
                <span className='sync-status'>已同步，上次同步时间{timeStampToString(activeFile.updateAt)}</span>
              </>)}
              {/* <BottomBtn
                text="baocun"
                colorClass="btn-success no-border"
                icon={faSave}
                onBtnClick={onSave}
              >
              </BottomBtn> */}
            </>)
          }

        </div>
      </div>
    </div>
  );
}

export default App;
