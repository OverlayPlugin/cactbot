import { CactbotConfigurator, kNoSearchMatches, kTriggerSearchPlaceholder } from './config';

export interface SearchTriggerData {
  id?: string;
}

export interface SearchContainerData {
  title?: string;
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

  private multiPartMatch(text: string, term: string): boolean {
    const lText = text.toLowerCase();
    const parts = term.toLowerCase().split(/\s+/).filter((p) => p !== '');

    // Each part must be found within the text
    for (const part of parts) {
      if (!lText.includes(part))
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

    const allTriggerContainers = this.container.querySelectorAll('.trigger-file-container');
    let anyVisible = false;

    allTriggerContainers.forEach((containerElement) => {
      const triggerContainer = containerElement as HTMLElement & {
        __containerData?: SearchContainerData;
      };

      let containerMatchesTitle = false;

      const title = triggerContainer.__containerData?.title;
      if (title !== undefined && title !== null) {
        const titleText = title.replace(/<[^>]*>/g, '');
        if (this.multiPartMatch(titleText, searchTerm))
          containerMatchesTitle = true;
      }

      if (containerMatchesTitle) {
        this.setContainerVisible(triggerContainer, true);
        anyVisible = true;
      } else {
        const triggersInContainer = triggerContainer.querySelectorAll('.trigger');
        let hasVisibleTrigger = false;

        triggersInContainer.forEach((triggerDiv) => {
          const triggerElement = triggerDiv as HTMLElement;
          const triggerData = (triggerElement as HTMLElement & {
            __triggerData?: SearchTriggerData;
          }).__triggerData;

          if (triggerData === undefined) {
            this.setTriggerVisible(triggerElement, true);
            hasVisibleTrigger = true;
            return;
          }

          const shouldShow = this.checkTriggerMatch(triggerData, searchTerm);
          this.setTriggerVisible(triggerElement, shouldShow);

          if (shouldShow)
            hasVisibleTrigger = true;
        });

        this.setContainerVisible(triggerContainer, hasVisibleTrigger);
        if (hasVisibleTrigger)
          anyVisible = true;
      }
    });

    this.updateExpansionVisibility(true);
    this.noMatchesMessage.style.display = anyVisible ? 'none' : 'block';
  }

  private checkTriggerMatch(data: SearchTriggerData, term: string): boolean {
    return data.id !== undefined && this.multiPartMatch(data.id, term);
  }

  private showAll(): void {
    const allTriggerDivs = this.container.querySelectorAll('.trigger');
    allTriggerDivs.forEach((triggerDiv) => this.setTriggerVisible(triggerDiv as HTMLElement, true));

    const allContainers = this.container.querySelectorAll(
      '.trigger-file-container',
    );
    allContainers.forEach((cont) => {
      const containerElement = cont as HTMLElement;
      containerElement.style.display = '';
      containerElement.classList.add('collapsed');
    });

    this.updateExpansionVisibility(false, true);
    this.noMatchesMessage.style.display = 'none';
  }

  private setTriggerVisible(triggerElement: HTMLElement, visible: boolean): void {
    const display = visible ? '' : 'none';
    triggerElement.style.display = display;
    const nextSibling = triggerElement.nextElementSibling;
    if (nextSibling !== null && nextSibling.classList.contains('trigger-details'))
      (nextSibling as HTMLElement).style.display = display;
  }

  private setContainerVisible(container: HTMLElement, visible: boolean): void {
    container.style.display = visible ? '' : 'none';
    if (visible) {
      const triggers = container.querySelectorAll('.trigger');
      triggers.forEach((t) => this.setTriggerVisible(t as HTMLElement, visible));
    }
  }

  private updateExpansionVisibility(searching: boolean, forceCollapse?: boolean): void {
    const allExpansionContainers = this.container.querySelectorAll('.trigger-expansion-container');
    allExpansionContainers.forEach((expansionElement) => {
      const expansionContainer = expansionElement as HTMLElement;
      const visibleFileContainers = expansionContainer.querySelectorAll(
        '.trigger-file-container:not([style*="display: none"])',
      );
      const hasVisible = visibleFileContainers.length > 0;
      expansionContainer.style.display = hasVisible ? '' : 'none';

      if (searching && hasVisible)
        expansionContainer.classList.remove('collapsed');
      else if (forceCollapse)
        expansionContainer.classList.add('collapsed');
    });
  }

  public static setContainerData(element: HTMLElement, data: SearchContainerData): void {
    (element as HTMLElement & { __containerData?: SearchContainerData }).__containerData = data;
  }

  public static setTriggerData(element: HTMLElement, data: SearchTriggerData): void {
    (element as HTMLElement & { __triggerData?: SearchTriggerData }).__triggerData = data;
  }
}
