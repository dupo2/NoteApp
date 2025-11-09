import { Injectable } from '@angular/core';
import { Note } from '../note.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private readonly localStorageKey = 'notes';

  constructor() {
    this.loadNotesFromLocalStorage();
  }

  private loadNotesFromLocalStorage() {
    const notesJson = localStorage.getItem(this.localStorageKey);
    const notes = notesJson ? JSON.parse(notesJson) : [];
    this.notesSubject.next(notes);
  }

  private saveNotesToLocalStorage(notes: Note[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(notes));
    this.notesSubject.next(notes);
  }

  getNotes(): Observable<Note[]> {
    return this.notesSubject.asObservable();
  }

  addNote(newNoteData: { title: string; text: string }) {
    const currentNotes = this.notesSubject.getValue();
    const newNote: Note = {
      id: new Date().getTime().toString(), // Simple unique ID
      title: newNoteData.title,
      text: newNoteData.text,
      createdAt: new Date()
    };
    const updatedNotes = [...currentNotes, newNote];
    this.saveNotesToLocalStorage(updatedNotes);
  }

  deleteNote(noteId: string) {
    const currentNotes = this.notesSubject.getValue();
    const updatedNotes = currentNotes.filter(note => note.id !== noteId);
    this.saveNotesToLocalStorage(updatedNotes);
  }

  updateNote(noteToUpdate: Note) {
    const currentNotes = this.notesSubject.getValue();
    const updatedNotes = currentNotes.map(note =>
      note.id === noteToUpdate.id ? noteToUpdate : note
    );
    this.saveNotesToLocalStorage(updatedNotes);
  }
}
