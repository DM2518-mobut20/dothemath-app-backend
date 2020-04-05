import prompts = require('prompts');
import _ from 'lodash';
import { Server } from 'http';

import SocketController from './socket';
import SlackController from './slack';

interface Session {
  socketId: string;
  threadId?: string;
  studentName: string;
  channelId: string;
}

interface EstablishSessionOptions {
  name: string;
  socketId: string;
  channelId: string;
}

interface HandleMessageFromClientOptions {
  text: string;
  socketId: string;
}

interface HandleMessageFromSlackOptions {
  text: string;
  sender: string;
  threadId: string;
  senderAvatar: string;
}

class AppController {

  socket: SocketController;
  slack: SlackController;
  server: Server;

  sessions: Session[] = [];

  constructor() {
    this.socket = new SocketController(this);
    this.slack = new SlackController(this);
  }

  async start () {
    const server = await this.slack.start();
    this.server = server;
    this.socket.attachToServer(server);
  }

  establishSession ({name, socketId, channelId}: EstablishSessionOptions) {
    const activeSession = this.sessions.find(session => session.socketId === socketId);
    if (activeSession) {
      this.dropSession(activeSession.socketId);
    }
    
    this.sessions.push({
      studentName: name,
      socketId,
      channelId: channelId
    });

    console.log(this.sessions);
  }

  dropSession (socketId: string) {
    const droppedSessions = _.remove(this.sessions, session => session.socketId === socketId);
    if(droppedSessions.length > 0 && droppedSessions[0].threadId) {
      const droppedSession = droppedSessions[0];
      this.slack.postMessage({
        channel: droppedSession.channelId,
        thread: droppedSession.threadId,
        text: `${droppedSession.studentName} har kopplat från och kommer inte se nya meddelanden. Tack för din hjälp! 😁`
      })
    } 
  }

  getChannels() {
    return [
      { name: 'bot-test', id: 'C0111SXA24T'},
      { name: 'bot-test-2', id: 'C011ENW7TJQ'}
    ]
  }

  async handleMessageFromClient ({ text, socketId }: HandleMessageFromClientOptions) {
    
    const session = this.sessions.find(s => s.socketId === socketId);

    if (!session) {
      throw 'No active session';
    }

    const { studentName, threadId, channelId } = session;

    const response = await this.slack.postMessage({
      text: text,
      channel: channelId,
      username: studentName ? studentName : 'Web Client',
      thread: threadId
    });

    if (!threadId) {
      session.threadId = response.ts;
    }

    return response;
    /**
     * Called from SocketController
     * Send msg to slack through slackcontroller.postMessage(), to channel or thread depending on if already active session (check if threadId is set)
     * Send msg to client through socketcontroller confirming question's been posted
     */
  }

  async handleMessageFromSlack ({ text, threadId, sender, senderAvatar}: HandleMessageFromSlackOptions) {
    /**
     * Called from SlackController
     * Find session via threadId. Send message to client via socketcontroller.sendMessage()
     */
    const session = this.sessions.find(s => s.threadId === threadId);

    if (session) {
      this.socket.sendMessage({
        socketId: session.socketId,
        text,
        sender,
        senderAvatar
      });
    }
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