import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, Image, Text, View } from "react-native";
import { Note, Photo, deleteNote, getNote, getPhotosForNote } from "../database/db";

type Props = {
    noteId: string;
}

const NoteDetails = () => {
    const { noteId } = useLocalSearchParams<{noteId: string}>();

    //const [note, setNote] = useState<Note | null>(null);

    const [note, setNote] = useState<Note>();

    const [photos, setPhotos] = useState<Photo[]>([]);

    const router = useRouter();

    useEffect(() => {
            (async () => {
                const note = await getNote(Number(noteId)); // getting all notes from database
                if(note != null){
                    setNote(note); // set notes with notes returned from database
                }
                
            })();
        }, [noteId]);

    useEffect(() => {
                (async () => {
                    const photos = await getPhotosForNote(Number(noteId)); // getting all notes from database
                    setPhotos(photos); // set notes with notes returned from database
                })();
            }, [noteId]);

    const deleteTheNote = async () => {
            try {
                if(note != null){
                    await deleteNote(note);
                    router.push('/App')
                }  
            } catch(error){
                console.error("Failed to delete note:", error);
            };
            
        }

    //return <Text>Hello, I am a note!!!!</Text>
    return (
            <View>
                <Text>{ note?.noteTitle }</Text>
                <Text>{ note?.noteContent }</Text>
                {photos.length > 0 && (
                                <FlatList
                                    data={photos}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.photoPath}
                                    renderItem={({item}) => (
                                        <Image
                                            source={{ uri: item.photoPath }}
                                            style={{ width:100, height:100 }}
                                        />
                                    )}
                
                                />
                            )}

                            <Button
                                title="Update the note"
                                onPress={() =>
                                      router.push({
                                        pathname: '/addUpdateNote',
                                        params: {
                                            noteId: note?.noteId.toString()
                                        }
                                    })
                                    }
                                  ></Button>

                            <Button 
                                title="Delete the note" 
                                onPress={deleteTheNote}/>
            </View>
    );
}

export default NoteDetails;