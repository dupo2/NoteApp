
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
    // Subscribe to the notes stream from Firestore
    this.notesSubscription = this.noteService.getNotesStream().subscribe(notes => {
      this.notes.set(notes);
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription when the component is destroyed
    this.notesSubscription?.unsubscribe();
  }

  async addNote(): Promise<void> {
    if (this.noteForm.invalid) {
      return;
    }

    const newNote = {
      title: this.noteForm.value.title ?? 'Be pavadinimo',
      text: this.noteForm.value.text ?? '',
      createdAt: new Date(),
    };
    
    try {
      await this.noteService.addNote(newNote);
      this.noteForm.reset();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await this.noteService.deleteNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }
}
