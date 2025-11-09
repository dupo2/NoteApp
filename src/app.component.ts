import { Component, ChangeDetectionStrategy, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Note } from './note.model';
import { NoteService } from './services/note.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule]
})
export class AppComponent implements OnInit, OnDestroy {
  private noteService = inject(NoteService);
  private notesSubscription?: Subscription;
  
  notes = signal<Note[]>([]);

  noteForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    text: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit(): void {
    // Subscribe to the notes stream from the service
    this.notesSubscription = this.noteService.getNotes().subscribe(notes => {
      // When notes are loaded from JSON, `createdAt` is a string. Convert it back to a Date object.
      const notesWithDates = notes.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt)
      }));
      this.notes.set(notesWithDates);
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription when the component is destroyed
    this.notesSubscription?.unsubscribe();
  }

  addNote(): void {
    if (this.noteForm.invalid) {
      return;
    }

    const newNote = {
      title: this.noteForm.value.title ?? 'Be pavadinimo',
      text: this.noteForm.value.text ?? '',
    };
    
    this.noteService.addNote(newNote);
    this.noteForm.reset();
  }

  deleteNote(id: string): void {
    this.noteService.deleteNote(id);
  }
}
