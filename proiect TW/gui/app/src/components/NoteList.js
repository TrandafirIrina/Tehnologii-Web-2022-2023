import {useEffect, useState} from 'react';
import {useParams} from 'react';

const SERVER = 'http://localhost:7000'

const NoteList = async()=>{
    const [notes, setNotes] = useState([]);
    const idStudent = useParams();

    const getNotes = async()=>{
        const response = await fetch(`${SERVER}/api/students/${idStudent}/notes`)
        const data = await response.json()
        setNotes(data)
    }

    useEffect(()=>{
        getNotes();
    },[]);        
    
    return(
            <>
            <p>The list of all notes</p>
            {
                notes.map(e=><Note id={e.id} item={e}/>)
            }
            </>
    );
}

export default NoteList;