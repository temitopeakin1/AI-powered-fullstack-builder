import { map } from 'nanostores';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
  showPrompt: false,
  checkingList: false,
  errorDetails: false,
  cleaningProject: false,
  projectImportName: undefined as undefined | string,
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

export function setCheckingList(checkingList: false | true) {
  chatStore.setKey('checkingList', checkingList);
}

export function setCleaningProject(cleaningProject: false | true) {
  chatStore.setKey('cleaningProject', cleaningProject);
}
export function setErrorDetails(errorDetails: false | true) {
  chatStore.setKey('errorDetails', errorDetails);
}
export function setProjectImportName(projectImportName: undefined | string) {
  chatStore.setKey('projectImportName', projectImportName);
}

