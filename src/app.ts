import SocketController from './socket';
import SlackController from './slack';
import prompts = require('prompts');

interface Session {
  socketId: string;
  threadId: string;
  studentName: string;
}

class AppController {

  socket: SocketController;
  slack: SlackController;

  sessions: Session[] = [];

  constructor() {
    this.socket = new SocketController(this);
    this.slack = new SlackController(this);
  }

  async start () {
    await this.socket.start();
    await this.slack.start();
  }

  async handleMessageFromClient () {
    /**
     * Called from SocketController
     * Send msg to slack through slackcontroller.postMessage(), to channel or thread depending on if already active session (check if threadId is set)
     * Send msg to client through socketcontroller confirming question's been posted
     */
  }

  async handleMessageFromSlack (data: any) {
    /**
     * Called from SlackController
     * Find session via threadId. Send message to client via socketcontroller.sendMessage()
     */
  }

  // development method to send questions through commandline 
  async prompt () {
    const { question, threadMessage } = await prompts([{
      type: 'text',
      name: 'question',
      message: 'Ask question on Slack:'
    }, {
      type: 'text',
      name: 'threadMessage',
      message: 'Add additional info in thread:'
    }]);

    const response = await this.slack.postMessage({
      channel: 'C0111SXA24T',
      text: question,
      username: 'Student'
    });

    await this.slack.postMessage({
      channel: 'C0111SXA24T',
      text: threadMessage,
      thread: response.ts,
      username: 'Student'
    });
  }

}

export default AppController;