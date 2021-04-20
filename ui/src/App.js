import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGrinBeam, faHome, faPaperPlane, faImage} from '@fortawesome/free-solid-svg-icons'
//import 'font-awesome/css/font-awesome.min.css';
import socketClient from 'socket.io-client';
import './App.css';
import './ToggleSwitch.scss';
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Card, DropdownButton, Dropdown, ButtonGroup, InputGroup, Form, FormControl, Col, Container, Row, Modal, Navbar } from 'react-bootstrap';
const SERVER = 'http://localhost:8000/'

/*
@author: Biswarup Ray
*/
// create our App

class ToggleSwitch extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange(event) {
    this.props.handleChange(event)
  }
  render() {
    return (
      <div className="toggle-switch">
        <input
          type="checkbox"
          className="toggle-switch-checkbox"
          name={this.props.name}
          id={this.props.name}
          onChange = {this.handleChange}
        />
        <label className="toggle-switch-label" htmlFor={this.props.name}>
          <span className="toggle-switch-inner" />
          <span className="toggle-switch-switch" />
        </label>
      </div>
    );
  }
}

class TopLabel extends React.Component {
  render() {
    return (
      <Navbar className="color-nav" variant="light" >
        <Navbar.Brand style = {{color: "#FFB320", fontSize: 25, fontWeight: "bold"}}>ChatGood</Navbar.Brand>
        <FontAwesomeIcon icon={faGrinBeam} size = '2x' style={{color: "#FFB320"}} />
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text style = {{color: "#FFB320", fontSize: 20}}>
            Broadcast: <ToggleSwitch name='broadcast' handleChange = {this.props.handleChange} />
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

class NameBox extends React.Component {
  constructor(props) {
    super(props);
    this.name = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleClick() {
    var nickname = document.getElementById('name');
    if (this.name.current.value && this.name.current.value !== '') {
      this.props.handleClick(this.name.current.value);
      nickname.textContent = this.name.current.value;
    }
    this.name.current.value = ''
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleClick();
    }
  }

  render() {
    return (
      <div className='namebox' onKeyPress={this.handleKeyPress} >
        <InputGroup className="mb-3" size='sm'>
          <InputGroup.Prepend>
            <InputGroup.Text id='name'>No name given yet</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            placeholder="Enter your name..."
            ref={this.name}
          />
          <InputGroup.Append>
            <Button onClick={this.handleClick} variant="info">OK</Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}

class ChatBox extends React.Component {

  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    this.number_of_messages = 0;

    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }
  scrollToBottom() {
    if (this.number_of_messages < this.props.messages.length) {
      this.scrollRef.current.scrollTop = this.scrollRef.current.scrollHeight;
      this.number_of_messages = this.props.messages.length
    }
  }

  render() {
    return (
      <Container className='chatwindow'>
        <Row><NameBox handleClick={this.props.handleNameClick} /></Row>
        <Row>
          <ul className='chatbox' ref={this.scrollRef}>
            {this.props.messages.map((message, index) =>
              <MessageBox key={index} message={message.message} username={message.username} file={message.file} appearance={message.socketid !== this.props.socketid ? 'left' : 'right'} />
            )}
          </ul>
        </Row>
        <Row><InputMessageBox handleClick={this.props.handleMessageClick} handleFileSelect={this.props.handleFileSelect} /></Row>
      </Container>
    )
  }
}

class MessageBox extends React.Component {

  constructor(props) {
    super(props)
    this.toBase64 =this.toBase64.bind(this)
  }

  toBase64(arr) {
    if(arr) {
      return btoa(
        arr.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
    } else {
      console.log('Error')
    }
  } 

  render() {
    return (
      <li className={`message ${this.props.appearance} appeared`}>
        <div className='text_wrapper'>
          <div className="username">{this.props.appearance === 'right' ? "You" : this.props.username}</div>
          {this.props.message? <div className="text">{this.props.message}</div>: null}
          {console.log(this.props.file)}
          {this.props.file? <img style={{height:"10em", maxWidth: "20em"}} src={this.props.file.__proto__ === "ArrayBuffer" ?"data:image/png;base64," + this.toBase64(this.props.file) : URL.createObjectURL(new Blob([this.props.file]))}/> : null}
        </div>
      </li>
    )
  }
}

class InputMessageBox extends React.Component {
  constructor(props) {
    super(props);
    this.message = React.createRef();

    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.state = {
      fileSelected: false
    }
  }

  handleClick() {
    if (this.message.current.value && this.message.current.value !== '')
      this.props.handleClick(this.message.current.value);
    else if(this.state.fileSelected) {
      this.props.handleClick(null)
      this.setState({fileSelected: false})
    }
    this.message.current.value = null;
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleClick();
    }
  }

  handleFileSelect(e) {
    if(e.target.files[0]) {
      this.props.handleFileSelect(e);
      this.setState({fileSelected: true})
    }
  }

  render() {
    return (
      <div className='inputmessagebox' onKeyPress={this.handleKeyPress}>
        <InputGroup className="mb-3" size='sm'>
          <FormControl
            placeholder="Type a message..."
            ref={this.message}
          />
          <InputGroup.Append>
            <Button variant="secondary">
              <label htmlFor="files" style={{padding: "0px", margin: "0px"}}>
              <FontAwesomeIcon icon={faImage} size = 'lg' style={{color: "#ffffff"}} />
              </label>
            </Button>
            <input 
              type="file"
              id="files"
              name="files"
              style={{display: "none"}} 
              onChange={(e) => this.handleFileSelect(e)} />
          </InputGroup.Append>
          <InputGroup.Append>
            <SendButton handleClick={this.handleClick} />
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}

class SendButton extends React.Component {
  render() {
    return (
      <>
        <Button variant="success" size="sm" onClick={this.props.handleClick}><FontAwesomeIcon icon={faPaperPlane} size = 'lg' style={{color: "#ffffff"}} /></Button>{' '}
      </>
    )
  }
}

class Channels extends React.Component {

  constructor(props) {
    super(props);
    this.state={
      showForm: false
    }
    this.newChannel = React.createRef()
    this.createChannel = this.createChannel.bind(this)
  }

  createChannel(ch) {
    this.setState({showForm: false})
    this.props.createChannel(ch)
  }
  render() {
    return (
      <div className="channelblock">
        <div className='channellist'>
          <div style={{ borderBottom: '1px solid rgb(163, 163, 163)' }}>
            <div className="d-inline text-dark" style={{ margin: "10px 125px", fontSize: 20}}>Rooms{' '}
            <FontAwesomeIcon icon={faHome} style={{color: "#4c3c77"}} /></div>
          </div>
          <ul style={{ padding: 0 }}>
            {this.props.channels.map((channel, index) =>
              <Channel key={index} handleChannelClick={this.props.handleChannelClick} deleteChannel={this.props.deleteChannel} isSelected={channel.channelName !== this.props.joinedChannel? false: true} type={channel['channelType']} channelName={channel["channelName"]} participants={channel["participants"]} number_of_users={channel["number_of_users"]} />
            )}
          </ul>
        </div>
        <InputGroup className="mb-3" size='sm'>
          <InputGroup.Append>
            <Button variant="info" onClick={() => {this.setState({showForm: true})}} block>Create New Room</Button>
            {this.state.showForm && <ChannelForm show={this.state.showForm} createChannel={this.createChannel}/>}
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}

class Channel extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showinfo: false,
      passwordInput: false,
      password: null
    }

    this.click = this.click.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this)
    this.deleteChannel = this.deleteChannel.bind(this)
    this.checkPassword = this.checkPassword.bind(this)
  }

  click() {
    if(this.props.isSelected) {
      console.log('Already joined in this channel')
    }
    if(this.props.type==='private') {
      this.setState({passwordInput: true})
    } else 
    this.props.handleChannelClick(this.props.channelName, null);
  }

  handleClose() {
    this.setState({showinfo: false})
  }

  handleOpen() {
    this.setState({showinfo: true})
  }

  deleteChannel() {
    this.props.deleteChannel(this.props.channelName)
  }

  checkPassword() {
    this.setState({passwordInput: false})
    this.props.handleChannelClick(this.props.channelName, this.state.password)
  }

  render() {
    return (
      <>
      <Card className="channel-card">
        <Card.Body className={`${this.props.isSelected? 'selected': ''}`}>
          <Card.Title >
            {this.props.channelName}
          <DropdownButton variant="secondary" size="sm" style={{float: "right"}} as={ButtonGroup} title="" id="bg-nested-dropdown">
            <Dropdown.Item eventKey="3" onClick={this.click}>Join</Dropdown.Item>
            <Dropdown.Item eventKey="1" onClick={this.handleOpen}>View</Dropdown.Item>
            <Dropdown.Item eventKey="2" onClick={this.deleteChannel}>Delete</Dropdown.Item>
          </DropdownButton>
          </Card.Title>
          
          <Card.Subtitle className="mb-2 text-muted">Participants: {this.props.number_of_users}</Card.Subtitle>
          {/* <Card.Link >Delete Group</Card.Link> */}
        </Card.Body>
      </Card>

      <Modal name="channel-join" show={this.state.passwordInput} onHide={() => {this.setState({passwordInput: false})}} onKeyPress={(e) => {if(e.Key === "Enter" && this.state.password) this.checkPassword()}} centered>
        <Modal.Header closeButton>
          <Modal.Title>Private Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" onChange={(e) => this.setState({password: e.target.value})} placeholder="Enter Password"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.checkPassword}>Join</Button>
        </Modal.Footer>
      </Modal>

      <Modal name="channel-info" show={this.state.showinfo} onHide={this.handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{this.props.channelName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul style={{ padding: 0 }}>
            {this.props.participants.map(p =>
              <p>{"User: "+ p.username}</p>
            )}
          </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={this.handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>

    </>
    )
  }
}

class ChannelForm extends React.Component {
  
  constructor(props) {
    super(props)
    this.state={
      showDialog: this.props.show,
      showPasswordInput: false,
      channel: {
        channelName: null,
        channelType: "public",
        password: null
      }
    }
    this.name = React.createRef()
    this.password = React.createRef()

    this.createChannel = this.createChannel.bind(this)
  }

  createChannel() {
    this.props.createChannel(this.state.channel)
    console.log(this.state.channel)
    this.setState({showDialog: false})
  }

  render() {
    return(
      <>
      {console.log(this.state.showDialog)}
      <Modal show={this.state.showDialog} onHide={() => {this.setState({showDialog: false})}} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="channelName">
              <Form.Label>Room Name</Form.Label>
              <Form.Control onChange={(e)=> {if(e.target.value) this.state.channel.channelName=e.target.value}} type="text" placeholder="Enter room name"/>
            </Form.Group>
            <Form.Group controlId="channelType">
              <div key="inline-checkbox" className="mb-3">
                <Form.Check inline label="public" type='checkbox' id="publicChannel" />
                <Form.Check inline label="private" type='checkbox' id="privateChannel" onChange={(e)=> {this.state.channel.channelType = e.target.checked? 'private': 'public'; this.setState({showPasswordInput: e.target.checked});}}/>
              </div>
            </Form.Group>
            {this.state.showPasswordInput &&
              <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="text" placeholder="Enter password" onChange={(e) => {this.state.channel.password=e.target.value}} required/>
            </Form.Group>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.createChannel}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
      </>
    )
  }
}

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      socket: null,
      username: null,
      channels: [],
      channel: null,
      messages: [],
      isBroadcast: false,
      isFileAttached: false,
      file: null
    }

    this.handleChannelClick = this.handleChannelClick.bind(this);
    this.handleNameClick = this.handleNameClick.bind(this);
    this.handleMessageClick = this.handleMessageClick.bind(this);
    this.createChannel = this.createChannel.bind(this)
    this.updateServer = this.updateServer.bind(this)
    this.handleBroadcastStatus = this.handleBroadcastStatus.bind(this)
    this.handleFileSelect = this.handleFileSelect.bind(this)
    this.deleteChannel = this.deleteChannel.bind(this)
    this.loadChannels = this.loadChannels.bind(this)

    this.configureSocket();
    this.loadChannels()
  }

  async loadChannels() {
    console.log('loading channels')
    fetch('http://localhost:8000/getChannels').then(async response => {
      let data = await response.json();
      this.setState({
        channels: data.channels
      });
    })
  }

  configureSocket() {
    console.log('Configuring Socket');
    let socket = socketClient(SERVER);
    socket.on('connect', () => {
      console.log('Connected with the server')
    })

    socket.on('message', data => {
      let messages = this.state.messages;
      messages = [...messages, { socketid: data.socketid, username: data.username, message: data.message, isFileAttached: data.isFileAttached, file: data.file }]
      
      this.setState({
        socket: this.state.socket,
        username: this.state.username,
        channels: this.state.channels,
        channel: this.state.channel,
        messages: messages,
        isBroadcast: this.state.isBroadcast,
        isFileAttached: this.state.isFileAttached,
        file: this.state.file
      })
      console.log(data);
      console.log(data.file)
    })

    socket.on('updateChannel', data => {
      this.setState({
        channels: data
      })
    })

    socket.on('messages', data => {
      this.setState({
        messages: data
      })
    })

    this.state.socket = socket
    this.setState(this.state)
  }

  createChannel(newChannel) {
    console.log(newChannel)
    let channels = this.state.channels
    if(channels.find(ch=> ch.channelName === newChannel.channelName)) {
      alert('Channel name already exists')
      return
    }
    console.log('[createChannel] '+ newChannel)
    channels = [...channels, {
      channelName: newChannel.channelName,
      channelType: newChannel.channelType,
      password: newChannel.password,
      number_of_users: 0,
      participants: [],
      messages: [],
    }]
    this.state.channels = channels
    this.updateServer()
  }

  handleChannelClick(id, password) {
    if (this.state.username === null || this.state.username === "") {
      alert('Enter a username first');
      return
    }

    let ch = this.state.channels.find(c => {
      if (c.channelName === id) {
        if(c.channelType === 'private') {
          if(c.password !== password) {
            alert('Wrong Password! Try Again!')
            return
          }
        }

        if (this.state.channel != null) {
          let channels = this.state.channels
          channels.find((c, index) => {
            if (c.channelName === this.state.channel.channelName) {
              c.number_of_users--
              c.participants = c.participants.filter(p => p.socketid !== this.state.socket.id)
              channels[index] = c
            }
          });
          this.state.channels = channels
          this.state.channel = null
          this.state.messages = []
          this.setState(this.state);
        }

        c.number_of_users++
        c.participants.push({ socketid: this.state.socket.id, username: this.state.username });
        return true
      }
      return false
    });
    if(ch) {
      this.setState({
        socket: this.state.socket,
        username: this.state.username,
        channels: this.state.channels,
        channel: ch,
        messages: []
      });
      this.updateServer();
      this.state.socket.emit('channel-join', ch, ack => {
        console.log("joined channel" + ch);
      })
    }
  }

  handleNameClick(name) {
    this.setState({
      "socket": this.state.socket,
      "username": name,
      "channels": this.state.channels,
      "channel": this.state.channel,
      "messages": this.state.messages,
    });
    console.log('Setting username: ' + name);
  }

  handleMessageClick(message) {
    if(!this.state.isBroadcast) {
      if (this.state.channel === null) {
        alert('Join a channel')
        return
      }
      this.state.socket.emit('send-message', { channel: this.state.channel, message: message, senderName: this.state.username, isFileAttached: this.state.isFileAttached, file: this.state.file })
    } else {
      this.state.socket.emit('send-message', { channel: {channelName: "__broadcast"}, message: message, senderName: this.state.username, isFileAttached: this.state.isFileAttached, file: this.state.file })
    }
    this.setState({
      isFileAttached: false,
      file: null
    })
    console.log('Message sent to the server');
  }

  deleteChannel(oldChannel) {
    let ch = this.state.channels.find(c => {
      if(c.channelName === oldChannel) {
        if(this.state.channel && this.state.channel.channelName === oldChannel) {
          if(c.number_of_users > 1) {
            alert('You are not alone in the channel.')
            return false
          } else {
            console.log('[deleteChannel] '+ oldChannel)
            let channels = this.state.channels.filter(ch => ch.channelName !== oldChannel)
            this.state.channels = channels
            this.setState(this.state)
            this.updateServer()
          }
        } else if(c.number_of_users>0) {
          alert('There are people in there. Let them chat!!')
          return false
        } else {
          console.log('[deleteChannel] '+ oldChannel)
          let channels = this.state.channels.filter(ch => ch.channelName !== oldChannel)
          this.state.channels = channels
          this.setState(this.state)
          this.updateServer()
        }
        return true
      }
      return false
    })
  }

  updateServer() {
    fetch('http://localhost:8000/updateChannels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels: this.state.channels })
    })
      .then(res => {
        if (res.status >= 400) {
          throw new Error("Bad response from server" + res.status)
        } return res.json()
      })
      .then(
        result => {
          if (result.status === "OK") console.log("Server udpated")
          else console.log("Server updation failed")
        }
      )
  }

  handleBroadcastStatus(event) {
    this.setState({isBroadcast: event.target.checked});
  }

  handleFileSelect(event) {
    this.setState({
      isFileAttached: true,
      file: event.target.files[0]
    })
    console.log('[handleFileSelect] '+ event.target.files[0])
  }
  render() {
    return (
      <>
        <TopLabel handleChange = {this.handleBroadcastStatus}/>
        <Container style={{ margin: '0 0 0 0', maxWidth: '100vw', overflow: 'hidden', padding: '0px 10px' }}>
          <Row>
            <Col style={{ paddingRight: "0px", paddingBottom: "0px"}}><Channels createChannel={this.createChannel} deleteChannel={this.deleteChannel} channels={this.state.channels} joinedChannel={this.state.channel? this.state.channel.channelName: null} handleChannelClick={this.handleChannelClick}></Channels></Col>
            <Col xs={9}><ChatBox handleNameClick={this.handleNameClick} handleMessageClick={this.handleMessageClick} handleFileSelect={this.handleFileSelect} socketid={this.state.socket.id} messages={this.state.messages}></ChatBox></Col>
          </Row>
        </Container>
      </>
    )
  }
}

export default App;
