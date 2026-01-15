import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

interface Tag {
  label: string;
  value: string;
}

@Component({
  selector: 'app-searchable-tags',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './searchable-tags.html',
  styleUrl: './searchable-tags.scss',
})
export class SearchableTags implements OnInit {
  @Input() allTags: Tag[] = [];
  @Input() selectedTags: Tag[] = [];
  @Input() tagType: 'red' | 'yellow' = 'red'; // For styling
  @Input() placeholder = 'Buscar...';

  @Output() tagAdded = new EventEmitter<Tag>();
  @Output() tagRemoved = new EventEmitter<Tag>();

  searchControl = new FormControl('');
  filteredTags: Tag[] = [];

  ngOnInit(): void {
    this.filteredTags = [...this.allTags]; // Initialize with all tags

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((term): term is string => term !== null) // Ensure term is string
      )
      .subscribe(term => {
        this.filterTags(term);
      });
  }

  filterTags(term: string): void {
    const lowerTerm = term.toLowerCase();
    this.filteredTags = this.allTags.filter(tag =>
      tag.label.toLowerCase().includes(lowerTerm) &&
      !this.selectedTags.some(selected => selected.value === tag.value)
    );
  }

  addTag(tag: Tag): void {
    if (!this.selectedTags.some(selected => selected.value === tag.value)) {
      this.selectedTags = [...this.selectedTags, tag];
      this.tagAdded.emit(tag);
      this.searchControl.setValue('');
      this.filterTags(''); // Re-filter suggestions
    }
  }

  removeTag(tag: Tag): void {
    this.selectedTags = this.selectedTags.filter(selected => selected.value !== tag.value);
    this.tagRemoved.emit(tag);
    this.filterTags(this.searchControl.value || ''); // Re-filter suggestions
  }

  // Ensure unique placeholder for search input when there are selected tags
  get searchPlaceholder(): string {
    return this.selectedTags.length > 0 ? 'Añadir más...' : this.placeholder;
  }
}
