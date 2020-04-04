import http from 'http';
import socketIO from 'socket.io';
import faker from 'faker';

import AppController from './app';

interface EstablishSessionData {
  studentName: string;
}

interface MessageData {
  text: string;
}

// Handles communication to/from frontend via websockets
class SocketController {

  controller: AppController;

  server: http.Server;
  io: SocketIO.Server;

  constructor (controller: AppController) {
    this.controller = controller;

    this.server = http.createServer();
    this.io = socketIO(this.server);

    this.initEventListeners();
  }

  initEventListeners() {
    // listen to messages sent from frontend, call appropriate method on appcontroller 

    this.io.on('connection', socket => {

      this.sendChannelList(socket.id);

      socket.on('send_message', ({ text }: MessageData) => {
        this.controller.handleMessageFromClient({
          message: text,
          socketId: socket.id
        });
      });

      socket.on('establish_session', (data: EstablishSessionData) => {
        this.controller.establishSession({
          name: data.studentName,
          socketId: socket.id
        });
      });

      socket.on('disconnect', () => {
        this.controller.dropSession(socket.id);
      });


      const tutor = faker.name.firstName();
      setInterval(() => {
        socket.emit('message', {
          text: faker.lorem.sentences(3),
          name: tutor
        });
      }, 5000);
  
    })
  }

  async start() {
    this.server.listen(3001);
  }

  async sendChannelList (socketId: string) {
    const channels = this.controller.getChannels();
    const socket = this.io.sockets.sockets[socketId];

    if (socket) {
      socket.emit('channel_list', channels);
    }
  }

  async sendMessage () {
    
  }
}

export default SocketController;