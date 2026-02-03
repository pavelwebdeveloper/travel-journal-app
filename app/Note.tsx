import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { getPhotosForNote, Note as NoteType, Photo } from "../database/db";

type Props = {
    note: NoteType;
}

const Note = ({ note }: Props) => {
    const [photos, setPhotos] = useState<Photo[]>([]);

    useEffect(() => {
            (async () => {
                const photos = await getPhotosForNote(note.noteId); // getting all notes from database
                setPhotos(photos); // set notes with notes returned from database
            })();
        }, [note.noteId]);

    return <Text>Hello, I am a note!!!!</Text>
};

export default Note;