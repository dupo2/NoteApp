import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Note } from '../note.model';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

// Firebase config should be in environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyAt4MWhM8zIeIJl8sHXQaDfQjXi2AVIY74",
  authDomain: "notes-81e2d.firebaseapp.com",
  projectId: "notes-81e2d",
  storageBucket: "notes-81e2d.firebasestorage.app",
  messagingSenderId: "596349947919",
  appId: "1:596349947919:web:ab5ae7077d18f095a0d37a"
};

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly app = initializeApp(firebaseConfig);
  private readonly db = getFirestore(this.app);
  private readonly notesCollection = collection(this.db, 'notes');

  getNotesStream(): Observable<Note[]> {
    const notesQuery = query(this.notesCollection, orderBy('createdAt', 'desc'));

    return new Observable<Note[]>(subscriber => {
      const unsubscribe = onSnapshot(notesQuery, snapshot => {
        const notes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Note[];
        subscriber.next(notes);
      });

      return () => unsubscribe();
    });
  }

  async addNote(note: Omit<Note, 'id'>): Promise<void> {
    await addDoc(this.notesCollection, {
      ...note,
      createdAt: Timestamp.now()
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    const noteRef = doc(this.db, 'notes', noteId);
    await deleteDoc(noteRef);
  }
}
