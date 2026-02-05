import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, FlatList, Image, Text, TextInput, View } from "react-native";
import { addNote, getNote, getPhotosForNote, Note, updateNote } from "../database/db";

type FormData = {
    noteTitle: string,
    noteContent: string
}

export default function addUpdateNote() {

    const { noteId } = useLocalSearchParams<{noteId: string}>();

    const [note, setNote] = useState<Note>();

    const [photos, setPhotos] = useState<string[]>([]);

    const [photosLoaded, setPhotosLoaded] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            noteTitle: (noteId != null) ? note?.noteTitle : "",
            noteContent: (noteId != null) ? note?.noteContent : "",
        }
    });

    //if(noteId != null){

        useEffect(() => {
                    (async () => {
                        const note = await getNote(Number(noteId)); // getting all notes from database
                        if(note != null){
                            setNote(note); // set notes with notes returned from database
                        }
                        
                    })();
                }, [noteId]);
            
        useEffect(() => {
                reset({
                    noteTitle: note?.noteTitle,
                    noteContent: note?.noteContent
                })
                }, [note, reset]);

        useEffect(() => {
            if(!noteId || photosLoaded) return
            
                (async () => {
                            const dbPhotos = await getPhotosForNote(Number(noteId)); // getting all notes from database
                            setPhotos(dbPhotos.map(photo => photo.photoPath)); // set notes with notes returned from database
                            setPhotosLoaded(true);
                        })();
                          
                }, [noteId, photosLoaded]);
    //}

    const router = useRouter();

    

    

    // logic that allows to select photos from gallery
    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 0.8,
            allowsMultipleSelection: true
        });

        if (!result.canceled){
            const newPhotos = result.assets
                .map(asset => asset.uri)
                .filter((uri): uri is string => !!uri);
            setPhotos(prev => [...prev, ...newPhotos]);
        }
    }

    

    const onSubmit = async (data: FormData) => {

        const properPhotos = photos.filter(
            (p): p is string => typeof p === "string" && p.length > 0
        );

        try {
            if(noteId != null){
                await updateNote(Number(noteId), data.noteTitle, data.noteContent, properPhotos);
            } else {
                await addNote(data.noteTitle, data.noteContent, properPhotos);
            }
            
            router.push('/App')
        } catch(error){
            console.error("Failed to save note:", error);
        };
        
    }

  return (
    <View>
        <View>
            <Button title={(noteId != null) ? "Add or delete 1 or more photos" : "Add 1 or more photos"} onPress={pickPhoto}></Button>
            {photos.length > 0 && (
                <FlatList
                    data={photos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({item}) => (
                        <View>
                            <Image
                                source={{ uri: item }}
                                style={{ width:100, height:100 }}
                            />
                            <Button title="Delete photo" onPress={() => setPhotos(prev => prev.filter(photo => photo !== item))}></Button>
                        </View>
                    )}

                />
            )}
        </View>
        <Text>{(noteId != null) ? "Update Note Title" : "Add Note Title"}</Text>
        <Controller
            control={control}
            
            rules={{
                required: true,
            }}
            render={({ field: { onChange, onBlur, value} }) => (
                <TextInput
                    placeholder="Note title"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                />
            )}
            name="noteTitle"
        />
        {errors.noteTitle && <Text>Note title is required</Text>} 
        
        <Text>{(noteId != null) ? "Update Note Text" : "Add Note Text"}</Text>
        <Controller
            control={control}
            rules={{
                required: true,
            }}
            render={({ field: { onChange, onBlur, value} }) => (
                <TextInput
                    placeholder="Note text"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                />
            )}
            name="noteContent"
        />
        {errors.noteTitle && <Text>Note text is required</Text>} 

        <Button title={(noteId != null) ? "Update the note" : "Save the note"} onPress={handleSubmit(onSubmit)}/>
    </View>
  );
}