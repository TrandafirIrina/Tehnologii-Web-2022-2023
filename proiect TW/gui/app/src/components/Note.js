

function Note(props){
    const {id, item} = props;

    return(
        <div className="user">
            <div className="id">
                {id}
            </div>
            <div className="title">
                {item.title}
            </div>
            <div className="content">
                {item.content}
            </div>
            <div className="subject">
                {item.subject}
            </div>
        </div>
    );
}

export default Note;