// @ts-ignore
import { AssistantRepository, AssistantChatService, seedDefaultDocumentation } from './engine.mjs';

const globalForAssistant = globalThis as unknown as {
  assistantRepo?: AssistantRepository;
  assistantChat?: AssistantChatService;
};

export function getAssistantServices() {
  if (!globalForAssistant.assistantRepo) {
    const repo = new AssistantRepository();
    seedDefaultDocumentation(repo, process.cwd());
    globalForAssistant.assistantRepo = repo;
    globalForAssistant.assistantChat = new AssistantChatService(repo);
  }
  return {
    repo: globalForAssistant.assistantRepo!,
    chatService: globalForAssistant.assistantChat!
  };
}
