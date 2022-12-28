import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import './App.css'
import Loading from './Components/SharedArea/Loading/Loading.js';
import config from './utils/Config.ts';
import jwt_decode  from 'jwt-decode'

function App() {
  const MY_SERVER = config.todosUrl
  // const MY_SERVER = 'https://shay-poc-flask.onrender.com/todos/'
  const [todos, setTodos] = useState([]);
  const [tab, setTab] = useState(1);
  const [todoEdit, setTodoEdit] = useState(Object);
  const [updateButton, setUpdateButton] = useState(false)
  // values
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  // Authentication
let navigate = useNavigate();
  // const [token, setToken] = useState(localStorage.getItem('token')||"")
  let token = localStorage.getItem('my-user-token')
  // print(token)

  
  let decoded = (token)? jwt_decode(token):""
  // console.log(decoded)
  let user = decoded?.name
  if (token){
    if (Date.now() >= decoded?.exp * 1000){
      navigate('/login')
      
    }
  }
  
  const [userName, setUserName]=useState(user)
  
  let auth = {headers:{ Authorization: `Bearer ${token}` }}

  const loadData = async() => {
    checkToken()
    await axios.get(MY_SERVER, auth )
    .then((response)=>{
      setTodos(response.data)
    })
  }

  const remove = async(id) => {
    checkToken()
    const response = await axios.delete(MY_SERVER+id, auth)
    // console.log(response.data)
    loadData()
  }

  const add = async() => {
    checkToken()
    if (title){
      const response = await axios.post(MY_SERVER,{title:title.trim(), desc:desc.trim()}, auth)
      setTitle('')
      setDesc('')
      loadData()
      return response.data
    }
    else{
      console.log('You need a title')
    }
  }
  const handleCheckbox = async(id)=>{
    checkToken()
    const editTodo = todos.find(todo => todo.id === +id);
    let done = (false === editTodo.done)
    await axios.put(MY_SERVER + editTodo.id, {done}, auth)
    loadData()
  }

  const edit = (id) => {
    setUpdateButton(true)
    const editTodo = todos.find(todo => todo.id === +id);
    setTitle(editTodo.title)
    setDesc(editTodo.desc)
    setTodoEdit(editTodo)
    }

  const close =() => {
    setTitle('')
    setDesc('')
    setUpdateButton(false)
  }

  const editDone = async() => {
    checkToken()
    if (title){
      const response = await axios.put(MY_SERVER+todoEdit.id, {title:title.trim(), desc:desc.trim()}, auth)
      setTitle('')
      setDesc('')
      loadData()
      setUpdateButton(false)
      return response.data
    }
    else{
      alert('You need a title')
      console.log('You need a title')
    }
    
  }
  const tabManager = (taskDone) => {
    if (tab === 1){
      return true
    }
    else if (tab === 2){
      return (false === taskDone)
    }
    else if (tab === 3){
      return taskDone
    }
  }

  const checkToken= () => {
    if (!token){
      navigate('/login')
      return false;
    }
    else if (token & Date.now() >= decoded?.exp * 1000){
      navigate('/login')
      return false;

    }
    return true;

  }
  

  useEffect(() => {
    if (checkToken()){
      setTimeout(() => {
        loadData()
        console.log("Delayed for 800ms second.");
      }, "800")
    }
    },[]);
  
  return (
    <section className='App'>
      <div className="container py-5 h-100 mt-5">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col col-xl-10 ">

            <div className="card ">
              <div className="card-body p-4">
                {/* add task */}
                <form className=" mb-4">
                  
                    <label className="form-label" htmlFor="form2">New task...</label>
                  
                  <div className="form-outline flex-fill d-flex bd-highlight">
                    <div className="p-2 flex-xll-fill bd-highlight">
                    <input type="text" id="form2" required placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)} className="form-control" />
                    </div>
                    <div className="p-2 flex-sm-fill bd-highlight">
                    <input type="text" id="form3" placeholder='Content' value={desc} onChange={(e) => setDesc(e.target.value)} size='26' className="form-control" />
                    </div>
                    
                    
                    
                  <button type="button" onClick={add} className="btn btn-info ms-2">Add</button>
                  </div>
                </form>

                {/* <!-- Tabs navs --> */} 

                <ul className="nav nav-tabs mb-4 pb-2 " id="ex1" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className={tab===1 ?"nav-link active":"nav-link"} id="ex1-tab-1" data-mdb-toggle="tab"  role="tab"
                      aria-controls="ex1-tabs-1" aria-selected={tab===1} onClick={() => setTab(1)}>All</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className={tab===2 ?"nav-link active":"nav-link"} id="ex1-tab-2" data-mdb-toggle="tab"  role="tab"
                      aria-controls="ex1-tabs-2" aria-selected={tab===2} onClick={() => setTab(2)}>Active</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className={tab===3 ?"nav-link active":"nav-link"} id="ex1-tab-3" data-mdb-toggle="tab"  role="tab"
                      aria-controls="ex1-tabs-3" aria-selected={tab===3} onClick={() => setTab(3)}>Completed</button>
                      </li>
                </ul>
                {/* <!-- Tabs navs --> */}

                {/* <!-- Tabs content --> */}

                <div className="tab-content" id="ex1-content">
                  <div className="tab-pane fade show active" id="ex1-tabs-1" role="tabpanel"
                    aria-labelledby="ex1-tab-1">
                    <div className='scroll'>
                    {userName && <span className='userName'>{userName} List</span>}
                    {todos.length === 0 && <Loading/>}
                    <ul className="list-group mb-0 " id='list5'>
                      {todos.massage ? 
                      <li className='bg-primary position-absolute  px-4 fs-2 rounded-4 top-50 start-50 translate-middle '>
                        {todos.massage}</li>:<>
                      {todos.filter(todo => tabManager(todo.done)).map((todo, i) =>
                        <li key={i} className="rounded-2 scroll list-group-item d-flex align-items-center border-0 mb-2 rounded">
                          <input className="form-check-input me-2" type="checkbox"  checked={todo.done} value={todo.id} onChange={(e)=> {handleCheckbox(e.target.value)}} aria-label="..." />
                          <div className="p-2 me-5">
                          <span className="text-capitalize" style={todo.done ? {textDecorationLine: 'line-through'}:{}}>{todo.title}</span>
                          </div>
                          <div className="p-2 px-3 small flex-md-fill ">
                          <span style={todo.done ? {textDecorationLine: 'line-through'}:{}}>{todo.desc}</span>
                          </div>
                          <div className="p-2 flex-xll-fill">
                          <span data-toggle="tooltip" title="Date Created" className="text-muted">
                          {new Date(todo.date_added).toLocaleDateString()} </span>
                          </div>
                          <div className="p-2 flex-xll-fill">
                          <button type="button" onClick={() => edit(todo.id)} className="btn">
                            <i className="text-info bi bi-pencil-square"/>
                            </button>

                            {updateButton && 
                            <div className='Update'>
                              <div className='Update-inner'>
                                  <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                      <div className="modal-header">
                                        <h5 className="modal-title" id="exampleModalLabel">Edit task "{todoEdit.title}"</h5>
                                        <button type="button" onClick={close} className="close btn" data-dismiss="modal" aria-label="Close">
                                          <span aria-hidden="true">&times;</span>
                                        </button>
                                      </div>
                                      <div className="modal-body mb-3">
                                        <form>
                                          <div className="form-group">
                                            <label htmlFor="recipient-name" className="col-form-label">Title:</label>
                                            <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} id="recipient-name"/>
                                          </div>
                                          <div className="form-group">
                                            <label htmlFor="message-text" className="col-form-label">Content:</label>
                                            <textarea className="form-control" value={desc} onChange={(e) => setDesc(e.target.value)} id="message-text"></textarea>
                                          </div>
                                        </form>
                                      </div>
                                      <div className="modal-footer">
                                        <button type="button" onClick={close} className="p-2 px-4 mx-2 btn btn-secondary" data-dismiss="modal">Close</button>
                                        <button type="button" onClick={editDone} className="p-2 px-5 mx-2  btn btn-primary">Done</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            </div>
                            }
                            {/* <Update  trigger={updateButton} loadData={loadData} setTrigger={setUpdateButton} object_id={todo.id}>
                              </Update> */}
                          
                            </div>
                          <div className="p-2 flex-xll-fill">
                          <button type="button" onClick={() => window.confirm(`Are you sure you want to delete "${todo.title}" task ?`) && remove(todo.id)} className="btn">
                            <i className="text-danger bi bi-trash"/>
                            </button>
                            </div>
                          </li>)}</>}
                      

                      {/* <li className="list-group-item d-flex align-items-center border-0 mb-2 rounded">
                        <input className="form-check-input me-2" type="checkbox" value="" aria-label="..." checked />
                        <s>Dapibus ac facilisis in</s>
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0 mb-2 rounded">
                        <input className="form-check-input me-2" type="checkbox" value="" aria-label="..." />
                        Morbi leo risus
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0 mb-2 rounded">
                        <input className="form-check-input me-2" type="checkbox" value="" aria-label="..." />
                        Porta ac consectetur ac
                      </li>
                      <li className="list-group-item d-flex align-items-center border-0 mb-0 rounded">
                        <input className="form-check-input me-2" type="checkbox" value="" aria-label="..." />
                        Vestibulum at eros
                      </li> */}
                    </ul>
                    </div>
                  </div>
                </div>
                {/* <!-- Tabs content --> */}

              </div>
            
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


export default App;
