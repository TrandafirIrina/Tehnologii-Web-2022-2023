import Note from './Note';
import NoteList from './Note'
import {BrowserRouter, Routes, Route} from 'react-router-dom';

function App() {
    return(
        <BrowserRouter>
        <Routes>
            <Route path='/students/:id/notes' element={<NoteList/>}/>
        </Routes>
        </BrowserRouter>
    )
}

export default App;
