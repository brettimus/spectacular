import { ChatCliAdapter, localChatMachine } from "./adapters";

const cli = new ChatCliAdapter(localChatMachine);

console.log("Chatting local");

cli.start();
