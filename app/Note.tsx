import { useEffect, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
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

    //return <Text>Hello, I am a note!!!!</Text>
    return (
        <View>
            <Text>{ note.noteTitle }</Text>
            {photos.length > 0 && (
                            <FlatList
                                data={photos}
                                keyExtractor={(item) => item.photoPath}
                                renderItem={({item}) => (
                                    <Image
                                        source={{ uri: item.photoPath }}
                                        style={{ width:100, height:100 }}
                                    />
                                )}
            
                            />
                        )}
        </View>
    );
}

export default Note;