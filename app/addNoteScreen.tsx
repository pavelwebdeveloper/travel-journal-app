import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, FlatList, Image, Text, TextInput, View } from "react-native";
import { addNote } from "../database/db";

type FormData = {
    noteTitle: string,
    noteContent: string
}

export default function addNoteScreen() {

    const router = useRouter();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            noteTitle: "",
            noteContent: "",
        }
    });

    const [photos, setPhotos] = useState<string[]>([]);

    // logic that allows to select photos from gallery
    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            quality: 0.8,
            allowsMultipleSelection: true
        });

        if (!result.canceled){
            const photos = result.assets.map(asset => asset.uri);
            setPhotos(prev => [...prev, ...photos]);
            console.log(photos);
        }
    }

    const onSubmit = async (data: FormData) => {
        try {
            await addNote(data.noteTitle, data.noteContent, photos);
            router.push('/App')
        } catch(error){
            console.error("Failed to save note:", error);
        };
        
    }

  return (
    <View>
        <View>
            <Button title="Add 1 or more photos" onPress={pickPhoto}></Button>
            {photos.length > 0 && (
                <FlatList
                    data={photos}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({item}) => (
                        <Image
                            source={{ uri: item }}
                            style={{ width:100, height:100 }}
                        />
                    )}

                />
            )}
        </View>
        <Text>Add Note Title</Text>
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
        
        <Text>Add Note Text</Text>
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

        <Button title="Save the note" onPress={handleSubmit(onSubmit)}/>
    </View>
  );
}