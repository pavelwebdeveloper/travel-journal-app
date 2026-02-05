import * as SQLite from 'expo-sqlite';

// Opening or creating a database
let db: SQLite.SQLiteDatabase | null = null;

// tables or types that will be in the database
export type Note = {
    noteId: number;
    noteTitle: string;
    noteContent: string;
    noteDate: string;  
}

export type Photo = {
    photoId: number;
    note_Id: number;
    photoPath: string;
}

async function getDB(): Promise<SQLite.SQLiteDatabase>{
    if(!db){
        db = await SQLite.openDatabaseAsync('travel-journal.db');
    }
    return db;
}

// Creating tables if they do not exist
export const initDB = async (): Promise<void> => {
    db = await SQLite.openDatabaseAsync('travel-journal.db');

    await db.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS notes (
            noteId INTEGER PRIMARY KEY AUTOINCREMENT,
            noteTitle TEXT NOT NULL,
            noteContent TEXT NOT NULL,
            noteDate TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS photos (
            photoId INTEGER PRIMARY KEY AUTOINCREMENT,
            note_Id INTEGER NOT NULL,
            photoPath TEXT NOT NULL
        );
    `)
};

export const addNote = async (
    noteTitle: string,
    noteContent: string,
    photos: string[]
): Promise<void> => {
    const db = await getDB();

    const result = await db.runAsync(
        'INSERT INTO notes (noteTitle, noteContent, noteDate) VALUES (?, ?, ?);',
        [noteTitle, noteContent, new Date().toISOString()]
    );

    const noteId = result.lastInsertRowId as number;

    for (const photo of photos) {
            await db.runAsync(
            'INSERT INTO photos (note_Id, photoPath) VALUES (?, ?);',
            [noteId, photo]
        );
    }
};

export const updateNote = async (
    noteId: number,
    noteTitle: string,
    noteContent: string,
    photos: string[]
): Promise<void> => {
    const db = await getDB();

    const result = await db.runAsync(
        'UPDATE notes SET noteTitle = ?, noteContent = ? WHERE noteId = ?;',
        [noteTitle, noteContent, noteId]
    );

    await deletePhotos(noteId);

    //const noteId = result.lastInsertRowId as number;

    for (const photo of photos) {
            await db.runAsync(
            'INSERT INTO photos (note_Id, photoPath) VALUES (?, ?);',
            [noteId, photo]
        );
    }
};

// Get all notes from the database
export const getAllNotes = async(): Promise<Note[]> => {
    const db = await getDB();

    return await db.getAllAsync<Note>(
        'SELECT * FROM notes ORDER BY noteDate DESC;'
    );
};

// Get a note by the use of its id
export const getNote = async(
    noteId: number
): Promise<Note | null> => {
    const db = await getDB();
    
    return await db.getFirstAsync<Note>(
        'SELECT * FROM notes WHERE noteId = ?;',
        [noteId]
    );
};

// Get a note by the use of its id
export const deleteNote = async(
    note: Note
): Promise<boolean> => {
    const db = await getDB();

    const noteId = note.noteId;

    const resultOfDelete = await db.runAsync(
        'DELETE FROM notes WHERE noteId = ?;',
        [noteId]
    );

    const note_Id = noteId;

    deletePhotos(note_Id);

    return resultOfDelete.changes > 0;
};

// Get photos for a particular note
export const getPhotosForNote = async(
    note_Id: number
): Promise<Photo[]> => {
    const db = await getDB();
    
    return await db.getAllAsync<Photo>(
        'SELECT * FROM photos WHERE note_Id = ?;',
        [note_Id]
    );
};

async function deletePhotos(note_Id: number) {
    if(!note_Id) return;

    const db = await getDB(); 

    const resultOfDelete = await db.runAsync(
        'DELETE FROM photos WHERE note_Id = ?;',
        [note_Id]
    );
}