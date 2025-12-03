import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommandItem,
  CommandGroup,
  CommandPaletteConfig,
  CommandSearchResult,
  CommandExecutedEvent,
} from './command-palette.types';
import { Subject } from 'rxjs';

const DEFAULT_CONFIG: CommandPaletteConfig = {
  placeholder: 'Type a command or search...',
  emptyMessage: 'No commands found.',
  maxRecentCommands: 5,
  showRecent: true,
  showShortcuts: true,
  hotkey: 'k',
  useMetaKey: true,
  searchDebounce: 150,
  maxHeight: '400px',
  animationDuration: 150,
};

const RECENT_COMMANDS_KEY = 'ax-command-palette-recent';

@Injectable({
  providedIn: 'root',
})
export class AxCommandPaletteService {
  private commandGroups = signal<CommandGroup[]>([]);
  private _isOpen = signal(false);
  private _searchQuery = signal('');
  private _selectedIndex = signal(0);
  private _config = signal<CommandPaletteConfig>(DEFAULT_CONFIG);
  private _recentCommands = signal<CommandItem[]>([]);

  readonly isOpen = this._isOpen.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly selectedIndex = this._selectedIndex.asReadonly();
  readonly config = this._config.asReadonly();
  readonly recentCommands = this._recentCommands.asReadonly();

  readonly commandExecuted$ = new Subject<CommandExecutedEvent>();

  readonly allCommands = computed(() => {
    return this.commandGroups().flatMap((group) => group.commands);
  });

  readonly filteredResults = computed(() => {
    const query = this._searchQuery().toLowerCase().trim();
    const commands = this.allCommands();

    if (!query) {
      return commands.map((item) => ({ item, score: 0 }));
    }

    const results: CommandSearchResult[] = [];

    for (const item of commands) {
      const score = this.calculateScore(item, query);
      if (score > 0) {
        results.push({ item, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  });

  readonly groupedResults = computed(() => {
    const results = this.filteredResults();
    const groups = this.commandGroups();
    const query = this._searchQuery().trim();

    if (
      !query &&
      this._config().showRecent &&
      this._recentCommands().length > 0
    ) {
      return [
        {
          id: 'recent',
          label: 'Recent',
          commands: this._recentCommands(),
          priority: 1000,
        },
        ...groups,
      ];
    }

    const groupedMap = new Map<string, CommandSearchResult[]>();

    for (const result of results) {
      const category = result.item.category || 'Commands';
      if (!groupedMap.has(category)) {
        groupedMap.set(category, []);
      }
      groupedMap.get(category)!.push(result);
    }

    return Array.from(groupedMap.entries()).map(([label, items]) => ({
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      commands: items.map((r) => r.item),
    }));
  });

  private readonly router = inject(Router);

  constructor() {
    this.loadRecentCommands();
  }

  configure(config: Partial<CommandPaletteConfig>): void {
    this._config.update((current) => ({ ...current, ...config }));
  }

  registerCommands(group: CommandGroup): void {
    this.commandGroups.update((groups) => {
      const existingIndex = groups.findIndex((g) => g.id === group.id);
      if (existingIndex >= 0) {
        const updated = [...groups];
        updated[existingIndex] = group;
        return updated;
      }
      return [...groups, group].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0),
      );
    });
  }

  unregisterCommands(groupId: string): void {
    this.commandGroups.update((groups) =>
      groups.filter((g) => g.id !== groupId),
    );
  }

  open(): void {
    this._isOpen.set(true);
    this._searchQuery.set('');
    this._selectedIndex.set(0);
  }

  close(): void {
    this._isOpen.set(false);
    this._searchQuery.set('');
    this._selectedIndex.set(0);
  }

  toggle(): void {
    if (this._isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
    this._selectedIndex.set(0);
  }

  selectNext(): void {
    const results = this.filteredResults();
    const current = this._selectedIndex();
    if (current < results.length - 1) {
      this._selectedIndex.set(current + 1);
    }
  }

  selectPrevious(): void {
    const current = this._selectedIndex();
    if (current > 0) {
      this._selectedIndex.set(current - 1);
    }
  }

  selectIndex(index: number): void {
    this._selectedIndex.set(index);
  }

  executeSelected(): void {
    const results = this.filteredResults();
    const index = this._selectedIndex();
    if (results[index]) {
      this.executeCommand(results[index].item);
    }
  }

  executeCommand(command: CommandItem): void {
    if (command.disabled) {
      return;
    }

    this.addToRecent(command);

    if (command.routerLink) {
      const link = Array.isArray(command.routerLink)
        ? command.routerLink
        : [command.routerLink];
      this.router.navigate(link);
    } else if (command.href) {
      window.open(command.href, '_blank');
    } else if (typeof command.action === 'function') {
      command.action();
    } else if (typeof command.action === 'string') {
      this.commandExecuted$.next({
        command,
        timestamp: new Date(),
      });
    }

    this.close();
  }

  private calculateScore(item: CommandItem, query: string): number {
    let score = 0;
    const labelLower = item.label.toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const keywords = (item.keywords || []).map((k) => k.toLowerCase());

    if (labelLower === query) {
      score += 100;
    } else if (labelLower.startsWith(query)) {
      score += 75;
    } else if (labelLower.includes(query)) {
      score += 50;
    }

    if (descLower.includes(query)) {
      score += 25;
    }

    for (const keyword of keywords) {
      if (keyword === query) {
        score += 40;
      } else if (keyword.startsWith(query)) {
        score += 30;
      } else if (keyword.includes(query)) {
        score += 20;
      }
    }

    if (score === 0) {
      score = this.fuzzyMatch(labelLower, query);
    }

    return score;
  }

  private fuzzyMatch(text: string, query: string): number {
    let queryIndex = 0;
    let consecutiveMatches = 0;
    let score = 0;

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
        consecutiveMatches++;
        score += consecutiveMatches * 2;
      } else {
        consecutiveMatches = 0;
      }
    }

    return queryIndex === query.length ? score : 0;
  }

  private addToRecent(command: CommandItem): void {
    const maxRecent = this._config().maxRecentCommands || 5;
    this._recentCommands.update((recent) => {
      const filtered = recent.filter((c) => c.id !== command.id);
      return [command, ...filtered].slice(0, maxRecent);
    });
    this.saveRecentCommands();
  }

  private loadRecentCommands(): void {
    try {
      const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const commands = this.allCommands();
        const recent = ids
          .map((id) => commands.find((c) => c.id === id))
          .filter((c): c is CommandItem => c !== undefined);
        this._recentCommands.set(recent);
      }
    } catch {
      // Ignore parse errors
    }
  }

  private saveRecentCommands(): void {
    try {
      const ids = this._recentCommands().map((c) => c.id);
      localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(ids));
    } catch {
      // Ignore storage errors
    }
  }
}
