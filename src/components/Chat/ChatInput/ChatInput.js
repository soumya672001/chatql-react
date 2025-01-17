import React, { Component } from 'react';
import AuthContext from '../../../AuthContext';
import { createMessage } from '../../../mutationHelper';
import './ChatInput.css';

const userAccessToken = process.env.REACT_APP_META_TOKEN;
/*const secrets = JSON.parse(process.env.secrets);
console.log(secrets);
const userAccessToken = secrets["REACT_APP_META_TOKEN"];*/
const phoneNumberId = '103105045769273';

class ChatInput extends Component {

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            text: ''
        };
    }

    render() {
        return (
            <div className="chat-input">
                <div className="input-group">
                    <input 
                        type="text" 
                        className="form-control no-focus"
                        required placeholder="Type a Message"
                        value={this.state.text}
                        onKeyUp={this.onKeyUp} 
                        onChange={(e,t) => { this.setState({text: e.target.value}) }} 
                    />
                    <span className="input-group-btn">
                    <button className="btn btn-dark" onClick={this.createNewMessage} type="button">
                        Send&nbsp;<i className='ion-chatbubble-working'></i>
                    </button>
                    </span>
                </div>
            </div>
        );
    }

    createNewMessage = async () => {
        const username = this.context.username;
        if (!this.props.conversation.name.includes('and')) {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${userAccessToken}`);
		myHeaders.append("Content-Type", "application/json");

		var raw = JSON.stringify({
		  "messaging_product": "whatsapp",
		  "preview_url": false,
		  "recipient_type": "individual",
		  "to": `${this.props.conversation.name}`,
		  "type": "text",
		  "text": {
			"body": `${this.state.text}`
		  }
		});

		var requestOptions = {
		  method: 'POST',
		  headers: myHeaders,
		  body: raw,
		  redirect: 'follow'
		};

		fetch(`https://graph.facebook.com/v13.0/${phoneNumberId}/messages`, requestOptions)
		  .then(response => response.text())
		  .then(async result => {
		  	console.log(result)
			await createMessage({
				content: this.state.text,
				authorId: username,
				messageConversationId: this.props.conversation.id
			});
			this.setState({ text: '' });		  	
		  })
		  .catch(error => console.log('error', error));        
        }
    }

    onKeyUp = (e) => {
        // enter
        if (e.keyCode === 13) {
            this.createNewMessage()
        }
    }
}

export default ChatInput;
