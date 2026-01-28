export interface SearchItem {
  searchText?: string;
}

export interface SearchContainer<T extends SearchItem> extends SearchItem {
  items: T[];
}

export interface SearchResult<T extends SearchItem> {
  containerMatches: boolean;
  matchedItems: Set<T>;
  queryParts: string[];
}

export class TextSearchEngine {
  public calculateDebounceTime(length: number): number {
    if (length === 0)
      return 0;
    return Math.max(0, 100 - (length - 1) * 25);
  }

  public parseQuery(query: string): string[] {
    return query.toLowerCase().split(/\s+/).filter((p) => p !== '');
  }

  public matchParts(text: string, parts: string[]): boolean {
    for (const part of parts) {
      if (!text.includes(part))
        return false;
    }
    return true;
  }

  public search<T extends SearchItem>(
    query: string,
    container: SearchContainer<T>,
  ): SearchResult<T> {
    const searchParts = this.parseQuery(query);
    return this.searchParts(searchParts, container);
  }

  public searchParts<T extends SearchItem>(
    searchParts: string[],
    container: SearchContainer<T>,
  ): SearchResult<T> {
    const result: SearchResult<T> = {
      containerMatches: false,
      matchedItems: new Set<T>(),
      queryParts: searchParts,
    };

    if (searchParts.length === 0) {
      result.containerMatches = true;

      return result;
    }

    const containerMatchedParts = new Set<string>();
    if (container.searchText !== undefined) {
      for (const part of searchParts) {
        if (container.searchText.includes(part))
          containerMatchedParts.add(part);
      }
    }

    const remainingParts = searchParts.filter((p) => !containerMatchedParts.has(p));

    if (remainingParts.length === 0) {
      result.containerMatches = true;

      return result;
    }

    for (const item of container.items) {
      if (item.searchText === undefined) {
        if (containerMatchedParts.size > 0) {
          result.matchedItems.add(item);
        }
        continue;
      }

      if (this.matchParts(item.searchText, remainingParts)) {
        result.matchedItems.add(item);
      }
    }

    return result;
  }
}

export const bindSearchInput = (
  input: HTMLInputElement,
  engine: TextSearchEngine,
  onSearch: () => void,
  onInput?: () => void,
): void => {
  let isComposing = false;
  let searchTimeout: number | undefined;

  const triggerSearch = () => {
    if (searchTimeout !== undefined)
      window.clearTimeout(searchTimeout);
    const length = input.value.trim().length;
    const debounceTime = engine.calculateDebounceTime(length);
    if (debounceTime > 0) {
      searchTimeout = window.setTimeout(onSearch, debounceTime);
    } else {
      onSearch();
    }
  };
  // tracking IME composition
  input.addEventListener('compositionstart', () => {
    isComposing = true;
  });
  input.addEventListener('compositionend', () => {
    isComposing = false;
    if (onInput !== undefined)
      onInput();
    triggerSearch();
  });
  input.addEventListener('input', () => {
    if (isComposing)
      return;
    if (onInput !== undefined)
      onInput();
    triggerSearch();
  });
};
