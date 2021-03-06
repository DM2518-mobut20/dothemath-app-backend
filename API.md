# API documentation

Enabling Socket.IO in frontend:

```javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>

<script>
  const socket = io('https://api.dothemath.app');  // URL to backend
  
  socket.on('connect', () => {
    socket.emit('send_message', { text: 'Message from the web!' });
  });
</script>
```

## Methods

### establish_session

Call once per question/session. Calling it again will result in a new thread on Slack.
Name | Type | Required | Description
--- | --- | --- | ---
studentName | string | * | Nickname of student
channelId | string | * | Channel ID

```javascript
socket.emit('establish_session', {
  studentName: 'MyNickName',
  channelId: 'C011ENW7TJQ'
});
```

___

### reestablish_session

Re-establishes a previous session/conversation by fetching messages from slack. Takes a callback which returns username and messages.
Name | Type | Required | Description
--- | --- | --- | ---
threadId | string | * | Slack Thread Id
channelId | string | * | Channel ID

```javascript
socket.emit('reestablish_session', {
  threadId: '1287050862.014200',
  channelId: 'C011ENW7TJQ'
}, { name, messages} => {
  
});
```

___

### send_message

Name | Type | Required | Description
--- | --- | --- | ---
text | string | * | Message text
image | ArrayBuffer | |

```javascript
socket.emit('send_message', { text: 'Message from the web!' });
```

### get_channels 

Takes a callback function. See [channel_list](#channel_list) for format of return value.

```javascript
socket.emit('get_channels', channels => {
  console.log(channels)
});
```

___

## Events

### message

Name | Type | Description
--- | --- | ---
text | string | Message text
name | string | Message sender
avatar | string | Message sender profile image URL
image | string | Message attached image URL (if there is one)

```javascript
socket.on('message', ({text, name}) => {
  console.log(`${name}: ${text}`);
});
```

### channel_list

This event happens after socket connents. Sends an array of objects.

Name | Type | Description
--- | --- | ---
name | string | Channel name
id | string | Channel ID

```javascript
socket.on('channel_list', channels => {
  channels.forEach(channel => {
    console.log(`${channel.id}: ${channel.name}`)
  });
});
```
