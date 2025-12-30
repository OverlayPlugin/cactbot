import {
  CactbotConfigurator,
  kNoSearchMatches,
  kShowHiddenTriggers,
  kTriggerSearchPlaceholder,
} from './config';

export interface SearchTriggerData {
  id?: string;
}

export interface SearchContainerData {
  title?: string;
}

// Custom element types to store data and avoid repetitive casts
interface SearchTriggerElement extends HTMLElement {
  __triggerData?: SearchTriggerData;
  __searchText?: string;
}

interface SearchContainerElement extends HTMLElement {
  __containerData?: SearchContainerData;
  __searchText?: string;
}

export class ConfigSearch {
  private searchInput: HTMLInputElement;
  private clearButton: HTMLElement;
  private noMatchesMessage: HTMLElement;

  constructor(
    private base: CactbotConfigurator,
    private container: HTMLElement,
  ) {
    this.searchInput = document.createElement('input');
    this.clearButton = document.createElement('div');
    this.noMatchesMessage = document.createElement('div');
    this.buildUI();
  }

  private buildUI(): void {
    const searchContainer = document.createElement('div');
    searchContainer.classList.add('trigger-search-container');
    this.container.appendChild(searchContainer);

    this.searchInput.type = 'text';
    this.searchInput.classList.add('trigger-search-input');
    this.searchInput.placeholder = this.base.translate(kTriggerSearchPlaceholder);
    this.searchInput.oninput = () => {
      this.updateClearButton();
      this.performSearch();
    };
    searchContainer.appendChild(this.searchInput);

    this.clearButton.classList.add('trigger-search-clear');
    this.clearButton.onclick = () => this.clearSearch();
    searchContainer.appendChild(this.clearButton);

    this.noMatchesMessage.classList.add('trigger-search-no-matches');
    this.noMatchesMessage.innerText = this.base.translate(kNoSearchMatches);
    this.noMatchesMessage.style.display = 'none';
    this.container.appendChild(this.noMatchesMessage);
  }

  private updateClearButton(): void {
    this.clearButton.style.display = this.searchInput.value === '' ? 'none' : 'block';
  }

  private clearSearch(): void {
    this.searchInput.value = '';
    this.updateClearButton();
    this.showAll();
  }

  private matchParts(text: string, parts: string[]): boolean {
    for (const part of parts) {
      if (!text.includes(part))
        return false;
    }
    return true;
  }

  public performSearch(): void {
    const searchTerm = this.searchInput.value.trim();

    if (searchTerm === '') {
      this.showAll();
      return;
    }

    const searchParts = searchTerm.toLowerCase().split(/\s+/).filter((p) => p !== '');
    const visibleExpansionContainers = new Set<HTMLElement>();

    const allTriggerContainers = this.container.querySelectorAll<SearchContainerElement>(
      '.trigger-file-container',
    );
    let anyVisible = false;

    allTriggerContainers.forEach((triggerContainer) => {
      let containerMatchesTitle = false;

      // Use pre-calculated __searchText
      if (
        triggerContainer.__searchText !== undefined &&
        this.matchParts(triggerContainer.__searchText, searchParts)
      )
        containerMatchesTitle = true;

      if (containerMatchesTitle) {
        this.setContainerVisible(triggerContainer, true);
        this.updateShowHiddenButton(triggerContainer, 0);
        anyVisible = true;
      } else {
        const triggersInContainer = triggerContainer.querySelectorAll<SearchTriggerElement>(
          '.trigger',
        );
        let hasVisibleTrigger = false;
        let hiddenCount = 0;

        triggersInContainer.forEach((triggerElement) => {
          const triggerData = triggerElement.__triggerData;

          if (triggerData === undefined) {
            this.setTriggerVisible(triggerElement, true);
            hasVisibleTrigger = true;
            return;
          }

          const shouldShow = this.checkTriggerMatch(triggerElement, searchParts);
          this.setTriggerVisible(triggerElement, shouldShow);

          if (shouldShow)
            hasVisibleTrigger = true;
          else
            hiddenCount++;
        });

        this.setContainerVisible(triggerContainer, hasVisibleTrigger, false);
        this.updateShowHiddenButton(triggerContainer, hiddenCount);

        if (hasVisibleTrigger)
          anyVisible = true;
      }

      if (triggerContainer.style.display !== 'none') {
        const expansion = triggerContainer.closest('.trigger-expansion-container');
        if (expansion instanceof HTMLElement)
          visibleExpansionContainers.add(expansion);
      }
    });

    this.updateExpansionVisibility(true, visibleExpansionContainers);
    this.noMatchesMessage.style.display = anyVisible ? 'none' : 'block';
  }

  private checkTriggerMatch(
    element: SearchTriggerElement,
    searchParts: string[],
  ): boolean {
    const searchText = element.__searchText;
    return searchText !== undefined && this.matchParts(searchText, searchParts);
  }

  private showAll(): void {
    const allTriggerDivs = this.container.querySelectorAll<HTMLElement>('.trigger');
    allTriggerDivs.forEach((triggerDiv) => this.setTriggerVisible(triggerDiv, true));

    const allContainers = this.container.querySelectorAll<HTMLElement>('.trigger-file-container');
    allContainers.forEach((containerElement) => {
      containerElement.style.display = '';
      containerElement.classList.add('collapsed');
    });

    this.updateExpansionVisibility(false, null, true);
    this.noMatchesMessage.style.display = 'none';

    const allButtons = this.container.querySelectorAll('.trigger-search-show-hidden');
    allButtons.forEach((b) => b.remove());
  }

  private updateShowHiddenButton(container: HTMLElement, count: number): void {
    const kButtonClass = 'trigger-search-show-hidden';
    let button = container.querySelector<HTMLInputElement>(`.${kButtonClass}`);

    if (count <= 0) {
      if (button)
        button.remove();
      return;
    }

    if (!button) {
      button = document.createElement('input');
      button.type = 'button';
      button.classList.add(kButtonClass);
      button.onclick = () => {
        const triggers = container.querySelectorAll<HTMLElement>('.trigger');
        triggers.forEach((t) => this.setTriggerVisible(t, true));
        if (button)
          button.remove();
      };
      container.appendChild(button);
    }

    const text = this.base.translate(kShowHiddenTriggers).replace('${num}', count.toString());
    button.value = text;
  }

  private setTriggerVisible(triggerElement: HTMLElement, visible: boolean): void {
    const display = visible ? '' : 'none';
    triggerElement.style.display = display;
    const nextSibling = triggerElement.nextElementSibling;
    if (nextSibling instanceof HTMLElement && nextSibling.classList.contains('trigger-details'))
      nextSibling.style.display = display;
  }

  private setContainerVisible(
    container: HTMLElement,
    visible: boolean,
    updateChildren: boolean = true,
  ): void {
    container.style.display = visible ? '' : 'none';
    if (visible && updateChildren) {
      const triggers = container.querySelectorAll<HTMLElement>('.trigger');
      triggers.forEach((t) => this.setTriggerVisible(t, visible));
    }
  }

  private updateExpansionVisibility(
    searching: boolean,
    visibleSet: Set<HTMLElement> | null,
    forceCollapse?: boolean,
  ): void {
    const allExpansionContainers = this.container.querySelectorAll<HTMLElement>(
      '.trigger-expansion-container',
    );
    allExpansionContainers.forEach((expansionContainer) => {
      let hasVisible = false;
      if (visibleSet) {
        hasVisible = visibleSet.has(expansionContainer);
      } else {
        const visibleFileContainers = expansionContainer.querySelectorAll(
          '.trigger-file-container:not([style*="display: none"])',
        );
        hasVisible = visibleFileContainers.length > 0;
      }

      expansionContainer.style.display = hasVisible ? '' : 'none';

      if (searching && hasVisible)
        expansionContainer.classList.remove('collapsed');
      else if (forceCollapse)
        expansionContainer.classList.add('collapsed');
    });
  }

  public static setContainerData(element: HTMLElement, data: SearchContainerData): void {
    const el = element as SearchContainerElement;
    el.__containerData = data;
    if (data.title !== undefined && data.title !== null)
      el.__searchText = data.title.replace(/<[^>]*>/g, '').toLowerCase();
  }

  public static setTriggerData(element: HTMLElement, data: SearchTriggerData): void {
    const el = element as SearchTriggerElement;
    el.__triggerData = data;
    if (data.id !== undefined && data.id !== null)
      el.__searchText = data.id.toLowerCase();
  }
}
