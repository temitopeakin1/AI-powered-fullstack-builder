import { map, MapStore } from 'nanostores';

interface ChatStore {
  started: boolean;
  aborted: boolean;
  showChat: boolean;
  showPrompt: boolean;
  checkingList: boolean;
  errorDetails: boolean;
  cleaningProject: boolean;
  projectImportName: string;
  mode: 'chat' | 'code';
  isStreaming: boolean;
};

export const chatStore: MapStore<ChatStore> = map({
  started: false,
  aborted: false,
  showChat: true,
  showPrompt: false,
  checkingList: false,
  errorDetails: false,
  cleaningProject: false,
  projectImportName: "",
  mode: 'code' as 'chat' | 'code',
  isStreaming: false,
});

export function setChatMode(mode: 'chat' | 'code') {
  chatStore.setKey('mode', mode);
}

export function setIsStreaming(isStreaming: boolean) {
  chatStore.setKey('isStreaming', isStreaming);
}

export function setShowChat(showChat: boolean) {
  chatStore.setKey('showChat', showChat);
}

export function setShowPrompt(showPrompt: boolean) {
  chatStore.setKey('showPrompt', showPrompt);
}

export function setCheckingList(checkingList: boolean) {
  chatStore.setKey('checkingList', checkingList);
}

export function setCleaningProject(cleaningProject: boolean) {
  chatStore.setKey('cleaningProject', cleaningProject);
}
export function setErrorDetails(errorDetails: boolean) {
  chatStore.setKey('errorDetails', errorDetails);
}
export function setProjectImportName(projectImportName: string) {
  chatStore.setKey('projectImportName', projectImportName);
}
