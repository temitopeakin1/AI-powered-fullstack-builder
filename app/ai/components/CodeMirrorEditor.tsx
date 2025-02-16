import { acceptCompletion, autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, indentUnit } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { Compartment, EditorSelection, EditorState, type Extension, StateEffect, StateField } from '@codemirror/state';
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  showTooltip,
  type Tooltip,
  tooltips,
} from '@codemirror/view';
import { memo, type MutableRefObject, useEffect, useRef, useState } from 'react';
import type { Theme } from '~/types/theme';
import { classNames } from '~/utils/classNames';
import { debounce } from '~/utils/debounce';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import { BinaryContent } from './BinaryContent';
import { getTheme, reconfigureTheme } from '../../utils/cm-theme';
import { indentKeyBinding } from '../../utils/indent';
import { getLanguage } from '../../utils/languages';

const logger = createScopedLogger('CodeMirrorEditor');

export interface EditorDocument {
  value: string;
  isBinary: boolean;
  filePath: string;
  scroll?: ScrollPosition;
}

export interface EditorSettings {
  fontSize?: string;
  gutterFontSize?: string;
  tabSize?: number;
}

type TextEditorDocument = EditorDocument & {
  value: string;
};

export interface ScrollPosition {
  top: number;
  left: number;
}

export interface EditorUpdate {
  selection: EditorSelection;
  content: string;
}

export type OnChangeCallback = (update: EditorUpdate) => void;
export type OnScrollCallback = (position: ScrollPosition) => void;
export type OnSaveCallback = () => void;

interface Props {
  theme: Theme;
  id?: unknown;
  doc?: EditorDocument;
  editable?: boolean;
  debounceChange?: number;
  debounceScroll?: number;
  autoFocusOnDocumentChange?: boolean;
  onChange?: OnChangeCallback;
  onScroll?: OnScrollCallback;
  onSave?: OnSaveCallback;
  className?: string;
  settings?: EditorSettings;
}

type EditorStates = Map<string, EditorState>;

const readOnlyTooltipStateEffect = StateEffect.define<boolean>();

const editableTooltipField = StateField.define<readonly Tooltip[]>({
  create: () => [],
  update(_tooltips, transaction) {
    if (!transaction.state.readOnly) {
      return [];
    }

    for (const effect of transaction.effects) {
      if (effect.is(readOnlyTooltipStateEffect) && effect.value) {
        return getReadOnlyTooltip(transaction.state);
      }
    }

    return [];
  },
  provide: (field) => {
    return showTooltip.computeN([field], (state) => state.field(field));
  },
});

const editableStateEffect = StateEffect.define<boolean>();

const editableStateField = StateField.define<boolean>({
  create() {
    return true;
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(editableStateEffect)) {
        return effect.value;
      }
    }

    return value;
  },
});

export const CodeMirrorEditor = memo(
  ({
    id,
    doc,
    debounceScroll = 100,
    debounceChange = 150,
    autoFocusOnDocumentChange = false,
    editable = true,
    onScroll,
    onChange,
    onSave,
    theme,
    settings,
    className = '',
  }: Props) => {
    renderLogger.trace('CodeMirrorEditor');

    const [languageCompartment] = useState(new Compartment());

    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView>();
    const themeRef = useRef<Theme>();
    const docRef = useRef<EditorDocument>();
    const editorStatesRef = useRef<EditorStates>();
    const onScrollRef = useRef(onScroll);
    const onChangeRef = useRef(onChange);
    const onSaveRef = useRef(onSave);

    const [currentFilePath, setCurrentFilePath] = useState<string>('');
    const [currentLanguageSupport, setCurrentLanguageSupport] = useState<any>();

    // Reset language support when the file changes.
    useEffect(() => {
      const newFileName = doc?.filePath;
      if (newFileName === currentFilePath) {
        return;
      }
      setCurrentFilePath(newFileName as string);
      setCurrentLanguageSupport(undefined);
    }, [doc?.filePath]);

    useEffect(() => {
      onScrollRef.current = onScroll;
      onChangeRef.current = onChange;
      onSaveRef.current = onSave;
      docRef.current = doc;
      themeRef.current = theme;
    });

    useEffect(() => {
      const onUpdate = debounce((update: EditorUpdate) => {
        onChangeRef.current?.(update);
      }, debounceChange);

      const view = new EditorView({
        parent: containerRef.current!,
        dispatchTransactions(transactions) {
          const previousSelection = view.state.selection;
          view.update(transactions);
          const newSelection = view.state.selection;
          const selectionChanged =
            newSelection !== previousSelection &&
            (newSelection === undefined || previousSelection === undefined || !newSelection.eq(previousSelection));

          if (docRef.current && (transactions.some((transaction) => transaction.docChanged) || selectionChanged)) {
            onUpdate({
              selection: view.state.selection,
              content: view.state.doc.toString(),
            });
            editorStatesRef.current!.set(docRef.current.filePath, view.state);
          }
        },
      });

      viewRef.current = view;

      return () => {
        viewRef.current?.destroy();
        viewRef.current = undefined;
      };
    }, []);

    useEffect(() => {
      if (!viewRef.current) {
        return;
      }
      viewRef.current.dispatch({
        effects: [reconfigureTheme(theme)],
      });
    }, [theme]);

    useEffect(() => {
      if (!viewRef.current) {
        return;
      }
      viewRef.current.dispatch({
        effects: [editableStateEffect.of(editable)],
      });
    }, [editable, doc]);

    useEffect(() => {
      editorStatesRef.current = new Map<string, EditorState>();
    }, [id]);

    // WAIT for LSP before updating the state to avoid flickering.
    useEffect(() => {
      const editorStates = editorStatesRef.current!;
      const view = viewRef.current!;
      const theme = themeRef.current!;

      if (!doc) {
        const state = newEditorState('', theme, settings, onScrollRef, debounceScroll, onSaveRef, [
          languageCompartment.of([]),
          editableStateField.init(() => editable),
        ]);
        view.setState(state);
        setNoDocument(view);
        return;
      }

      if (doc.isBinary) {
        return;
      }

      if (doc.filePath === '') {
        logger.warn('File path should not be empty');
      }

      getLanguage(doc.filePath).then((languageSupport) => {
        const langExtensions = languageSupport ? [languageSupport] : [];
        let state = editorStates.get(doc.filePath);
        if (!state) {
          state = newEditorState(doc.value, theme, settings, onScrollRef, debounceScroll, onSaveRef, [
            languageCompartment.of(langExtensions),
            editableStateField.init(() => editable),
          ]);
          editorStates.set(doc.filePath, state);
          view.setState(state);
        } else {
          view.dispatch({
            effects: [languageCompartment.reconfigure(langExtensions), reconfigureTheme(theme)],
          });
        }
        setEditorDocument(
          view,
          theme,
          editable,
          languageCompartment,
          autoFocusOnDocumentChange,
          doc as TextEditorDocument,
          currentLanguageSupport,
          setCurrentLanguageSupport,
        );
      });
    }, [doc?.value, editable, doc?.filePath, autoFocusOnDocumentChange]);

    return (
      <div className={classNames('relative h-full', className)}>
        {doc?.isBinary && <BinaryContent />}
        <div className="h-full overflow-hidden" ref={containerRef} />
      </div>
    );
  },
);

export default CodeMirrorEditor;

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

function newEditorState(
  content: string,
  theme: Theme,
  settings: EditorSettings | undefined,
  onScrollRef: MutableRefObject<OnScrollCallback | undefined>,
  debounceScroll: number,
  onFileSaveRef: MutableRefObject<OnSaveCallback | undefined>,
  extensions: Extension[],
) {
  return EditorState.create({
    doc: content,
    extensions: [
      EditorView.domEventHandlers({
        scroll: debounce((event, view) => {
          if (event.target !== view.scrollDOM) {
            return;
          }
          onScrollRef.current?.({ left: view.scrollDOM.scrollLeft, top: view.scrollDOM.scrollTop });
        }, debounceScroll),
        mousedown: (event, view) => {
          if (view.state.readOnly) {
            event.preventDefault();
            event.stopPropagation();
            view.dispatch({
              effects: [readOnlyTooltipStateEffect.of(true)],
            });
            return true;
          } else {
            view.requestMeasure();
          }
          return false;
        },
        keydown: (event, view) => {
          if (view.state.readOnly) {
            view.dispatch({
              effects: [readOnlyTooltipStateEffect.of(event.key !== 'Escape')],
            });
            return true;
          } else {
            view.requestMeasure();
          }
          return false;
        },
      }),
      getTheme(theme, settings),
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        { key: 'Tab', run: acceptCompletion },
        {
          key: 'Mod-s',
          preventDefault: true,
          run: () => {
            onFileSaveRef.current?.();
            return true;
          },
        },
        indentKeyBinding,
      ]),
      indentUnit.of('\t'),
      autocompletion({
        closeOnBlur: false,
      }),
      tooltips({
        position: 'absolute',
        parent: document.body,
        tooltipSpace: (view) => {
          const rect = view.dom.getBoundingClientRect();
          return {
            top: rect.top - 50,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right + 10,
          };
        },
      }),
      closeBrackets(),
      lineNumbers(),
      // scrollPastEnd(),
      dropCursor(),
      drawSelection(),
      bracketMatching(),
      EditorState.tabSize.of(settings?.tabSize ?? 2),
      indentOnInput(),
      editableTooltipField,
      editableStateField,
      EditorState.readOnly.from(editableStateField, (editable) => !editable),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      foldGutter({
        markerDOM: (open) => {
          const icon = document.createElement('div');
          icon.className = `fold-icon ${open ? 'i-ph-caret-down-bold' : 'i-ph-caret-right-bold'}`;
          return icon;
        },
      }),
      ...extensions,
    ],
  });
}

function setNoDocument(view: EditorView) {
  view.dispatch({
    selection: { anchor: 0 },
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: '',
    },
  });
  view.scrollDOM.scrollTo(0, 0);
}

//TODO: Get rid of 'any' here?
function setEditorDocument(
  view: EditorView,
  theme: Theme,
  editable: boolean,
  languageCompartment: Compartment,
  autoFocus: boolean,
  doc: TextEditorDocument,
  currentLanguageSupport: any,
  setCurrentLanguageSupport: any,
) {
  const oldText = view.state.doc.toString();
  const newText = doc.value;
  const isAppending = oldText?.length && newText.length > oldText.length && newText.startsWith(oldText);

  if (doc.value !== view.state.doc.toString()) {
    if (isAppending) {
      const appendText = newText.slice(oldText.length);
      const currentSelection = view.state.selection;
      view.dispatch({
        changes: {
          from: oldText.length,
          to: oldText.length,
          insert: appendText,
        },
        selection: currentSelection,
      });
    } else {
      view.dispatch({
        selection: isAppending ? undefined : { anchor: 0 },
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: doc.value,
        },
        scrollIntoView: false,
      });
    }
  }

  // Adjust scrolling—if the user is near the bottom and new code is streamed in, scroll to the bottom.
  const viewportHeight = view.scrollDOM.clientHeight;
  const totalHeight = view.scrollDOM.scrollHeight;
  const currentScroll = view.scrollDOM.scrollTop;
  const isNearBottom = totalHeight - (currentScroll + viewportHeight) < 50;
  const preserveScroll = isAppending && !isNearBottom;

  if (preserveScroll) {
    requestAnimationFrame(() => {
      view.scrollDOM.scrollTop = currentScroll;
    });
  } else if (isAppending && isNearBottom) {
    requestAnimationFrame(() => {
      view.scrollDOM.scrollTop = view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight;
    });
  } else if (!isAppending) {
    requestAnimationFrame(() => {
      view.scrollDOM.scrollTop = 0;
    });
  }
}

function getReadOnlyTooltip(state: EditorState) {
  if (!state.readOnly) {
    return [];
  }
  return state.selection.ranges
    .filter((range) => range.empty)
    .map((range) => {
      return {
        pos: range.head,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          const divElement = document.createElement('div');
          divElement.className = 'cm-readonly-tooltip';
          divElement.textContent = 'Cannot edit file while AI response is being generated';
          return { dom: divElement };
        },
      };
    });
}
